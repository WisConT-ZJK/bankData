$(() => {
    // 设置高度.
    $('.chart').css('height', $(window).height() - 254); // 减去的224为页面其他元素的高度和25px下边距.

    // 隐藏按钮.
    $(window).on('click', function() {
        $('.btn-operating').css({display: 'none'});
        $('.btn-operating .hide-node, .btn-operating .show-suspicious').unbind('click');
    });

    // 关闭前30按钮.
    $('.top-30-amount .top-30-close').on('click', function() {
        $('.top-30-amount').hide();
    });

    // 导出图片.
    $('.download-img').on('click', function() {
        saveSvgAsPng(document.getElementById('chart-box'), 'related.png', {backgroundColor: "#fff"});
    });

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

    let timer = null;
    // 图表原始数据.
    let originData = {
        in: null,
        out: null
    };
    // 图表操作数据.
    let operatingData = {
        in: null,
        out: null
    };
    // 闭环数据.
    let closedLoopData = [];
    // svg位置数据.
    let chartPos;
    // 参数.
    let searchParams = new URLSearchParams(location.search);

    function drawTreeChart(links, linksLeft, buyClosedLoop) {
        // 判断数据是否有.
        if(links.length <= 0 && linksLeft.length <= 0) {
            $('.chart >p').show();
            return;
        }

        // 清空svg.
        $('svg').empty();

        let width = $('.chart').width(),
            height = $('.chart').height();

        let zoom_handler = d3.zoom().on('zoom', zoom_actions);
        let canvas = d3.select('svg')
            .style('width', width)
            .style('height', height)
            .call(zoom_handler);
            
        let svg = canvas.append('g')
            .attr('class', 'g-box')
            .style('opacity', 0);

        clearTimeout(timer);
        timer = setTimeout(() => {
            // 设置拖拽和缩放的原点位置.
            $('.g-box').css('opacity', 1);
            if(chartPos) {
                let pos = chartPos.split(' ').shift().replace(/[a-z]|\(|\)/g, '').split(',');
                canvas.call(zoom_handler.transform, d3.zoomIdentity.translate(pos[0], pos[1]).scale(1));
            }else {
                canvas.call(zoom_handler.transform, d3.zoomIdentity.translate(width / 2, 0).scale(1));
            }
        }, 0);

        let defs = svg.append('svg:defs');
        // right arrow.
        let arrow = defs.append('svg:marker')    // This section adds in the arrows
            .attr('id', 'sell')
            .attr('refX', 0)
            .attr('refY', 2)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,0 L0,4 L9,2 z')
            .attr('fill', '#999');

        defs.append('svg:marker')    // This section adds in the arrows
            .attr('id', 'buy')
            .attr('refX', 0)
            .attr('refY', 2)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', '0')
            .append('svg:path')
            .attr('d', 'M0,0 L0,4 L9,2 z')
            .attr('fill', '#999');
        // define white background color for link labels
        let txtBgnd = defs.append('filter')
            .attr('id', 'solid')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', 1);
        txtBgnd.append('feFlood')
            .attr('flood-color', 'rgb(255, 255, 255)');
        txtBgnd.append('feComposite')
            .attr('in', 'SourceGraphic');

        let stratify = d3.stratify()
            .parentId(function(d) { return d.pid; });

        let links_data = links;
        let links_data_left = linksLeft;
        let treeWidth = width / 2 - 250;
        
        let treeL = d3.tree().size([height, treeWidth]), treeR, treeRWidth = treeWidth;
        // 动态计算右侧树的宽度.
        links_data.forEach(function(l) {
            if(l.lv > 1) {
                treeRWidth = treeWidth + (treeWidth / 2) * (l.lv - 1);
            }
        });       
        // 设置右侧树的宽度.
        treeR = d3.tree().size([height, treeRWidth]);

        let root = stratify(links_data)
            .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

        let root_left = stratify(links_data_left)
            .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

        treeR(root);
        treeL(root_left);
        flip_nodes(root_left, root);
        let exLinks = buildExtraLinks(buyClosedLoop && buyClosedLoop.length > 0 ? buyClosedLoop : [], root);
        exLinks = exLinks.concat(buildExtraLinks([], root_left));
        
        if(root.children) {
            root.children = root.children.concat(root_left.children);
            drawTree(root);
        }else {
            root.children = [];
            drawTree(root_left);
        }

        //Zoom functions 
        function zoom_actions() {
            svg.attr('transform', d3.event.transform)
        }

        function flip_nodes(root, root_ref) {
            let yy = 2 * root.y,
                xx = root_ref.x + root.x;
            root.descendants().forEach(function(d) {
                d.y = yy - d.y;
                d.x = xx - d.x;
            })
        }

        function buildExtraLinks(exLinks, root) {
            var links = root.descendants();
            var nodeMap = {};
            var outputLinks = []
            links.forEach(function(d) {
                nodeMap[d.id] = d;
            });
            if(exLinks.length > 0) {
                exLinks.forEach(function(d) {
                    d.extraBuy = 1;
                    var tempNode = {};
                    tempNode.data = d;
                    tempNode.parent = nodeMap[d.id];
                    tempNode.x = nodeMap[d.pid].x;
                    tempNode.y = nodeMap[d.pid].y;
                    tempNode.flow = nodeMap[d.pid];
                    outputLinks.push(tempNode);
                });
            }
            return outputLinks;
        }

        function drawTree(root) {
            let link = svg.append('g')
                .selectAll('.tree-link')
                .data(root.descendants().slice(1).concat(exLinks), function(d) {
                    return d.data.id;
                });
            link.exit().remove();
            let lent = link.enter().append('g');

            let path = lent.append('path')
                .attr('class', d => {
                    return `tree-link ${d.parent.data.id.replace(/#/g, '-')}`;
                })
                .attr('id', d => {
                    if(d.data.extraBuy === 1) {
                        return `${d.data.id}-extra`;
                    }
                    return d.data.id;
                })
                .attr('d', diagonal)
                .attr('marker-start', d => {
                    if (d.data.activity == 'sell') {
                        return `url(#${d.data.activity})`
                    }else {
                        if(d.data.extraBuy === 1) {
                            return 'url(#sell)';
                        }
                    }
                })
                .attr('marker-end', d => {
                    if(d.data.activity == 'buy' && !d.data.extraBuy) {
                        return `url(#${d.data.activity})`;
                    }
                })
                .attr('stroke', '#337ab7');

            let textpath = lent.append('text')
                .attr('dy', 5)
                .attr('filter', 'url(#solid)')
                .attr('fill', '#d9534f')
                .attr('class', 'line-amount')
                .on('click', function(d) {
                    $('.line-amount').attr('stroke', '');
                    $(d3.event.target.parentNode).attr('stroke', '#d9534f');

                    let params = {
                        begin_date: '200909',
                        end_date: '201909'
                    };
                    if(d.data.activity === 'sell') {
                        params.zh_pay = d.data.account_number;
                        params.zh_earn = d.parent.data.account_number;
                    }
                    if(d.data.activity === 'buy') {
                        params.zh_pay = d.parent.data.account_number;
                        params.zh_earn = d.data.account_number;
                    }

                    $.ajax({
                        type: 'GET',
                        data: params,
                        url: '/api/bank_data/top_trade_detail/',
                        // url: '../js/mock/top30.json',
                        success: data => {
                            if(data.status === 0) {
                                if(data.data.length > 0) {
                                    let hstr = ``;
                                    data.data.forEach(function(d) {
                                        hstr += `
                                            <li>${d.date}：¥ ${toThousands(d.amount)}</li>
                                        `;
                                    });
                                    $('.top-30-amount').show();
                                    $('.top-30-amount ul').empty();
                                    $('.top-30-amount ul').append(hstr);
                                }else {
                                    $('.top-30-amount ul').empty();
                                    $('.top-30-amount').hide();
                                    $('.modal-msg').html('暂无交易明细列表数据');
                                    $('.modal').modal('show');
                                }
                            }
                        }
                    });
                })
                .append('textPath')
                .attr('href', function(d) { 
                    if(d.data.extraBuy === 1) {
                        return `#${d.data.id}-extra`;
                    }
                    return '#' + d.data.id;
                })
                .attr('startOffset', function(d) {
                    if(d.data.activity === 'sell') {
                        return '30%';
                    }
                    if(d.data.activity === 'buy') {
                        if(d.data.lv > 1) {
                            return '50%';
                        }
                        return '70%';
                    }
                })
                .style('text-anchor', 'middle')
                .text(function(d) { 
                    if(d.data.lv > 1) {
                        return `2018/01/01 交易总额：¥${toThousands(d.data.value)}`;
                    }
                    return '¥' + toThousands(d.data.value);
                });

            let node = svg.selectAll('.node');
            let nupd = node.data(root.descendants(), function(d) {
                    return d.data.id;
                });
            let nent = nupd.enter().append('g')
                .attr('class', function(d) { return 'node' + (d.children ? ' node--internal' : ' node--leaf'); })
                .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });
            nupd.exit().remove();

            let nametext = nent.append('text')
                .attr('filter', function(d) {
                    if(d.data.lv === 0) {
                        return 'url(#solid)';
                    }
                })
                .style('text-anchor', function(d) {
                    if(d.data.lv === 0) {
                        return 'start';
                    }

                    if (d.data.activity == 'buy')
                        return d.children ? 'end' : 'start';
                    else
                        return d.children ? 'start' : 'end';
                })
                .style('font-size', function(d) {
                    if(d.data.lv === 0) {
                        return '14';
                    }
                })
                .attr('fill', function(d) {
                    if(d.data.lv === 0) {
                        return '#000';
                    }else {
                        return '#666';
                    }
                })
                // .attr('stroke', function(d) {
                //     if(d.data.lv === 0) {
                //         return '#000';
                //     }
                // })
                .on('click', function(d) {
                    if(d.data.lv > 0) {
                        let nodeId = d3.event.target.dataset.id,
                            nodeLv = d3.event.target.dataset.lv;

                        let x = d3.event.pageX, 
                            y = d3.event.pageY,
                            bodyWidth = $(document.body).width();
                        if(x + $('.btn-operating').width() <= bodyWidth) {
                            $('.btn-operating').css({left: x, top: y, display: 'block'});
                        }else {
                            $('.btn-operating').css({left: x - $('.btn-operating').width(), top: y, display: 'block'});
                        }

                        if(d.data.activity === 'sell') {
                            $('.btn-operating button.show-suspicious').hide();
                            $('.btn-operating button.hide-node').css('border-radius', '4px');
                        }else {
                            $('.btn-operating button.show-suspicious').show();
                            $('.btn-operating button.hide-node').attr('style', 'text-align: left');
                        }

                        // 隐藏节点.
                        let dataType = d3.event.target.dataset.type;
                        $('.btn-operating .hide-node').on('click', function() {
                            chartPos = $('svg .g-box').attr('transform');

                            if(dataType === 'sell') {
                                operatingData.out.forEach(function(od, i) {
                                    if(od.id === nodeId) {
                                        operatingData.out.splice(i, 1);
                                    }
                                });
                            }

                            if(dataType === 'buy') {
                                let allChildren = [];
                                // 递归收集存在后代节点的节点的所有后代节点的id.
                                function getChild(oc) {
                                    if(oc.children) {
                                        oc.children.forEach(function(c) {
                                            if(allChildren.join('').indexOf(c.id) <= -1) {
                                                allChildren.push(c.id);
                                                getChild(c);
                                            }
                                        });
                                    }
                                };

                                operatingData.in.forEach(function(od, i) {
                                    // 将当前节点放进待删除列表.
                                    if(od.id === nodeId) {
                                        allChildren.push(od.id);
                                    }
                                    // 将当前节点的所有后代节点放进待删除列表.
                                    if(d.children) {
                                        getChild(d);
                                    }
                                });
                                // 删除当前节点及其所有后代节点.
                                operatingData.in = operatingData.in.filter(function(nc) {
                                    return allChildren.indexOf(nc.id) <= -1;
                                });
                            }
                            drawTreeChart(operatingData.in, operatingData.out);
                        });

                        // 显示可疑资金.
                        $('.btn-operating .show-suspicious').on('click', function() {
                            chartPos = $('svg .g-box').attr('transform');
                            
                            let params = {
                                pri_yhzh: d.parent.data.account_number,
                                sec_yhzh: d.data.account_number,
                                yhzh: d.data.account_number,
                                begin_date: '200909',
                                end_date: '201909'
                            };
                            $.ajax({
                                type: 'GET',
                                data: params,
                                // url: '/api/bank_data/suspicious_trade/',
                                url: '../js/mock/suspicious.json',
                                success: data => {
                                    if(data.status === 0 && data.data.id) {
                                        let isRepeat;

                                        // 正常子节点(非闭环)带闭环初始化检测.
                                        operatingData.in.forEach(function(d) {
                                            if(d.id === data.data.id) {
                                                isRepeat = true;
                                            }

                                            // 闭环初始化检测.
                                            if(d.id === data.data.id && d.pid !== data.data.pid && JSON.stringify(closedLoopData).indexOf(data.data.id) <= -1) {
                                                closedLoopData.push(data.data);
                                            }
                                        });
                                        if(!isRepeat) {
                                            operatingData.in.push(data.data);
                                        }

                                        // 二次闭环节点数据.
                                        // closedLoopData.forEach(function(d) {
                                        //     if(d.id !== data.data.id) {
                                        //         closedLoopData.push(data.data);
                                        //     }
                                        // });
                                        
                                        console.log(closedLoopData)
                                        if(closedLoopData.length > 0) {
                                            drawTreeChart(operatingData.in, operatingData.out, closedLoopData);
                                        }else {
                                            drawTreeChart(operatingData.in, operatingData.out);
                                        }
                                    }
                                }
                            });
                        });
                    }

                    d3.event.stopPropagation();
                });

            // 处理文本的x距离.
            function processTextOfX(d) {
                if(d.data.lv === 0) {
                    return -d.data.name.length * 8;
                }

                if(d.data.activity === 'buy') {
                    return 18;
                }else {
                    return -5;
                }
            };
            nametext.append('tspan')
                .attr('data-id', function(d) {
                    return d.data.id;
                })
                .attr('data-type', function(d) {
                    return d.data.activity;
                })
                .attr('data-lv', function(d) {
                    return d.data.lv;
                })
                .attr('x', processTextOfX)
                .attr('y', function(d) {
                    if(d.data.lv === 0) {
                        return -5;
                    }

                    return -10;
                })
                .text(function(d) { return d.data.name; });

            nametext.append('tspan')
                .attr('data-id', function(d) {
                    return d.data.id;
                })
                .attr('data-type', function(d) {
                    return d.data.activity;
                })
                .attr('data-lv', function(d) {
                    return d.data.lv;
                })
                .attr('x', processTextOfX)
                .attr('y', function(d) {
                    if(d.data.lv === 0) {
                        return 12;
                    }

                    return 5;
                })
                .text(function(d) { return d.data.account_number; });

            nametext.append('tspan')
                .attr('data-id', function(d) {
                    return d.data.id;
                })
                .attr('data-type', function(d) {
                    return d.data.activity;
                })
                .attr('data-lv', function(d) {
                    return d.data.lv;
                })
                .attr('x', processTextOfX)
                .attr('y', function(d) {
                    if(d.data.lv === 0) {
                        return 29;
                    }

                    return 19;
                })
                .text(function(d) { return d.data.related_bank || '暂无' });

            function diagonal(d) {
                if (d.data.activity == 'buy') {
                    // closed loop.
                    if(d.data.extraBuy === 1) {
                        return `M ${d.parent.y + 25} , ${d.parent.x + 35}
                                C ${d.parent.y -25} , ${d.flow.x}
                                ${d.parent.y + 200} , ${d.flow.x + 200}
                                ${d.flow.y + 10} , ${d.flow.x + 25}`;
                        // return `M ${d.parent.y + 25} , ${d.parent.x}
                        //         C ${d.parent.y -25} , ${d.flow.x}
                        //         ${d.parent.y} , ${d.flow.x}
                        //         ${d.flow.y + 10} , ${d.flow.x + 25}`;
                    }

                    return `M ${d.parent.y} , ${d.parent.x}
                        C ${d.parent.y + 210} , ${d.x}
                        ${d.parent.y + 280} , ${d.x}
                        ${d.y} , ${d.x}
                        T ${d.y} , ${d.x}`;
                }else {
                    return `M ${d.y} , ${d.x}
                        C ${d.parent.y - 100} , ${d.x}
                        ${d.parent.y - 100} , ${d.parent.x}
                        ${d.parent.y} , ${d.parent.x}
                        T ${d.parent.y} , ${d.parent.x}`;
                }
            }
        }

    };

    if(searchParams.get('accountNumber')) {
        $.ajax({
            type: 'GET',
            data: {
                yhzh: searchParams.get('accountNumber'),
                end_date: '20190909',
                begin_date: '20090909'
            },
            // url: '../js/mock/relations.json',
            url: '/api/bank_data/top_trade/',
            success: data => {
                if(data.status === 0) {
                    // 先保存原始数据.
                    originData.in = deepClone(data.data.out);
                    originData.out = deepClone(data.data.in);
                    operatingData.in = deepClone(data.data.out);
                    operatingData.out = deepClone(data.data.in);

                    // 显示全部隐藏企业.
                    $('.show-all-hide-node').on('click', function() {
                        operatingData.in = deepClone(originData.in);
                        operatingData.out = deepClone(originData.out);
                        if(closedLoopData.length > 0) {
                            drawTreeChart(operatingData.in, operatingData.out, closedLoopData);
                        }else {
                            drawTreeChart(operatingData.in, operatingData.out);
                        }
                    });

                    drawTreeChart(operatingData.in, operatingData.out);
                }
            }
        });
    }else {
        $('.modal-msg').html('未提供银行账号无法查询关系图');
        $('.modal').modal('show');
    }
});