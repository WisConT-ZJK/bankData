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
    $('#button').click(function () {
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
                    failMeg += fail+'--'+responseText.data[1][fail]+'\n'
                }
                if (failLength | successLength){
                    alert(responseText.message+':\n成功：'+successLength+'\n'+successMeg+'\n失败：'+failLength+'\n'+failMeg
                    )
                }else {
                    alert(responseText.message);
                }
                
            }
        });
    });
});
