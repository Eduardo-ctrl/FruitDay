import json

from django.core import serializers
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from .models import *
from .forms import *


# Create your views here.
def login_views(request):
    # form = LoginForm()
    # return render(request, "login.html", locals())

    # 判断 get 请求还是 post 请求
    if request.method == 'GET':
        # 获取来访地址，如果没有则设置为 /
        url = request.META.get('HTTP_REFERER', "/")
        # get 请求 - 判断 session, 判断 cookie, 登录页
        # 先判断 session 中是否有登录信息
        if 'uid' in request.session and 'uphone' in request.session:
            # 有登录信息存在 session
            # 从哪来，回哪去
            resp = HttpResponseRedirect(url)
            return resp
        else:
            # 没有登录信息保存在 session，继续判断 cookies 中是否有登录信息
            if 'uid' in request.COOKIES and 'uphone' in request.COOKIES:
                # cookies 中有登录信息 - 曾经记住过密码
                # 将 cookies 中的信息取出来保存进 session, 再返回到首页
                uid = request.COOKIES['uid']
                uphone = request.COOKIES['uphone']
                request.session['uid'] = uid
                request.session['uphone'] = uphone
                # 从哪来，回哪去
                resp = HttpResponseRedirect(url)
                return resp
            else:
                # cookies 中没有登录信息 - 去往登录页
                form = LoginForm()
                # 将来访地址保存进 cookies 中
                resp = render(request, 'login.html', locals())
                resp.set_cookie('url', url)
                return resp
    else:
        # post 请求 - 实现登录操作
        # 从 cookie 中得到来访地址，如果没有，来访地址设为 /
        if "url" in request.COOKIES:
            url = request.COOKIES['url']
        else:
            url = "/"
        # 获取手机号和密码
        uphone = request.POST['uphone']
        upwd = request.POST['upwd']
        # 判断手机号和密码是否存在(登录是否成功)
        users = User.objects.filter(uphone=uphone, upwd=upwd)
        if users:
            # 登录成功：先存进 session
            request.session['uid'] = users[0].id
            request.session['uphone'] = uphone
            # 声明响应对象：从哪来回哪去
            url = request.COOKIES.get('url', '/')
            resp = HttpResponseRedirect(url)
            # 将 url 从 cookies 中删除出去
            if 'url' in request.COOKIES:
                resp.delete_cookie('url')
            # 判断是否要存进cookies
            if 'isSaved' in request.POST:
                expire = 60 * 60 * 24 * 90
                resp.set_cookie('uid', users[0].id, expire)
                resp.set_cookie('uphone', uphone, expire)
            return resp
        else:
            # 登录失败
            form = LoginForm()
            return render(request, 'login.html', locals())


def register_views(request):
    if request.method == "GET":
        return render(request, "register.html")
    else:
        uphone = request.POST['uphone']
        # 验证手机号在数据库中是否存在
        # users = User.objects.filter(uphone=uphone)
        # if users:
        #     # uphone 已经存在
        #     errMsg = '手机号码已经存在'
        #     # return render(request, 'register.html', locals())
        #     return HttpResponse(errMsg)
        # 接收数据插入到数据库
        user = User()
        user.uphone = uphone
        user.upwd = request.POST['upwd']
        user.uname = request.POST['uname']
        user.uemail = request.POST['uemail']
        user.save()
        # 取出 user 中的 id 和 uphone 的值保存进 session
        request.session['uid'] = user.id
        request.session['uphone'] = user.uphone
        return HttpResponse('POST OK')


# 检查手机号是否已经被注册过
def check_uphone_views(request):
    # 接收前端传递过来的参数 - uphone
    uphone = request.GET['uphone']
    # 验证手机号在数据库中是否存在
    users = User.objects.filter(uphone=uphone)
    if users:
        # uphone 已经存在
        status = 1
        msg = '手机号码已经存在'
    else:
        status = 0
        msg = '通过'

    dic = {
        'status': status,
        'msg': msg
    }
    return HttpResponse(json.dumps(dic))


def index_views(request):
    return render(request, 'index.html')


# 检查 session 中是否有登录信息，如果有，获取对应数据的 uname 值
def check_login_views(request):
    if 'uid' in request.session and 'uphone' in request.session:
        loginStatus = 1
        # 通过 uid 的值获取对应的 uname
        id = request.session['uid']
        uname = User.objects.get(id=id).uname
        dic = {
            'loginStatus': loginStatus,
            'uname': uname,
            'uid': id
        }
        return HttpResponse(json.dumps(dic))
    else:
        dic = {
            'loginStatus': 0
        }
        return HttpResponse(json.dumps(dic))


# 退出
def logout_views(request):
    if 'uid' in request.session and 'uphone' in request.session:
        del request.session['uid']
        del request.session['uphone']
        # 构建响应对象：哪发的退出请求，则返回到哪去
        url = request.META.get('HTTP_REFERER', '/')
        resp = HttpResponseRedirect(url)
        # 判断 cookies 中是否有登录信息，有的话，则删除
        if 'uid' in request.COOKIES and 'uphone' in request.COOKIES:
            resp.delete_cookie('uid')
            resp.delete_cookie('uphone')
        return resp
    return redirect('/')


# 加载所有的商品类型以及对应的每个类型下的前10条数据
def goods_show_views(request):
    all_list = []
    # 加载所有的商品类型
    types = GoodsType.objects.all()
    for type in types:
        type_json = json.dumps(type.to_dict())
        # 获取 type 类型下最新的10条数据
        g_list = type.goods_set.filter(isActive=True).order_by("-id")[0:10]
        # 将 g_list 转换为 json
        g_list_json = serializers.serialize('json', g_list)
        # 将 type_json 和 g_list_json 封装到一个字典中
        dic = {
            "type": type_json,
            "goods": g_list_json,
        }
        # 将 dic 字典追加到 all_list 中
        all_list.append(dic)
    # print(all_list)
    return HttpResponse(json.dumps(all_list))


# 将商品添加至购物车或更新现有商品的数量
def add_cart_views(request):
    # 获取商品id,获取用户id,购买数量默认为1
    goods_id = request.GET["gid"]
    user_id = request.session["uid"]
    cart_list = CartInfo.objects.filter(user_id=user_id, goods_id=goods_id)
    dic = {
        'status': 1,
        'statusText': '更新数量成功',
        'uid': user_id
    }
    if cart_list:
        # 已经有相同用户购买过相同产品了，更新商品数量
        cartinfo = cart_list[0]
        cartinfo.ccount += 1
        cartinfo.save()
    else:
        # 没有对应的用户以及对应的商品
        cart_info = CartInfo()
        cart_info.goods_id = goods_id
        cart_info.user_id = user_id
        cart_info.ccount = 1
        cart_info.save()
        dic['statusText'] = "购物车添加成功"
    return HttpResponse(json.dumps(dic))


# 更新购物车商品数量
def cart_goods_view(request):
    dic = {
        "num": 0
    }
    if "uid" in request.GET:
        uid = request.GET['uid']
        carts_list = CartInfo.objects.filter(user_id=uid)
        dic["num"] = len(carts_list)
    return HttpResponse(json.dumps(dic))


def cart_views(request):
    return render(request, 'cart.html')


# 购物车商品信息
def mycart_views(request):
    user_id = request.GET['uid']
    carts_list = CartInfo.objects.filter(user_id=user_id).order_by("-id")
    C_list = []
    for cart in carts_list:
        print(cart.goods.title, cart.ccount)
        dic = {
            "id": cart.id,
            "goods": cart.goods.to_dict(),
            "ccount": cart.ccount,
        }
        C_list.append(dic)
    return HttpResponse(json.dumps(C_list))


def rm_cart_views(request):
    id = request.GET['id']
    cart = CartInfo.objects.get(id=id)
    dic = {
        "status": 1,
        "text": "删除成功"
    }
    if cart:
        cart.delete()
    else:
        dic["status"] = 0
        dic["text"] = "删除失败"
    return HttpResponse(json.dumps(dic))
