from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'company_name', 'is_staff', 'created_at']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'created_at']
    search_fields = ['email', 'username', 'company_name', 'phone']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informações Adicionais', {
            'fields': ('phone', 'company_name', 'stripe_customer_id', 'mercadopago_customer_id')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
