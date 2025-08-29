from django.urls import path
from . import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    # authentication
    path('register/', views.register_user, name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_par'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_obtain_par'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.profile_view, name='profile'),

    # prodcuts
    path('products/', views.get_products, name='products'),  
    path('products/<int:pk>/', views.get_product_details, name='product_details'),

    #cart
    path('cart/', views.list_cart_items, name='cart_list'),
    path('cart/add/', views.add_to_cart, name='cart_add'),
    path('cart/<int:cart_id>/', views.update_cart_items, name='cart_update'),
    path('cart/<int:cart_id>/delete/', views.remove_cart_item, name='cart_delete'),

    # Payment view ==================
    path("api/payments/create/", views.create_gcash_payment, name="create-gcash-payment"),
    path("api/paymongo/webhook/", views.paymongo_webhook, name="paymongo-webhook"),

    #order view =======================
    path('orders/', views.list_user_orders, name='orders_list'),
    path('orders/<int:pk>/', views.get_order_detail, name='order_detail'),
]
