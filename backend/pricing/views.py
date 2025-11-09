# Em backend/pricing/views.py
from rest_framework import viewsets, permissions
from .models import Produto, Composicao
from .serializers import ProdutoSerializer, ComposicaoSerializer

class ProdutoViewSet(viewsets.ModelViewSet):
    """
    API para o CRUD (Cadastro) de Produtos, Matérias-Primas e Serviços.
    """
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAuthenticated] # Só usuários logados

    def get_queryset(self):
        """
        Filtra a lista de produtos para mostrar APENAS
        os que pertencem à empresa do usuário logado.
        """
        # Busca a primeira empresa ligada ao usuário
        empresa = self.request.user.owned_empresas.first()
        if not empresa:
            # Se não tem empresa, não retorna nada
            return Produto.objects.none()
        
        # Retorna só os produtos desta empresa
        return Produto.objects.filter(empresa=empresa)

    def perform_create(self, serializer):
        """
        Ao salvar um novo produto (POST), preenche automaticamente
        o campo 'empresa' com a empresa do usuário logado.
        """
        empresa = self.request.user.owned_empresas.first()
        serializer.save(empresa=empresa)

    def get_serializer_context(self):
        """
        Envia o objeto 'request' (que contém o usuário)
        para dentro do serializer, para que a validação
        customizada do SKU funcione.
        """
        return {'request': self.request}


class ComposicaoViewSet(viewsets.ModelViewSet):
    """
    API para o CRUD (Cadastro) de Composições (Receitas).
    """
    serializer_class = ComposicaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filtra a lista de receitas para mostrar APENAS
        as que pertencem à empresa do usuário logado.
        """
        empresa = self.request.user.owned_empresas.first()
        if not empresa:
            return Composicao.objects.none()
        return Composicao.objects.filter(empresa=empresa)

    def perform_create(self, serializer):
        """
        Ao salvar uma nova receita (POST), preenche automaticamente
        o campo 'empresa' com a empresa do usuário logado.
        """
        empresa = self.request.user.owned_empresas.first()
        serializer.save(empresa=empresa)