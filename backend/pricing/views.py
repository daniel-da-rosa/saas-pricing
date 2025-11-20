# Em backend/pricing/views.py
from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Produto, Composicao, TipoProduto, UnidadeMedida, Empresa
from .serializers import ProdutoSerializer, ComposicaoSerializer, UnidadeMedidaSerializer, TipoProdutoSerializer

class ProdutoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para o modelo Produto.
    Filtra por empresa no GET e injeta a empresa no POST.
    """
    serializer_class = ProdutoSerializer
    
    def get_queryset(self):
        """
        Esta view SÓ retorna produtos da empresa do usuário logado.
        """
        user = self.request.user
        try:
            # Encontra a empresa que o usuário é dono
            empresa_do_usuario = Empresa.objects.get(owner_id=user.id)
        except Empresa.DoesNotExist:
            # Se não for dono, não retorna nada
            return Produto.objects.none()

        # Filtra os Produtos por essa empresa
        return Produto.objects.filter(empresa=empresa_do_usuario)

    def perform_create(self, serializer):
        """
        Injeta a empresa do usuário logado ANTES de salvar 
        um novo produto.
        """
        user = self.request.user
        try:
            # 1. Encontra a empresa do usuário
            empresa_do_usuario = Empresa.objects.get(owner_id=user.id)
            
            # 2. Injeta a empresa no 'save'
            # Isso garante que 'instance.empresa_id' estará
            # preenchido quando o 'signals.py' rodar.
            serializer.save(empresa=empresa_do_usuario)
            
        except Empresa.DoesNotExist:
            # Lança um erro se o usuário não tiver empresa
            raise ValidationError("O usuário atual não está associado a nenhuma empresa.")
        
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

class TipoProdutoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que lista e cria os Tipos de Produto.
    """
    serializer_class = TipoProdutoSerializer
    
    def get_queryset(self):
        # 1. Pega o usuário logado
        user = self.request.user
        
        try:
            # 2. Encontra a empresa que este usuário é dono
            empresa_do_usuario = Empresa.objects.get(owner_id=user.id)
        except Empresa.DoesNotExist:
            # Se o usuário não for dono de nenhuma, não retorna nada
            return TipoProduto.objects.none()

        # 3. Filtra os Tipos de Produto por essa empresa
        return TipoProduto.objects.filter(empresa=empresa_do_usuario)

    def perform_create(self, serializer):
        """
        Injeta a empresa do usuário logado ANTES de salvar 
        """
        user = self.request.user
        try:
            empresa_do_usuario = Empresa.objects.get(owner_id=user.id)
            serializer.save(empresa=empresa_do_usuario)
        except Empresa.DoesNotExist:
            raise ValidationError("O usuário atual não está associado a nenhuma empresa.")

class UnidadeMedidaViewSet(viewsets.ModelViewSet):
    """
    API endpoint que lista e cria as Unidades de Medida.
    """
    serializer_class = UnidadeMedidaSerializer
    
    def get_queryset(self):
        # 1. Pega o usuário logado
        user = self.request.user
        
        try:
            # 2. Encontra a empresa que este usuário é dono
            empresa_do_usuario = Empresa.objects.get(owner_id=user.id)
        except Empresa.DoesNotExist:
            return UnidadeMedida.objects.none()

        # 3. Filtra as Unidades por essa empresa
        return UnidadeMedida.objects.filter(empresa=empresa_do_usuario)

    def perform_create(self, serializer):
        """
        Injeta a empresa do usuário logado ANTES de salvar 
        """
        user = self.request.user
        try:
            empresa_do_usuario = Empresa.objects.get(owner_id=user.id)
            serializer.save(empresa=empresa_do_usuario)
        except Empresa.DoesNotExist:
            raise ValidationError("O usuário atual não está associado a nenhuma empresa.")