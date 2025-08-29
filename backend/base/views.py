
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