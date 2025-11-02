#!/bin/bash
set -e

echo "⏳ Aguardando PostgreSQL..."
until pg_isready -h postgres -U saas_user; do
  sleep 1
done

echo "✅ PostgreSQL pronto!"

echo "🔄 Aplicando migrações..."
python manage.py migrate --noinput

echo "📦 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput --clear || true

echo "👤 Criando superusuário..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@saas.local', 'admin123')
    print('✅ Superusuário criado: admin/admin123')
else:
    print('ℹ️  Superusuário já existe')
" || true

echo "🚀 Iniciando servidor..."
exec "$@"
