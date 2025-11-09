from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

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

class Empresa(models.Model):#cria uma tabela empresa
    
    #Aqui cria a empresa do usuário, todos os outros cadastros vão se ligar a essa empresa, dessa forma, conseguimos limitar os acessos.

    #cria os campos da tabela
    nome_fantasia = models.CharField(max_length=255, verbose_name="Nome Fantasia")
    razao_social = models.CharField(max_length=255, blank=True, verbose_name="Razão Social")
    cnpj = models.CharField(max_length=18, blank=True, unique=True, null=True, verbose_name="CNPJ")
    telefone = models.CharField(max_length=20, blank=True, verbose_name="Telefone")
    endereco = models.CharField(max_length=255, blank=True, verbose_name="Endereço")
    email = models.CharField(max_length=100, blank=True,verbose_name='Email da empresa')

    # O "dono" principal da conta
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='owned_empresas',
        verbose_name="Proprietário da Conta"
    )
    created_at = models.DateTimeField(auto_now_add=True)#campos de data de criacao
    updated_at = models.DateTimeField(auto_now=True)#campos de data de atualização

    class Meta:
        verbose_name = "Empresa (Tenant)"
        verbose_name_plural = "Empresas (Tenants)"
        ordering = ['nome_fantasia']
    
    def __str__(self):
        return self.nome_fantasia
