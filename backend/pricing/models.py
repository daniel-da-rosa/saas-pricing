from django.db import models

class PricingRule(models.Model):
    """Regras de cálculo de pricing customizado"""
    RULE_TYPE_CHOICES = [
        ('discount', 'Desconto'),
        ('markup', 'Acréscimo'),
        ('custom', 'Cálculo Customizado'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    rule_type = models.CharField(max_length=20, choices=RULE_TYPE_CHOICES)
    
    # Parâmetros do cálculo (JSON flexível)
    parameters = models.JSONField(default=dict, help_text='Parâmetros do cálculo')
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Regra de Pricing'
        verbose_name_plural = 'Regras de Pricing'
