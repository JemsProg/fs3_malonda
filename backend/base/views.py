from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status

from .models import Product, CartUser
from .serializer import ProductSerializer, CartSerializer, RegisterSerializer, UserSerializer


# -------------------
# Authentication Views
# -------------------
@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User Registered Succesfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout_user(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out succesfully'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({'error': 'Invalid Refresh Token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)



# -------------------
# Product Views
# -------------------
@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_product_details(request, pk):
    product = get_object_or_404(Product, pk=pk)
    serializer = ProductSerializer(product)
    return Response(serializer.data)


# -------------------
# Cart Views
# -------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def read_cart(request):
    cart_items = CartUser.objects.filter(user=request.user)
    serializer = CartSerializer(cart_items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    serializer = CartSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)  # enforce logged-in user
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart(request, pk):
    cart_item = get_object_or_404(CartUser, pk=pk, user=request.user)
    serializer = CartSerializer(cart_item, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save(user=request.user)  # enforce ownership
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, pk):
    cart_item = get_object_or_404(CartUser, pk=pk, user=request.user)
    cart_item.delete()
    return Response({"detail": "Item removed from cart"}, status=status.HTTP_204_NO_CONTENT)
