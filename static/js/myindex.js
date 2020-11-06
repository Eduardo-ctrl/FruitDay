$(function (){
	// 切换地址
	$("#nav .select>li").click(function (){
		var $span = $("#nav .leftNav .address>span").text();
		var $li = $(this).text();
		$("#nav .leftNav .address>span").text($li);
		$(this).text($span);
	});

	// 轮播图
	var banner = document.getElementsByClassName("wrapper")[0];
	console.log(banner);
	var imgIndex = 0;
	var timer = setInterval(rotation,1000);
	//定时器
	function rotation(){
		$("#banner img:eq(" + imgIndex + ")").css("display","none");
		$("#banner div>div:eq(" + imgIndex + ")").css("background","none");
		imgIndex = ++ imgIndex == $("#banner img").length ? 0 : imgIndex;
		$("#banner img:eq(" + imgIndex + ")").css("display","block");
		$("#banner div>div:eq(" + imgIndex + ")").css("background","green");
	}

	banner.onmouseover = function (){
			//停止计时器
			clearInterval(timer);
		};

	banner.onmouseout = function (){
		timer = setInterval(rotation,1000);
	}
});
