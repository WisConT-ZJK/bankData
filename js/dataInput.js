$(() => {
    if(!checkLoginStatus()) {
        location.href = 'login.html';
        return;
    }
    // 退出登录
    $('.header__welcome .fa-sign-out').on('click', function() {
        $('#logout').modal('show');
        $('.confirm-logout').unbind('click');
        $('.confirm-logout').on('click', logout);
    });

    //下载模板
    $('#lunch').change(function() {
        document.getElementById('download').innerHTML=$('.selectpicker').val()+'.xlsx';
        document.getElementById('download').setAttribute('href','download/'+$('.selectpicker').val()+'.xlsx');
        //href="download/标准格式.xlsx"
    })

    // function selectchange(){
    //     document.getElementById("download").innerHTML="abcdefg";
    // }
    
    let file;
    $('.trigger-file').on('click', function() {
        $('#fileInput').trigger('click');
    });
    $('#fileInput').on('change', function() {
        file = $(this)[0].files[0];
        $('.choose-file-name').html(file.name);

        // 处理文件数据.
        // todo.

        // 点击导入按钮上传.
        // todo.

        // rest.
        $(this).val('');
    });
    // $('#fileClear').on('click', function() {
    //     file.value = '';
    // })
    $('#button').click(function () {
        if (!$('.selectpicker').val()){ 
            $('.modal-msg2').html('请选择银行');
            $('#bankChoose').modal('show');
        }else if (!file){
            //alert('请选择银行');
            $('.modal-msg2').html('请选择需上传文件');
            $('#bankChoose').modal('show');
        }else{
            $('.modal-msg3').html('&nbsp;&nbsp;&nbsp;&nbsp;文件名：'+file.name);
            $('.modal-msg4').html('所属银行：'+$('.selectpicker').val());
            $('#inputTips').modal('show');
        }
    });
    $('#inputConfirm').click(function () {
            var formData = new FormData();//初始化一个FormData对象
            formData.append('file', file);//将文件塞入FormData
            formData.append('bank_name', $('.selectpicker').val());
            //console.log(formData);
            $.ajax({
                url: '/api/bank_data/upload/',
                type: 'POST',
                data: formData,
                processData: false,  // 告诉jQuery不要去处理发送的数据
                contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
                success: function (responseText) {
                    let successLength = 0;
                    let failLength = 0;
                    for(var success in responseText.data[0]) {
                        successLength++;
                    }
                    for(var fail in responseText.data[1]) {
                        failLength++;
                    }
                    if (failLength){
                        // $('.modal-msg1').html(failMeg);
                        // $('#resultOutput').modal('show');
                        // alert(responseText.message+':\n成功：'+successLength+'\n'+successMeg+'\n失败：'+failLength+'\n'+failMeg,
                        // '导入结果：'
                        // )
                        let htmlstr = ``;
                        for(var fail in responseText.data[1]) {
                            htmlstr += `
                                <tr>
                                    <td>${fail}.sheet</td>

                                    <td>${responseText.data[1][fail]}</td>
                                </tr>
                            `;
                        }
    
                        //$('.modal-body >p').hide();
                        $('.modal-body >table').show();
                        $('.modal-body >table tbody').empty();
                        $('.modal-body >table tbody').append(htmlstr);
                        $('#resultOutput1').modal('show');
                    }else if(successLength && (!failLength)){
                        $('.modal-msg1').html('导入成功');
                        $('#resultOutput2').modal('show');
                        
                    }else{
                        //alert(responseText.message,'导入失败');
                        $('.modal-msg1').html(responseText.message);
                        $('#resultOutput2').modal('show');
                    }
                }
            });
    });
});
