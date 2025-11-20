from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Empresa

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    has_company = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                  'company_name', 'phone', 'created_at', 'has_company']
        read_only_fields = ['id', 'created_at', 'has_company']
    
    def get_has_company(self, obj):
        return Empresa.objects.filter(owner=obj).exists()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 
                  'first_name', 'last_name', 'company_name', 'phone']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'nome_fantasia', 'razao_social', 'cnpj', 'telefone', 
                  'endereco', 'email', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Automatically set owner to current user
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
