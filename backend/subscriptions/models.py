from django.db import models
from django.conf import settings

class Plan(models.Model):
    """Planos de assinatura"""
    BILLING_PERIOD_CHOICES = [
        ('monthly', 'Mensal'),
        ('quarterly', 'Trimestral'),
        ('yearly', 'Anual'),
    ]
    
    name = models.CharField(max_length=100, verbose_name='Nome')
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Preço')
    billing_period = models.CharField(max_length=20, choices=BILLING_PERIOD_CHOICES, default='monthly')
    
    # Features
    max_users = models.IntegerField(default=1, verbose_name='Máx. usuários')
    max_projects = models.IntegerField(default=1, verbose_name='Máx. projetos')
    features = models.JSONField(default=list, blank=True, verbose_name='Features')
    
    # Stripe/Mercado Pago IDs
    stripe_price_id = models.CharField(max_length=255, blank=True)
    mercadopago_plan_id = models.CharField(max_length=255, blank=True)
    
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text='Ordem de exibição')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - R$ {self.price}/{self.get_billing_period_display()}"
    
    class Meta:
        verbose_name = 'Plano'
        verbose_name_plural = 'Planos'
        ordering = ['order', 'price']


class Subscription(models.Model):
    """Assinaturas dos usuários"""
    STATUS_CHOICES = [
        ('trialing', 'Período de Teste'),
        ('active', 'Ativa'),
        ('past_due', 'Pagamento Pendente'),
        ('canceled', 'Cancelada'),
        ('unpaid', 'Não Paga'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='subscriptions')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trialing')
    
    # Datas
    start_date = models.DateTimeField(auto_now_add=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    trial_end = models.DateTimeField(null=True, blank=True)
    canceled_at = models.DateTimeField(null=True, blank=True)
    
    # IDs externos
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    mercadopago_subscription_id = models.CharField(max_length=255, blank=True)
    
    # Preço congelado
    price_at_subscription = models.DecimalField(max_digits=10, decimal_places=2)
    
    auto_renew = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.get_status_display()})"
    
    @property
    def is_active(self):
        return self.status in ['trialing', 'active']
    
    class Meta:
        verbose_name = 'Assinatura'
        verbose_name_plural = 'Assinaturas'
        ordering = ['-created_at']
