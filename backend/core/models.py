from django.db import models
from users.models import Empresa

class ContadorSequencia(models.Model):
    """
    Um contador genérico e multi-empresa para qualquer sequência
    na aplicação.
    Ex: 'SKU_PA', 'CLIENTE', 'PROPOSTA_2025'
    """
    
    empresa = models.ForeignKey(
        Empresa, 
        on_delete=models.CASCADE,
        related_name='contadores'
    )
    
    chave = models.CharField(max_length=50)
    
    ultimo_numero = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Contador de Sequência"
        verbose_name_plural = "Contadores de Sequência"
        unique_together = ('empresa', 'chave')
        indexes = [
            models.Index(fields=['empresa', 'chave']),
        ]

    def __str__(self):
        try:
            empresa_nome = self.empresa.nome_fantasia
        except AttributeError:
            empresa_nome = f"Empresa ID {self.empresa_id}"
            
        return f"{self.chave} ({empresa_nome}) = {self.ultimo_numero}"