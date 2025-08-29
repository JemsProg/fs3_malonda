from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Product, CartUser, ShippingAddress, OrderItem, PaymenMethod

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[ UniqueValidator(queryset=User.objects.all()) ]
    )
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


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product',
        queryset=Product.objects.all(),
        write_only=True
    )

    class Meta:
        model = CartUser
        fields = ['cart_id', 'product', 'product_id', 'qty']

class CheckoutSerializer(serializers.Serializer):
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    full_name = serializers.CharField(max_length=255)
    address = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    mobile = serializers.CharField(max_length=15, required=False)

    
class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ['shipping_id', 'full_name', 'address', 'city', 'postal_code', 'country']


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['order_id', 'product', 'qty', 'price', 'line_total']

    def get_line_total(self, obj):
        # qty * price
        return obj.qty * obj.price


class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    shipping = serializers.SerializerMethodField()

    class Meta:
        model = PaymenMethod
        fields = [
            'payment_id',
            'total_price',
            'is_paid',
            'paid_at',
            'paymongo_payment_id',
            'paymongo_status',
            'items',
            'shipping',
        ]

    def get_items(self, obj):
        qs = obj.orderitem_set.select_related('product').all()
        return OrderItemSerializer(qs, many=True).data

    def get_shipping(self, obj):
        addr = obj.shippingaddress_set.first()
        return ShippingAddressSerializer(addr).data if addr else None