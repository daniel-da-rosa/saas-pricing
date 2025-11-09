# Em backend/pricing/serializers.py
from rest_framework import serializers
from .models import Produto, Composicao, ItemComposicao

class ProdutoSerializer(serializers.ModelSerializer):
    """
    Traduz o modelo Produto para JSON e valida os dados
    que vêm do frontend.
    """
    class Meta:
        model = Produto
        fields = [
            'id', 'empresa', 'nome', 'codigo_sku', 'tipo', 
            'unidade_medida', 'preco_custo', 'is_active'
        ]
        # A 'empresa' será preenchida automaticamente pela view,
        # então o frontend não precisa enviá-la.
        read_only_fields = ['empresa']

    def validate_codigo_sku(self, value):
        """
        Validação customizada: Garante que o SKU é único
        *dentro* da empresa do usuário.
        """
        request = self.context.get('request')
        if not request:
            return value # Não pode validar sem o request

        empresa = request.user.owned_empresas.first()
        if not empresa:
            raise serializers.ValidationError("Usuário não tem empresa.")
        
        # Pega o ID do produto que está sendo atualizado (se for um PUT/PATCH)
        instance_id = self.instance.id if self.instance else None
        
        query = Produto.objects.filter(empresa=empresa, codigo_sku=value)
        
        # Se estiver atualizando, exclua o próprio objeto da verificação
        if instance_id:
            query = query.exclude(id=instance_id)

        # Se outro produto com este SKU já existe, levante um erro.
        if query.exists():
            raise serializers.ValidationError(f"Já existe um produto com este SKU ({value}) na sua empresa.")
        return value

# --- Serializers de Composição (Receita) ---
# Precisamos de serializers "aninhados" para salvar a receita e seus itens

class ItemComposicaoSerializer(serializers.ModelSerializer):
    """Tradutor para os 'ingredientes' da receita"""
    class Meta:
        model = ItemComposicao
        fields = ['id', 'componente', 'quantidade']
        read_only_fields = ['id']

class ComposicaoSerializer(serializers.ModelSerializer):
    """Tradutor para a 'Receita' principal e seus ingredientes"""
    
    # Campo aninhado: mostra os 'itens' (ingredientes) juntos
    itens = ItemComposicaoSerializer(many=True)

    class Meta:
        model = Composicao
        fields = [
            'id', 'empresa', 'produto_acabado', 'descricao', 
            'custo_adicional_fixo', 'itens' # 'itens' é o campo aninhado
        ]
        read_only_fields = ['empresa']
    
    def create(self, validated_data):
        """
        Lógica customizada para criar a Composição E seus Itens aninhados
        """
        # 1. Separa os dados dos 'itens' (ingredientes)
        itens_data = validated_data.pop('itens')
        
        # 2. Cria a 'Composição' (a receita principal)
        composicao = Composicao.objects.create(**validated_data)
        
        # 3. Cria cada 'Item' (ingrediente) e liga à receita
        for item_data in itens_data:
            ItemComposicao.objects.create(composicao=composicao, **item_data)
        
        return composicao

    def update(self, instance, validated_data):
        """
        Lógica customizada para atualizar a Composição E seus Itens
        """
        # Separa os dados dos 'itens' (se eles foram enviados)
        itens_data = validated_data.pop('itens', None)
        
        # 1. Atualiza os campos simples da Composição (ex: 'descricao')
        instance = super().update(instance, validated_data)

        # 2. Lógica para atualizar/criar/deletar os itens da receita
        if itens_data is not None:
            # Abordagem simples: apaga todos os itens antigos
            instance.itens.all().delete() 
            # E cria os novos que vieram do frontend
            for item_data in itens_data:
                ItemComposicao.objects.create(composicao=instance, **item_data)
        
        return instance