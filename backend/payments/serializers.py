from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'user', 'user_email', 'subscription', 'amount', 'currency',
                  'status', 'gateway', 'payment_method', 'paid_at', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
