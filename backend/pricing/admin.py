from django.contrib import admin
from .models import PricingRule

@admin.register(PricingRule)
class PricingRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'rule_type', 'is_active', 'created_at']
    list_filter = ['rule_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informações da Regra', {
            'fields': ('name', 'description', 'rule_type', 'is_active')
        }),
        ('Parâmetros', {
            'fields': ('parameters',)
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
