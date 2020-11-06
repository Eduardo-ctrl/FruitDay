$(function(){
    //表示手机号是否已经被注册过的状态值
    var registStatus = 1;

    //为 uphone 控件绑定 blur 事件
    $("input[name='uphone']").blur(function(){
        //如果文本框内没有任何东西则返回
        if($(this).val().trim().length == 0)
            return;
        $.get('/check_uphone/',
            {'uphone': $(this).val()},
            function(data){
                $("#uphone-tip").text(data.msg);
                //为 registStatus 赋值，以使在提交表单时使用
                registStatus = data.status;
                console.log('status:' + data.status);
            }, 'json'
        );
    });
    //为 #submit 表单绑定 submit 事件
    $("#formReg").submit(function(){
        //利用 registStatus 的值，决定表单是否要被提交
        if (registStatus == 1)
            return false;
        return true;
    });
});

