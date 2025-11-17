# Em backend/pricing/serializers.py
from rest_framework import serializers
from .models import Produto, Composicao, ItemComposicao, TipoProduto, UnidadeMedida

class ProdutoSerializer(serializers.ModelSerializer):
    """
    Traduz o modelo Produto para JSON e valida os dados
    que vêm do frontend.
    """
    # Campos extras para leitura (retorna o objeto completo)
    tipo_nome = serializers.SerializerMethodField()
    unidade_medida_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = Produto
        fields = [
            'id', 'empresa', 'nome', 'codigo_sku', 'tipo', 
            'unidade_medida', 'preco_custo', 'is_active',
            'tipo_nome', 'unidade_medida_nome','marca','peso_bruto','peso_liquido','referencia'  # Campos extras
        ]
        read_only_fields = ['empresa', 'tipo_nome', 'unidade_medida_nome']
    
    def get_tipo_nome(self, obj):
        """Retorna o nome do tipo para exibição"""
        return obj.tipo.nome if obj.tipo else None
    
    def get_unidade_medida_nome(self, obj):
        """Retorna a sigla da unidade para exibição"""
        return obj.unidade_medida.sigla if obj.unidade_medida else None

    def validate_codigo_sku(self, value):
        """
        Validação customizada: Garante que o SKU é único
        *dentro* da empresa do usuário.
        """
        request = self.context.get('request')
        if not request:
            return value

        empresa = request.user.owned_empresas.first()
        if not empresa:
            raise serializers.ValidationError("Usuário não tem empresa.")
        
        instance_id = self.instance.id if self.instance else None
        
        query = Produto.objects.filter(empresa=empresa, codigo_sku=value)
        
        if instance_id:
            query = query.exclude(id=instance_id)

        if query.exists():
            raise serializers.ValidationError(f"Já existe um produto com este SKU ({value}) na sua empresa.")
        return value


# --- Serializers de Composição (Receita) ---

class ItemComposicaoSerializer(serializers.ModelSerializer):
    """Tradutor para os 'ingredientes' da receita"""
    class Meta:
        model = ItemComposicao
        fields = ['id', 'componente', 'quantidade']
        read_only_fields = ['id']


class ComposicaoSerializer(serializers.ModelSerializer):
    """Tradutor para a 'Receita' principal e seus ingredientes"""
    
    itens = ItemComposicaoSerializer(many=True)

    class Meta:
        model = Composicao
        fields = [
            'id', 'empresa', 'produto_acabado', 'descricao', 
            'custo_adicional_fixo', 'itens'
        ]
        read_only_fields = ['empresa']
    
    def create(self, validated_data):
        """
        Lógica customizada para criar a Composição E seus Itens aninhados
        """
        itens_data = validated_data.pop('itens')
        composicao = Composicao.objects.create(**validated_data)
        
        for item_data in itens_data:
            ItemComposicao.objects.create(composicao=composicao, **item_data)
        
        return composicao

    def update(self, instance, validated_data):
        """
        Lógica customizada para atualizar a Composição E seus Itens
        """
        itens_data = validated_data.pop('itens', None)
        instance = super().update(instance, validated_data)

        if itens_data is not None:
            instance.itens.all().delete() 
            for item_data in itens_data:
                ItemComposicao.objects.create(composicao=instance, **item_data)
        
        return instance


class TipoProdutoSerializer(serializers.ModelSerializer):
    """Serializer do tipo de produto"""
    class Meta:
        model = TipoProduto
        fields = ['id', 'nome', 'tipo']


class UnidadeMedidaSerializer(serializers.ModelSerializer):
    """Serializa a unidade de medida"""
    class Meta:
        model = UnidadeMedida
        fields = ['id', 'nome', 'sigla']