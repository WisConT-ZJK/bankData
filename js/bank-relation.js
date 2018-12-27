$(() => {
    let startDate, endDate;
    $('#date1, #date2').datepicker({
        format: 'yyyy-mm-dd',
        clearBtn: true,
        language: 'zh-CN',
        autoclose: true,
        todayHighlight: true
    }).on('changeDate', function(cs) {
        let date = cs.format(),
            flag = $(this).attr('data-flag');

        // 清空提示.
        $('.choose-date-tips').empty();

        // 设置起始日期.
        if(flag === 'start') {
            startDate = date;
        }
        if(flag === 'end') {
            endDate = date;
        }

        // 如果只选择了一个日期 触发另一个日期的选择.
        if(flag === 'end' && !startDate) {
            $('#date1').trigger('focus'); 
            return;  
        }
        if(flag === 'start' && !endDate) {
            $('#date2').trigger('focus');   
            return;
        }

        // 如果用户清除了选项 让用户再次选择.
        if(!date && flag === 'start') {
            setTimeout(function() {
                $('#date1').trigger('focus'); 
            }, 0);
            return;
        }
        if(!date && flag === 'end') {
            setTimeout(function() {
                $('#date2').trigger('focus'); 
            }, 0);
            return;
        }

        // 如果结束日期大于开始日期.
        if(+new Date(endDate) < +new Date(startDate)) {
            $('.choose-date-tips').html('结束日期必须在开始日期之后');
            return;
        }
        console.log(startDate, endDate);
    });
});