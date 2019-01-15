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

        //datatable  destroy
        if ( $.fn.dataTable.isDataTable('#table' )) {
            $('#table').DataTable().destroy();
            $('.search-result >table tbody').empty();
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
                                <tr>
                                    <td>${d.IDENTITY_NUMBER || '暂无'}</td>
                                    <td>${d.ACCOUNT_NAME || '暂无'}</td>
                                    <td>${d.ACCOUNT_NUMBER || '暂无'}</td>
                                    <td>${d.BANK_RELATED || '暂无'}</td>
                                    <td>${d.DEPOSIT_BANK || '暂无'}</td>
                                </tr>
                            `;
                        });

                        $('.search-result .ex-tips').hide();
                        $('.search-result >table, .res-tips').show();
                        $('.res-tips').html(`搜索<em style="font-style:normal;color:#49a8f4">「${queryStr}」</em>关键字结果如下：`);

                        $('.search-result >table tbody').empty();
                        $('.search-result >table tbody').append(htmlstr);

                        let scrollyHeight = ($(window).height() - 320).toString()+'px';
                        $('#table').DataTable({
                            "scrollY":scrollyHeight,
                            "scrollCollapse": true,
                            "searching": false,
                            "ordering": false,
                            "language": {
                                "sProcessing":   "处理中...",
                                "sLengthMenu":   "显示 _MENU_ 项结果",
                                "sZeroRecords":  "没有匹配结果",
                                "sInfo":         "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                                "sInfoEmpty":    "显示第 0 至 0 项结果，共 0 项",
                                "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                                "sInfoPostFix":  "",
                                "sSearch":       "搜索:",
                                "sUrl":          "",
                                "sEmptyTable":     "表中数据为空",
                                "sLoadingRecords": "载入中...",
                                "sInfoThousands":  ",",
                                "oPaginate": {
                                    "sFirst":    "首页",
                                    "sPrevious": "上页",
                                    "sNext":     "下页",
                                    "sLast":     "末页"
                                },
                                "oAria": {
                                    "sSortAscending":  ": 以升序排列此列",
                                    "sSortDescending": ": 以降序排列此列"
                                }
                            },
                        });
                        $('#table').on('click','tbody tr' ,function() {
                            let sel = getSelection().toString();
                            if(!sel){
                            window.open('data-find.html?data-id='+this.cells[2].innerText)
                            }
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