# Em backend/pricing/models.py
from django.db import models
from users.models import Empresa # Importe o modelo Empresa do Passo 1

class Produto(models.Model):
    """
    Produtos, Matérias-Primas e Serviços da Empresa-Cliente.
    Este é o cadastro central de 'itens'.
    """
    TIPO_CHOICES = [
        ('MP', 'Matéria-Prima'),
        ('PA', 'Produto Acabado'),
        ('SV', 'Serviço'),
        ('SB', 'Sub-produto/Intermediário'), # Item que é produzido E usado em outra composição
    ]

    # Chave estrangeira ligando este produto à empresa dona dele
    empresa = models.ForeignKey(
        Empresa, 
        on_delete=models.CASCADE, 
        related_name='produtos',
        verbose_name="Empresa"
    )

    nome = models.CharField(max_length=255, verbose_name="Nome do Item")
    codigo_sku = models.CharField(max_length=100, blank=True, verbose_name="Código (SKU)")
    tipo = models.CharField(max_length=2, choices=TIPO_CHOICES, verbose_name="Tipo de Item")
    unidade_medida = models.CharField(max_length=20, verbose_name="Unidade de Medida") # ex: 'kg', 'm', 'un', 'h' (hora)

    # Preço de Custo (usado para Matérias-Primas e Serviços)
    preco_custo = models.DecimalField(
        max_digits=10, 
        decimal_places=4, 
        default=0.0,
        verbose_name="Preço de Custo"
    )

    is_active = models.BooleanField(default=True, verbose_name="Está Ativo?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Produto/Item"
        verbose_name_plural = "Produtos/Itens"
        ordering = ['nome']
        # Garante que um SKU não se repita DENTRO da mesma empresa
        unique_together = ('empresa', 'codigo_sku')

    def __str__(self):
        return f"{self.nome} ({self.unidade_medida})" # Corrigido de get_unidade_medida_display


class Composicao(models.Model):
    """
    A "Receita" ou "Ficha Técnica" de um Produto Acabado ou Sub-produto.
    """
    empresa = models.ForeignKey(
        Empresa, 
        on_delete=models.CASCADE, 
        related_name='composicoes',
        verbose_name="Empresa"
    )

    # O produto final que esta receita define
    produto_acabado = models.OneToOneField(
        Produto, 
        on_delete=models.CASCADE, 
        related_name='composicao', 
        verbose_name="Produto Acabado",
        # Limita a escolha para itens que NÃO são Matéria-Prima Pura
        limit_choices_to=~models.Q(tipo='MP') 
    )

    descricao = models.CharField(max_length=255, blank=True, verbose_name="Descrição")

    # Custo fixo (ex: custo de setup de máquina para este produto)
    custo_adicional_fixo = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.0,
        verbose_name="Custo Fixo Adicional"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Composição (Receita)"
        verbose_name_plural = "Composições (Receitas)"
        # Garante que um produto só tenha uma composição
        unique_together = ('empresa', 'produto_acabado')

    def __str__(self):
        return f"Composição de {self.produto_acabado.nome}"


class ItemComposicao(models.Model):
    """
    Os itens (MPs, Serviços, Sub-produtos) que formam a Receita.
    """
    # Liga este item à "Receita" principal
    composicao = models.ForeignKey(
        Composicao, 
        on_delete=models.CASCADE, 
        related_name='itens',
        verbose_name="Composição"
    )

    # O componente (ex: 0.5kg de Farinha)
    componente = models.ForeignKey(
        Produto, 
        on_delete=models.PROTECT, # PROTECT impede deletar um item se ele estiver em uma receita
        related_name='usado_em',
        verbose_name="Componente"
    )

    # Quantidade do componente usada (ex: 0.5)
    quantidade = models.DecimalField(
        max_digits=10, 
        decimal_places=4,
        verbose_name="Quantidade"
    )

    class Meta:
        verbose_name = "Item da Composição"
        verbose_name_plural = "Itens da Composição"
        # Garante que um componente não se repita na mesma receita
        unique_together = ('composicao', 'componente')

    def __str__(self):
        return f"{self.quantidade} x {self.componente.nome}"