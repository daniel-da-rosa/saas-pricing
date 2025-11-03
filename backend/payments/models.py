from django.db import models
from django.conf import settings

class Payment(models.Model):
    """Histórico de pagamentos"""
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('processing', 'Processando'),
        ('succeeded', 'Sucesso'),
        ('failed', 'Falhou'),
        ('refunded', 'Reembolsado'),
    ]
    
    GATEWAY_CHOICES = [
        ('stripe', 'Stripe'),
        ('mercadopago', 'Mercado Pago'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey('subscriptions.Subscription', on_delete=models.SET_NULL, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='BRL')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES)
    
    # IDs externos
    gateway_payment_id = models.CharField(max_length=255, unique=True)
    gateway_payment_intent_id = models.CharField(max_length=255, blank=True)
    
    # Metadata
    payment_method = models.CharField(max_length=50, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    paid_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    failure_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - R$ {self.amount} ({self.get_status_display()})"
    
    class Meta:
        verbose_name = 'Pagamento'
        verbose_name_plural = 'Pagamentos'
        ordering = ['-created_at']
