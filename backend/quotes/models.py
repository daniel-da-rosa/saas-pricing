# Em backend/quotes/models.py
from django.db import models
from users.models import Empresa
from pricing.models import Produto

class Orcamento(models.Model):
    """
    O "Objeto" principal. É o cabeçalho do orçamento e
    onde fica a "Aba de Totais".
    """
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('sent', 'Enviado'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado'),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='orcamentos')
    produto_base = models.ForeignKey(Produto, on_delete=models.PROTECT, verbose_name="Produto Base")
    quantidade = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)

    descricao = models.CharField(max_length=255, blank=True, verbose_name="Descrição do Orçamento")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    # --- ABA DE TOTAIS (Calculados) ---
    # Estes campos são atualizados pelo seu "serviço"
    # sempre que um item nas outras abas é salvo.
    custo_total_materias_primas = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    custo_total_processos = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    custo_total_despesas_impostos = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    custo_total_producao = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    margem_lucro_percentual = models.DecimalField(max_digits=5, decimal_places=2, default=20.0) # Ex: 20%

    preco_venda_calculado = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    preco_venda_final = models.DecimalField(max_digits=12, decimal_places=2, default=0.0) # Preço final (pode ser ajustado manualmente)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Orçamento"
        verbose_name_plural = "Orçamentos"
        ordering = ['-created_at']

    def __str__(self):
        return f"Orçamento #{self.id} - {self.produto_base.nome}"


class OrcamentoItemProduto(models.Model):
    """
    A "Aba de Composição" deste orçamento específico.
    É uma cópia editável dos itens da 'Composicao' original.
    """
    orcamento = models.ForeignKey(Orcamento, on_delete=models.CASCADE, related_name='itens_produto')

    # O produto/componente original (para referência)
    componente = models.ForeignKey(Produto, on_delete=models.PROTECT, verbose_name="Componente")

    # Campos copiados E EDITÁVEIS
    descricao = models.CharField(max_length=255) # Copiado de Produto.nome
    quantidade = models.DecimalField(max_digits=10, decimal_places=4) # Copiado de ItemComposicao.quantidade
    custo_unitario = models.DecimalField(max_digits=10, decimal_places=4) # Copiado de Produto.preco_custo

    # Campo calculado
    custo_total_item = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    class Meta:
        verbose_name = "Item de Produto do Orçamento"
        ordering = ['id']


class OrcamentoItemProcesso(models.Model):
    """A "Aba de Processos" deste orçamento específico."""

    orcamento = models.ForeignKey(Orcamento, on_delete=models.CASCADE, related_name='itens_processo')

    # Campos editáveis
    descricao = models.CharField(max_length=255, verbose_name="Descrição do Processo")
    horas = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    custo_hora = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    # Campo calculado
    custo_total_item = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    class Meta:
        verbose_name = "Item de Processo do Orçamento"
        ordering = ['id']


class OrcamentoItemDespesaImposto(models.Model):
    """A "Aba de Despesas e Impostos" deste orçamento."""

    TIPO_CHOICES = [
        ('percentual', 'Percentual (%)'),
        ('fixo', 'Valor Fixo (R$)'),
    ]
    BASE_CALCULO_CHOICES = [
        ('custo', 'Sobre Custo Total'),
        ('venda', 'Sobre Preço de Venda'),
    ]

    orcamento = models.ForeignKey(Orcamento, on_delete=models.CASCADE, related_name='itens_despesa_imposto')

    descricao = models.CharField(max_length=255, verbose_name="Descrição")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='percentual')
    base_calculo = models.CharField(max_length=10, choices=BASE_CALCULO_CHOICES, default='custo')
    valor = models.DecimalField(max_digits=10, decimal_places=2, default=0.0) # O % (ex: 18.00) ou o R$ (ex: 50.00)

    # Campo calculado
    custo_total_item = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    class Meta:
        verbose_name = "Item de Despesa/Imposto do Orçamento"
        ordering = ['id']