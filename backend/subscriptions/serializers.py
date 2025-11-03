from rest_framework import serializers
from .models import Plan, Subscription

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'slug', 'description', 'price', 'billing_period',
                  'max_users', 'max_projects', 'features', 'is_active', 'order']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_details = PlanSerializer(source='plan', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'user', 'user_email', 'plan', 'plan_details', 'status',
                  'start_date', 'current_period_start', 'current_period_end',
                  'trial_end', 'price_at_subscription', 'auto_renew', 'is_active']
        read_only_fields = ['id', 'start_date', 'user']


class CreateSubscriptionSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
    
    def validate_plan_id(self, value):
        try:
            plan = Plan.objects.get(id=value, is_active=True)
        except Plan.DoesNotExist:
            raise serializers.ValidationError("Plano não encontrado ou inativo")
        return value
