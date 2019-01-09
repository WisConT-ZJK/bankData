$(() => {
    if(checkLoginStatus()) {
        location.href = 'index.html';
        return;
    }

    $('.login-btn').on('click', function() {
        let name = $('.login-form input[type=text]').val(),
            pwd = $('.login-form input[type=password]').val();

        if(!name || /^\s*$/g.test(name)) {
            $('.modal-msg').html('必须输入正确的用户名！');
            $('.modal').modal('show');
            return;
        }

        if(!pwd || /^\s*$/g.test(pwd)) {
            $('.modal-msg').html('必须输入正确的密码！');
            $('.modal').modal('show');
            return;
        }

        $.ajax({
            type: 'GET',
            data: {
                username: name,
                password: pwd
            },
            url: '/api/account/login',
            // url: '../js/mock/login.json',
            success: data => {
                if(data.status === 0) {
                    console.log(data);
                    

                    // 获取用户信息
                    $.ajax({
                        type: 'GET',
                        url: '/api/account/user',
                        success: data => {
                            if(data.status === 0) {
                                location.href = 'index.html';
                                sessionStorage.setItem('user', data.data.username);
                            }
                        }
                    });
                }else {
                    $('.modal-msg').html(data.message);
                    $('.modal').modal('show');
                }
            }
        });
    });
});