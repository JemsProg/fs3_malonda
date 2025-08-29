from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

import base64
import requests
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
import json



from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Product, CartUser, PaymenMethod, ShippingAddress, OrderItem
from .serializer import (
    ProductSerializer,
    RegisterSerializer,
    UserSerializer,
    CartItemSerializer,
    CheckoutSerializer,
    OrderSerializer
)


#Products

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products,many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_product_details(request, pk): 
    product = get_object_or_404(Product, pk=pk)
    serializer = ProductSerializer(product)
    return Response(serializer.data)

#======================================================================================

#Register Views
@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message' : 'User Registered Succesfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Logout Views
@api_view(['POST'])
def logout_user(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'error' : 'Logged out succesfully'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({'error': 'Invalid Refresh Token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
    
#================================================================================

#Cart Read
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_cart_items(request):
    items = CartUser.objects.filter(user=request.user)
    serializer = CartItemSerializer(items, many=True)
    return Response(serializer.data)

#Cart Create
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    serializer = CartItemSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.validated_data['product']
        qty = serializer.validated_data['qty']
        cart_item, created = CartUser.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'qty': qty}
        )
        if not created:
            cart_item.qty += qty
            cart_item.save()
        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#cart Update
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_items(request, cart_id):
    cart_item = get_object_or_404(CartUser, pk=cart_id, user=request.user)
    serializer = CartItemSerializer(cart_item, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.error, status=status.HTTP_400_BAD_REQUEST)

#Cart Delete
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, cart_id):
    cart_item = get_object_or_404(CartUser, pk=cart_id, user=request.user)
    cart_item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# payment ======================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_gcash_payment(request):
    serializer = CheckoutSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        user = request.user
        
        secret_key = "sk_test_6Wu2UUWNZkq1KqyjxjFNEzvZ"
        encoded_key = base64.b64encode(f"{secret_key}:".encode()).decode()

        headers = {
            "Authorization": f"Basic {encoded_key}",
            "Content-Type": "application/json"
        }

        payload = {
                "data": {
                    "attributes": {
                        "amount": int(data["total_price"] * 100),  # centavos
                        "description": "Order Payment",
                        "remarks": "GCash only",
                        "redirect": {
                            "success": "http://localhost:3000/payment-success",
                            "failed": "http://localhost:3000/payment-failed"
                        },
                        "billing": {
                            "name": data["full_name"],
                            "email": data["email"],
                            "phone": data.get("mobile")
                        },
                        "payment_method_types": ["gcash"]
                    }
                }
            }
        response = requests.post("https://api.paymongo.com/v1/links", headers=headers, json=payload)
        result = response.json()
        
        if "data" in result:
            checkout_url = result["data"]["attributes"]["checkout_url"]
            paymongo_id = result["data"]["id"]
            status_str = result["data"]["attributes"]["status"]

            payment = PaymenMethod.objects.create(
                user=user,
                total_price=data["total_price"],
                is_paid = False,
                paymongo_payment_id =paymongo_id,
                paymongo_status=status_str
            )

            ShippingAddress.objects.create(
                payment=payment,
                full_name=data["full_name"],
                address=data["address"],
                city=data["city"],
                postal_code=data["postal_code"],
                country=data["country"]
            )
            
            return Response({"checkout_url": checkout_url}, status=200)

        return Response({"error": result}, status=400)

    return Response(serializer.errors, status=400)

@csrf_exempt
@api_view(['POST'])
def paymongo_webhook(request):
    try:
        payload = json.loads(request.body)
        event_type = payload.get("data", {}).get("attributes", {}).get("type")

        if event_type == "link.payment.paid":
            paymongo_id  = payload["data"]["attrbutes"]["data"]["id"]

            payment = PaymenMethod.objects.filter(paymongo_payment_id= paymongo_id)

            if payment and not payment.is_paid:
                payment.is_paid = True
                payment.paid_at = now().date()
                payment.paymongo_status = "paid"
                payment.save()

                cart_items = CartUser.objects.filter(user=payment.user)

                for item in cart_items:
                    OrderItem.objects.create(
                        product=item.product,
                        payment=payment,
                        qty=item.qty,
                        price=item.product.product_price
                    )

                cart_items.delete()

                return Response({"message": "Payment confirmed. Order items created."}, status=200)

        return Response({"message": "Webhook received. No action taken."}, status=200)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


#order item =============================================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_orders(request):
    """
    Returns all orders (payments) for the authenticated user,
    with nested items and shipping address.
    """
    payments = (
        PaymenMethod.objects
        .filter(user=request.user)
        .order_by('-payment_id')
        .prefetch_related('orderitem_set__product', 'shippingaddress_set')
    )
    serializer = OrderSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, pk):
    """
    Returns a single order (payment) with items + shipping.
    """
    payment = get_object_or_404(
        PaymenMethod.objects
        .filter(user=request.user)
        .prefetch_related('orderitem_set__product', 'shippingaddress_set'),
        pk=pk
    )
    serializer = OrderSerializer(payment)
    return Response(serializer.data)