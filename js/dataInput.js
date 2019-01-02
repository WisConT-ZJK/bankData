$(() => {
    if(!checkLoginStatus()) {
        location.href = 'login.html';
        return;
    }
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
        if (!file){ 
            $('.modal-msg2').html('请选择需上传文件');
            $('#bankChoose').modal('show');
        }else if (!$('.selectpicker').val()){
            //alert('请选择银行');
            $('.modal-msg2').html('请选择银行');
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
                url: 'http://localhost:1613/test/api/bank_data/upload',
                type: 'POST',
                data: formData,
                processData: false,  // 告诉jQuery不要去处理发送的数据
                contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
                success: function (responseText) {
                    
                
                    let successLength = 0;
                    let failLength = 0;
                    let successMeg='',failMeg='';
                    for(var success in responseText.data[0]) {
                        successLength++;
                        successMeg += success+'\n';
                    }
                    for(var fail in responseText.data[1]) {
                        failLength++;
                        failMeg += fail+'.sheet 导入失败 '+responseText.data[1][fail]+'\n'
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
                        $('#resultOutput').modal('show');
                    }else if(successLength){
                        $('.modal-msg1').html('导入成功');
                        $('#resultOutput').modal('show');
                        
                    }else{
                        //alert(responseText.message,'导入失败');
                        $('.modal-msg1').html(responseText.message);
                        $('#resultOutput').modal('show');
                    }
                }
            });
    });
});
