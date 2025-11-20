.PHONY: help build up down restart logs

help:
	@echo "📋 Comandos disponíveis:"
	@echo "  make build           - Build de todos os containers"
	@echo "  make up              - Inicia todos os serviços"
	@echo "  make down            - Para todos os serviços"
	@echo "  make restart         - Reinicia todos os serviços"
	@echo "  make logs            - Mostra logs de todos os serviços"
	@echo "  make logs-backend    - Logs do backend"
	@echo "  make logs-frontend   - Logs do frontend"
	@echo "  make shell-backend   - Django shell"
	@echo "  make migrate         - Aplicar migrações"
	@echo "  make createsuperuser - Criar superusuário"

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

shell-backend:
	docker compose exec backend python manage.py shell

migrate:
	docker compose exec backend python manage.py migrate

makemigrations:
	docker compose exec backend python manage.py makemigrations

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

ps:
	docker compose ps

clean:
	docker compose down -v
