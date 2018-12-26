$(() => {
    $('.trigger-file').on('click', function() {
        $('#fileInput').trigger('click');
    });
    $('#fileInput').on('change', function() {
        let file = $(this)[0].files[0];
        $('.choose-file-name').html(file.name);

        // 处理文件数据.
        // todo.

        // 点击导入按钮上传.
        // todo.

        // rest.
        $(this).val('');
    });


    $('#bankForm input').on('change', function() {
        var bankname = $('input[name=bankname]:checked', '#bankForm').val(); 
        //alert(bankname);
     });
    $("#submit").click(function () {
        var formData = new FormData();//初始化一个FormData对象
        formData.append("file", $("#fileInput")[0].files[0]);//将文件塞入FormData
        formData.append("bankname", bankname);
        $.ajax({
            url: "http://localhost:1613/test/api/import/upload",
            type: "POST",
            data: formData,
            processData: false,  // 告诉jQuery不要去处理发送的数据
            contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
            success: function (responseText) {
                alert(responseText.message);
            }
        });
    });
});
