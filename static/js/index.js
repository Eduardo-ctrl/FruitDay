window.onload = function (){
	// 1.获取元素节点
	var currentAddr = document.getElementsByClassName("currentAddress")[0];
	var select = document.getElementsByClassName("select")[0];

	// 获取内层列表中的地址项
	var address = select.children;
	// 为每一项添加点击事件
	for (var i = 0;i < address.length;i ++){
		address[i].onclick = function(){
			// 传值
			var current = currentAddr.innerHTML;
			var addr = this.innerHTML;
			currentAddr.innerHTML = addr;
			this.innerHTML = current;
		}
	}

	// 图片轮播
	// 1.获取图片数组
	// 2.定时器实现图片切换
	// 3.图片切换主要切换数组下标，防止数组越界

	var banner = document.getElementsByClassName("wrapper")[0];
	var imgs = banner.children; //图片数组
	var imgNav = document.getElementsByClassName("imgNav")[0];
	var indInfo = imgNav.children;//索引
	var imgIndex = 0; //初始下标
	var timer = setInterval(autoPlay,1000); //定时器
	function autoPlay(){
		//设置元素隐藏与显示
		imgs[imgIndex].style.display = "none";
		indInfo[imgIndex].style.background = "none";
		// ++ imgIndex;
		// if(imgIndex == img.length){
		// 	imgIndex = 0;
		// }
		imgIndex = ++ imgIndex == imgs.length ? 0 : imgIndex;

		imgs[imgIndex].style.display = "block";
		//切换索引 切换背景色
		indInfo[imgIndex].style.background = "green";
	}

	banner.onmouseover = function (){
		//停止计时器
		clearInterval(timer);
	};

	banner.onmouseout = function (){
		timer = setInterval(autoPlay,1000);
	};
}

//异步向服务器发送请求，检查用户是否处于登录状态
function check_login(){
	//向 /check_login/ 发送异步请求
	$.get('/check_login/',function(data){
		var html = "";
		if (data.loginStatus == 0){
			html += "<a href='/login'>[登录]</a>";
			html += "<a href='/register'>[注册，有惊喜]</a>";
		}else{
			html += "欢迎：" + data.uname;
			html += "&nbsp<a href='/logout'>退出</a>";
			cart_goods(data.uid);
		}
		$('#login').html(html);
	},'json');
}

//异步向服务器发送请求，读取商品信息(每个分类取前10个)
function goods_show(){
	//向 /goods_show/ 发送异步请求
	$.get('/goods_show/',function(data){
		var html = '';
		$.each(data,function(i,obj){
			//从 obj 中取出 type，并转换为 json 对象
			var jsonType = JSON.parse(obj.type)
			html += '<div class="item" style="overflow: hidden;">';
			//加载 type 的信息
			html += 	'<p class="goodsClass">';
			html +=			'<img src="/' + jsonType.picture + '">';
			html +=			'<a href="#">更多</a>';
			html +=		'</p>';
			//加载 ul 以及 li 的信息
			html += 	'<ul>';
			var jsonGoods = JSON.parse(obj.goods);
			$.each(jsonGoods,function(j,good){
				// console.log(good);
				if((j+1)%5 == 0){
					html += '<li class="no-margin">';
				}else{
					html += '<li>';
				};
				//拼 p 标记  表示商品图片
				html += 		'<p>';
				html +=				'<img src="/' + good.fields.picture + '">';
				html += 		'</p>';
				//拼 div 标记  表示商品详细描述
				html +=			'<div class="content">';
				html += 				'<a href="javascript:add_cart(' + good.pk + ');">';
				html +=						'<img src="/static/images/cart.png">';
				html +=					'</a>';
				html += 				'<p>' + good.fields.title + '</p>';
				html += 				'<span>';
				html +=						'&yen;'+ good.fields.price + '/' + good.fields.spec;
				html +=					'</span>';
				html +=			'</div>';
				html +=		'</li>';
			});
            html += 	'</ul>';
            html += '</div>';
		});
		$("#main").html(html);
	},'json')
}

//添加商品到购物车 :gid表示要添加到购物车里的商品id
function add_cart(gid){
	// alert('保存商品到购物车');
	//验证登录账户，如果没有用户登录的话则给出相应的提示
	$.get('/check_login/',function(data){
		if (data.loginStatus == 0){
			alert('请先登录再购买商品！');
		}else{
			//将商品保存到购物车
			$.get('/add_cart/',
				"gid=" + gid,
				function(data){
					if(data.status == 1) {
						alert(data.statusText);
						cart_goods(data.uid);
					}else{
						alert("添加购物车失败")
					}
				},
				'json');
		};
	},'json');
}

//更新购物车商品数量
function cart_goods(uid){
	$.get('cart_goods',
		'uid=' + uid,
		function(data){
			var html = "我的购物车(" + data.num + ")";
			$("#cart>a").html(html);
		},
		'json')
};

$(function(){
	// 调用 check_login 检查登录状态
	check_login();
	// 调用 goods_show 动态加载商品信息
	goods_show();
});