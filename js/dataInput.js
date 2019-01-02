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
        console.log(formData);
        $.ajax({
            url: 'http://localhost:1613/test/api/import/upload',
            type: 'POST',
            data: formData,
            processData: false,  // 告诉jQuery不要去处理发送的数据
            contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
            success: function (responseText) {
                alert(responseText.message+'以下数据导入成功：'+responseText.data[0]+'以下数据导入失败：'+responseText.data[1]);
            }
        });
    });
});
