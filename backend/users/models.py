from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """User model customizado"""
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    
    # Stripe/Mercado Pago IDs
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    mercadopago_customer_id = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
