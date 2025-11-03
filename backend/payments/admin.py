from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['user', 'amount', 'currency', 'status', 'gateway', 'payment_method', 'created_at']
    list_filter = ['status', 'gateway', 'payment_method', 'created_at']
    search_fields = ['user__email', 'gateway_payment_id', 'gateway_payment_intent_id']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informações do Pagamento', {
            'fields': ('user', 'subscription', 'amount', 'currency', 'status')
        }),
        ('Gateway', {
            'fields': ('gateway', 'payment_method', 'gateway_payment_id', 'gateway_payment_intent_id')
        }),
        ('Datas', {
            'fields': ('paid_at', 'failed_at', 'created_at', 'updated_at')
        }),
        ('Detalhes', {
            'fields': ('failure_message', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def has_add_permission(self, request):
        # Pagamentos não devem ser criados manualmente
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Pagamentos não devem ser deletados
        return False
