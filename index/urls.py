from django.conf.urls import url
from .views import *
from django.urls import path

urlpatterns = [
    url(r'^login/$', login_views, name='login'),
    url(r'^register/$', register_views, name='reg'),
    path('check_uphone/', check_uphone_views),
    path('', index_views, name='index'),
    path('check_login/', check_login_views),
    path('logout/', logout_views),
    path('goods_show/', goods_show_views),
    path('add_cart/', add_cart_views),
    path('cart_goods/', cart_goods_view),
    path('cart/', cart_views),
    path('mycart/', mycart_views),
    path('rm_cart/', rm_cart_views),
]
