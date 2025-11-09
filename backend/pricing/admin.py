# Em backend/pricing/admin.py
from django.contrib import admin
from .models import Produto, Composicao, ItemComposicao # <- Novas importações

# Esta classe "inline" permite que você adicione
# Itens de Composição (ingredientes) diretamente
# dentro da página da Composição (receita). É muito útil.
class ItemComposicaoInline(admin.TabularInline):
    model = ItemComposicao
    extra = 1 # Começa com 1 linha de ingrediente em branco
    autocomplete_fields = ['componente'] # Facilita buscar o produto


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'empresa', 'tipo', 'unidade_medida', 'preco_custo', 'is_active')
    list_filter = ('empresa', 'tipo', 'is_active')
    search_fields = ('nome', 'codigo_sku', 'empresa__nome_fantasia')
    autocomplete_fields = ['empresa']
    ordering = ('nome',)

@admin.register(Composicao)
class ComposicaoAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'empresa', 'custo_adicional_fixo')
    list_filter = ('empresa',)
    search_fields = ('produto_acabado__nome', 'empresa__nome_fantasia')
    
    # Adiciona o inline que definimos acima
    inlines = [ItemComposicaoInline] 
    
    autocomplete_fields = ['empresa', 'produto_acabado']

# Nota: Não precisamos registrar o ItemComposicao separadamente
# porque ele já é gerenciável através do ComposicaoAdmin.