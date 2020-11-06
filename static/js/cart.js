// /**
//  * Created by tarena on 18-8-3.
//  */

$(function(){
    // 切换地址
	$("#top .select>li").click(function (){
		var $span = $("#top .leftNav .address>span").text();
		var $li = $(this).text();
		$("#top .leftNav .address>span").text($li);
		$(this).text($span);
	});
    //检查登录状态
    check_login();
});

/**
 * 异步向服务器发送请求，检查用户是否处于登录状态
 * */
function check_login(){
    $.get('/check_login/',function(data){
        var html = "";
        if(data.loginStatus == 0){
            html += "<a href='/login/'>[登录] </a>";
            html += "<a href='/register/'>[注册,有惊喜]</a>";
        }else{
            html += "欢迎: "+data.uname;
            html += "&nbsp<a href='/logout/'>退出</a>";
            $.get('/mycart/',
                {'uid':data.uid},
                function(data){
                    var html = "";
                    $.each(data,function(i,obj){
                        html += '<div class="g-item">';
                        html +=     '<p class="check-box">';
                        html +=         '<input type="checkbox">';
                        html +=         '<img src="/' + obj.goods.picture + '" width="80">';
                        html +=     '</p>';
                        html +=     '<p class="goods">' + obj.goods.title + '</p>';
                        html +=     '<p class="price">&yen;' + obj.goods.price + '</p>';
                        html +=     '<p class="quantity">' + obj.ccount + '</p>';
                        html +=     '<p class="t-sum">';
                        html +=         '<b>&yen;' + obj.goods.price * obj.ccount + '</b>';
                        html +=     '</p>';
                        html +=     '<p class="action">';
                        html +=         '<a href="javascript:rm_cart(' + obj.id + ')">移除</a>';
                        html +=     '</p>';
                        html += '</div>';
                    });
                    $("#good-content").html(html);
                },
                'json');
        };
        $("#login").html(html);
    },'json');
}

function rm_cart(cart_id){
    $.get("/rm_cart/",
        {"id":cart_id},
        function(data){
            if(data.status == 1){
                alert(data.text);
                window.location.href ="/cart/";
            };
        },
        'json')
}