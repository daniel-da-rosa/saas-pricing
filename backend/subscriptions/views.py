from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Plan, Subscription
from .serializers import PlanSerializer, SubscriptionSerializer, CreateSubscriptionSerializer

class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lista e detalhes de planos
    """
    queryset = Plan.objects.filter(is_active=True).order_by('order', 'price')
    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    CRUD de assinaturas do usuário
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        plan_id = serializer.validated_data['plan_id']
        plan = Plan.objects.get(id=plan_id)
        
        # Criar assinatura
        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            status='trialing',
            price_at_subscription=plan.price,
            trial_end=timezone.now() + timezone.timedelta(days=7)  # 7 dias de trial
        )
        
        return Response(
            SubscriptionSerializer(subscription).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancelar assinatura
        """
        subscription = self.get_object()
        subscription.status = 'canceled'
        subscription.canceled_at = timezone.now()
        subscription.auto_renew = False
        subscription.save()
        
        return Response({
            'message': 'Assinatura cancelada com sucesso',
            'subscription': SubscriptionSerializer(subscription).data
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Retorna assinatura ativa do usuário
        """
        subscription = Subscription.objects.filter(
            user=request.user,
            status__in=['trialing', 'active']
        ).first()
        
        if subscription:
            return Response(SubscriptionSerializer(subscription).data)
        return Response({'message': 'Nenhuma assinatura ativa'}, status=status.HTTP_404_NOT_FOUND)
