
from django.db import models
from django.contrib.auth.models import User


# -----------------
# product
# -----------------
class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=255)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    brand = models.CharField(max_length=255)
    description = models.TextField()
    countInStock = models.IntegerField()
    image = models.ImageField(upload_to='product_images/')
    createdAt = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Product Name: {self.product_name} | Available Stock: {self.countInStock}"


# -----------------
# cartUser (user cart lines)
# -----------------
class CartUser(models.Model):
    cart_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_lines')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_lines')
    qty = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

  

    def __str__(self):
        return f"CartItem #{self.cart_id} - {self.user} x{self.qty} {self.product.product_name}"

# -----------------
# paymentMethod (order header / payment record)
# -----------------
class PaymentMethod(models.Model):
    payment_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='payments')

    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    paymongo_payment_id = models.CharField(max_length=191, null=True, blank=True)
    paymongo_status = models.CharField(max_length=64, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        state = 'PAID' if self.is_paid else 'UNPAID'
        return f"Payment #{self.payment_id} - {self.user} - {state}"

# -----------------
# order_item (items captured at checkout)
# -----------------
class OrderItem(models.Model):
    order_id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='order_items')
    payment = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE, related_name='items')
    qty = models.PositiveIntegerField(default=1)
    # snapshot of price at purchase time
    price = models.DecimalField(max_digits=10, decimal_places=2)



    def __str__(self):
        return f"OrderItem #{self.order_id} - {self.qty} x {self.product.product_name} (Payment #{self.payment_id})"

# -----------------
# shippingAddress (one per payment)
# -----------------
class ShippingAddress(models.Model):
    shipping_id = models.AutoField(primary_key=True)  
    payment = models.OneToOneField(PaymentMethod,on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=128)
    postal_code = models.CharField(max_length=32)
    country = models.CharField(max_length=128)


    def __str__(self):
        return f"{self.full_name} • {self.address}, {self.city} {self.postal_code}, {self.country}"
