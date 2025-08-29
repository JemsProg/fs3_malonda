from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Product, CartUser


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", 
        queryset=Product.objects.all(), 
        write_only=True
    )

    class Meta:
        model = CartUser
        fields = ['cart_id', 'product', 'product_id', 'qty']
        

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, validators= [UniqueValidator(queryset=User.objects.all())])
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']