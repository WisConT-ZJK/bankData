$(() => {
    //let postData = {account_number:'6212264000025420155'}
    let formData = new FormData();//初始化一个FormData对象
    formData.append('account_number', '6212264000025420155');//将文件塞入FormData
    $.ajax({
        url: 'http://localhost:1613/test/api/bank_data/account_detail',
        type: 'POST',
        data: formData,
        processData: false,  // 告诉jQuery不要去处理发送的数据
        contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
        success: function (responseText) {
            if(responseText.message!='success'){
                $('.modal-msg1').html(responseText.message);
                $('#datashow').modal('show');
            }else{
                let htmlstr = ``;
                responseText.data.forEach(function(d) {
                    htmlstr += `
                        <tr>
                            <td><label><input name="datachoose" type="checkbox" value=${d.pk} /></label> </td>
                            <td>${d.pk}</td>
                            <td>${d.fields.ACCOUNT_NAME}</td>
                            <td>${d.fields.ACCOUNT_NUMBER}</td>
                            <td>${d.fields.BANK_RELATED}</td>
                            <td>${d.fields.IDENTITY_NUMBER}</td>
                            <td>${d.fields.DEPOSIT_BANK}</td>
                            <td>${d.fields.TRADE_DATE}</td>
                            <td>${d.fields.TRADE_TIME}</td>
                            <td>${d.fields.LENDING_SIGN}</td>
                            <td>${d.fields.TRADE_AMOUNT}</td>
                            <td>${d.fields.ACCOUNT_BALANCE}</td>
                            <td>${d.fields.OPPOSITE_ACCOUNT_NUMBER}</td>
                            <td>${d.fields.OPPOSITE_ACCOUNT_NAME}</td>
                            <td>${d.fields.OPPOSITE_ACCOUNT_BANK}</td>
                            <td>${d.fields.SUMMARY}</td>
                        </tr>
                    `;
                });

                //$('.search-result >p').hide();
                $('.search-result >table').show();
                $('.search-result >table tbody').empty();
                $('.search-result >table tbody').append(htmlstr);
            }
        }
    });
    $('#outputExcel').click(function () {
        let checkedbox = [];
        $('input:checkbox:checked').each(function () {
            checkedbox.push($(this).val());
        });
        console.log(checkedbox);
        var a = document.createElement('a');
        a.href = 'http://localhost:1613/test/api/bank_data/export_file/?ids=['+checkedbox+']';
        a.click()
    });
});
