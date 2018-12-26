$(() => {
    if(!checkLoginStatus()) {
        location.href = 'login.html';
        return;
    }

    $('.search-btn').on('click', function() {
        let queryStr = $('#bank-search').val();

        if(!queryStr || /^\s*$/g.test(queryStr)) {
            $('.modal-msg').html('请输入搜索内容！');
            $('.modal').modal('show');
            return;
        }

        $.ajax({
            type: 'GET',
            data: {},
            url: '../js/mock/search.json',
            success: data => {
                if(data.status_code === 0) {
                    let htmlstr = ``;
                    data.data.forEach(function(d) {
                        htmlstr += `
                            <tr data-id="${d.id}">
                                <td>${d.nsrsbh}</td>
                                <td>${d.companyName}</td>
                                <td>${d.bankAccountName}</td>
                                <td>${d.bankAccount}</td>
                                <td>${d.ofBank}</td>
                            </tr>
                        `;
                    });

                    $('.search-result >p').hide();
                    $('.search-result >table').show();

                    $('.search-result >table tbody').empty();
                    $('.search-result >table tbody').append(htmlstr);
                    $('.search-result >table tbody tr').on('click', function() {
                        console.log($(this).attr('data-id'));
                        // todo 跳转到数据详情页
                    });
                }
            }
        });
    });
});