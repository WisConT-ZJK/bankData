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

    $('.search-btn').on('click', function() {
        let queryStr = $('#bank-search').val();

        if(!queryStr || /^\s*$/g.test(queryStr)) {
            $('#s-tips .modal-msg').html('请输入搜索内容！');
            $('#s-tips').modal('show');
            return;
        }

        $('.search-result .ex-tips').show();
        $('.search-result .ex-tips').html('搜索中请稍等...');
        $('button.search-btn').addClass('disabled');
        $('.search-result >table, .res-tips').hide();
        $('.search-result >table tbody').empty();

        $.ajax({
            type: 'GET',
            data: {
                keyword: queryStr
            },
            url: '/api/bank_data/account_search/',
            // url: '../js/mock/search.json',
            success: data => {
                if(data.status === 0) {
                    $('#bank-search').val('').focus();
                    $('button.search-btn').removeClass('disabled');

                    if(data.data.length > 0) {
                        let htmlstr = ``;
                        data.data.forEach(function(d) {
                            htmlstr += `
                                <tr data-id="${d.id}" class="n-table--hover">
                                    <td>${d.identity_number || '暂无'}</td>
                                    <td>${d.account_name || '暂无'}</td>
                                    <td>${d.account_number || '暂无'}</td>
                                    <td>${d.bank_related || '暂无'}</td>
                                </tr>
                            `;
                        });

                        $('.search-result .ex-tips').hide();
                        $('.search-result >table, .res-tips').show();
                        $('.res-tips').html(`搜索<em style="font-style:normal;color:#49a8f4">「${queryStr}」</em>关键字结果如下：`);

                        $('.search-result >table tbody').empty();
                        $('.search-result >table tbody').append(htmlstr);
                        $('.search-result >table tbody tr').on('click', function() {
                            location.href = 'data-find.html?data-id='+this.cells[2].innerText
                        });
                    }else {
                        $('.search-result .ex-tips').show();
                        $('.ex-tips').html('搜索数据为空，请重新搜索');
                    }
                }
            }
        });
    });
});