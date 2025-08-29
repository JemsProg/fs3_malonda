from django.urls import path
from . import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    #Authenticaion
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), #refresh login
    path('register/', views.register_user, name="register_user" ),
    path('logout/', views.logout_user, name="logout_user" ),
    path('profile/', views.profile_view, name="profile_view" ),



    # Products
    path('products/', views.get_products, name='products'),
    path('products/<int:pk>/', views.get_product_details, name='product_details'),

    # Cart
    path('cart/', views.read_cart, name='read_cart'),
    path('cart/add/', views.add_to_cart, name='add_to_cart'),
    path('cart/update/<int:pk>/', views.update_cart, name='update_cart'),
    path('cart/remove/<int:pk>/', views.remove_from_cart, name='remove_from_cart'),
]
