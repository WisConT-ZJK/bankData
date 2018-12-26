$(() => {
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
            data: {},
            url: '../js/mock/login.json',
            success: data => {
                if(data.status_code === 0) {
                    location.href = 'index.html';
                }
            }
        });
    });
});