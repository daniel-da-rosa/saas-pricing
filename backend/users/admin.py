# Em backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# Esta linha importa os modelos DO SEU PRÓPRIO app
from .models import User, Empresa 

# --- Registro do User ---
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Define o admin para o modelo User customizado"""
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff')
    search_fields = ('email', 'username')
    ordering = ('email',)
    
    # Adiciona seus campos customizados ao admin
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('phone', 'company_name', 'stripe_customer_id', 'mercadopago_customer_id')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('phone', 'company_name')}),
    )

# --- Registro da Empresa (O que corrige o erro E039 de antes) ---
@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    """Define o admin para o modelo Empresa (Tenant)"""
    list_display = ('nome_fantasia', 'owner', 'cnpj', 'created_at')
    
    # Linha crucial que permite o 'autocomplete' funcionar
    search_fields = ('nome_fantasia', 'cnpj', 'razao_social', 'owner__email')
    
    list_filter = ('created_at',)
    ordering = ('nome_fantasia',)