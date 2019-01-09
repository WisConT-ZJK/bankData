$(() => {

    
    //date.format
    Date.prototype.Format = function(fmt){ //author: meizz   
        var o = {   
            "M+" : this.getMonth()+1,                 //月份   
            "d+" : this.getDate(),                    //日   
            "h+" : this.getHours(),                   //小时   
            "m+" : this.getMinutes(),                 //分   
            "s+" : this.getSeconds(),                 //秒   
            "q+" : Math.floor((this.getMonth()+3)/3), //季度   
            "S"  : this.getMilliseconds()             //毫秒   
        };   
        if(/(y+)/.test(fmt))   
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
        for(var k in o)   
            if(new RegExp("("+ k +")").test(fmt))   
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
        return fmt;   
    } 

    //定义变量
    let start,  //筛选 开始时间
        end,    //筛选 结束时间
        range1, //筛选 金额范围（小）
        range2, //筛选 金额范围（大）
        accountNumber = GetQueryString('data-id');//筛选 银行账号

    //获取初始表格数据
    getTabledata();


    //全选
    $("#quanxuan").click(function(){//给全选按钮加上点击事件
        if($(this).prop("checked")){
            $('#table').DataTable().rows().select()
        }else{
            $('#table').DataTable().rows().deselect();
        }
    })

    //导出excel
    $('#outputExcel').click(function () {
        let checkedbox = [];
        let selectedData = $('#table').DataTable().rows({selected: true}).data()
        if(selectedData.length){
            selectedData.each(function (e) {
                checkedbox.push(e[1]);
            })
            var a = document.createElement('a');
            a.href = '/api/bank_data/export_file/?ids=['+checkedbox+']';
            a.click()
        }else{
            $('.modal-msg').html('请选择选择至少一条数据进行导出');
            $('#tips').modal('show');
        }

    });


    //日期选择
    $('.input-daterange input').each(function() {
        
        $(this).datepicker({
            format: 'yyyy-mm-dd',
            //clearBtn: true,
            language: 'zh-CN',
            autoclose: true,
            todayHighlight: true,
            autoclose: true,
            //maxViewMode: 0,
            //startDate: "now"
        }).on('changeDate', function() {
            if(this.id === 'start-date'){
                start = this.value;
            }
            if(this.id === 'end-date'){
                end = this.value;
            }
        });
    })
    //设置日期关联 input-daterange
    $('.input-daterange').datepicker({
    });

    //日期清空功能
    $('#clearDate').click(function () {
        $("#start-date").datepicker('clearDates');
        $("#end-date").datepicker('clearDates');
    })

    //筛选按钮
    $('#filter').click(function () {
        if ( $.fn.dataTable.isDataTable('#table' )) {
            $('#table').DataTable().destroy();
        }
        $('tbody').empty();
        getTabledata();
    })

    //跳转到关系网页面按钮
    $('#next').click(function () {
        window.location.href = '../bank-relation-chart.html?accountNumber='+accountNumber
    })

    //input取消提示
    $("#range1, #range2").on("click",function(e){
        $('.range-tips').empty()
    });

    //获取数据函数
    function getTabledata(){
        range1=parseFloat($(" #range1").val())
        range2=parseFloat($(" #range2").val())
        if(range1 > range2) {
            $('.range-tips').html('金额范围有误');
            return;
        }
        if(!range1) {
            range1 = -1;
        }
        if(!range2) {
            range2 = 1267650600228229401496703205377;
        }
        if(!start) {
            start = 19491001;
        }else{
            start = start.toString().replace(/-/g, "")
        }
        if(!end) {
            end = new Date().Format('yyyyMMdd');
        }else{
            end = end.toString().replace(/-/g, "")
        }
        let formData = new FormData();//初始化一个FormData对象
        formData.append('account_number', accountNumber);//将文件塞入FormData
        formData.append('trade_amount_min', range1);
        formData.append('trade_amount_max', range2);
        formData.append('trade_date_start', start);
        formData.append('trade_date_end', end);
        $.ajax({
            url: 'api/bank_data/account_detail/',
            type: 'GET',
            data: formData,
            processData: false,  // 告诉jQuery不要去处理发送的数据
            contentType: false,   // 告诉jQuery不要去设置Content-Type请求头
            success: function (responseText) {
                drawtable(responseText)
            }
        });
    }

    //画表格函数
    function drawtable(responseText) {
        if(responseText.message!='success'){
            $('.modal-msg1').html(responseText.message);
            $('#datashow').modal('show');
        }else{
            let htmlstr = ``;
            responseText.data.forEach(function(d) {
                htmlstr += `
                    <tr>
                        <td></td>
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
            $('tbody').append(htmlstr);
            let scrollyHeight = ($(window).height() - 320).toString()+'px';
            $('#table').DataTable({
                "scrollY":scrollyHeight,
                "scrollCollapse": true,
                "order": [[ 7, "desc" ]],
                'select': 'multi',
                "language": {"url": "../libs/css/DataTables-1.10.18/Chinese.lang"},
                "columnDefs": [ 
                    {"targets": [0,1,2,3,4,5,6,8,9,11,12,13,14,15],"orderable": false},
                    {"targets":15,"width": "4%" },
                    {orderable: false,className: 'select-checkbox',targets:0} 
                ],
            });
        }
    }

    //获取URL参数函数
    function GetQueryString(name)
    {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    }

});
