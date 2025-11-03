from django.contrib import admin
from .models import Plan, Subscription

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'billing_period', 'max_users', 'max_projects', 'is_active', 'order']
    list_filter = ['billing_period', 'is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'price']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'slug', 'description', 'is_active', 'order')
        }),
        ('Preço', {
            'fields': ('price', 'billing_period')
        }),
        ('Limites', {
            'fields': ('max_users', 'max_projects', 'features')
        }),
        ('Integrações', {
            'fields': ('stripe_price_id', 'mercadopago_plan_id'),
            'classes': ('collapse',)
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'start_date', 'current_period_end', 'auto_renew']
    list_filter = ['status', 'auto_renew', 'plan', 'start_date']
    search_fields = ['user__email', 'user__username', 'plan__name']
    date_hierarchy = 'start_date'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Assinatura', {
            'fields': ('user', 'plan', 'status', 'price_at_subscription', 'auto_renew')
        }),
        ('Período', {
            'fields': ('start_date', 'current_period_start', 'current_period_end', 'trial_end', 'canceled_at')
        }),
        ('Integrações', {
            'fields': ('stripe_subscription_id', 'mercadopago_subscription_id'),
            'classes': ('collapse',)
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'start_date']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editando
            return self.readonly_fields + ['user', 'plan', 'start_date']
        return self.readonly_fields
