$(() => {
    // 设置高度.
    $('.chart').css('height', $(window).height() - 224); // 减去的224为页面其他元素的高度和25px下边距.
    // 隐藏按钮.
    $(window).on('click', function() {
        $('.btn-operating').css({display: 'none'});
        $('.btn-operating .hide-node, .btn-operating .show-suspicious').unbind('click');
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
    function drawTreeChart(links, linksLeft) {
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
            let bbox = $('.g-box')[0].getBBox();
            let sWid = $('svg').width();
            let sHei = $('svg').height();
            
            // 设置拖拽和缩放的原点位置.
            $('.g-box').css('opacity', 1);
            canvas.transition().call(zoom_handler.transform, d3.zoomIdentity.translate((Math.abs(bbox.x) + (sWid - bbox.width) / 2), 0).scale(1));
        }, 0);

        let defs = svg.append('svg:defs')
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
        // right arrow.
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
        // define background color for link labels
        let txtBgnd = defs.append('filter')
            .attr('id', 'solid')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', 1)
            .style('opacity', 0.5);
        txtBgnd.append('feFlood')
            .attr('flood-color', 'rgb(255, 255, 255)');
        txtBgnd.append('feComposite')
            .attr('in', 'SourceGraphic');

        let stratify = d3.stratify()
            .parentId(function(d) { return d.pid; });

        let links_data = links;
        let links_data_left = linksLeft;
        
        let tree = d3.tree().size([height, width / 2 - 160]);

        let root = stratify(links_data)
            .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

        let root_left = stratify(links_data_left)
            .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

        tree(root);
        tree(root_left)
        flip_nodes(root_left, root);
        let exLinks = buildExtraLinks(root);
        exLinks = exLinks.concat(buildExtraLinks(root_left));
        
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

        function buildExtraLinks(root) {
            let links = root.descendants();
            let nodeMap = {};
            let outputLinks = []
            links.forEach(function(d) {
                nodeMap[d.id] = d;
            })

            return outputLinks;
        }

        function drawTree(root) {
            let data = root.descendants();
            let link = svg.append('g')
                .selectAll('.tree-link')
                .data(data.slice(1), function(d) {
                    return d.data.id;
                });
            link.exit().remove();
            let lent = link.enter().append('g');

            let path = lent.append('path')
                .attr('class', d => {
                    return `tree-link ${d.parent.data.id.replace(/#/g, '-')}`;
                })
                .attr('id', d => {
                    return d.data.id
                })
                .attr('d', diagonal)
                .attr('marker-end', d => {
                    if (d.data.activity == 'sell') {
                        return `url(#${d.data.activity})`
                    }
                })
                .attr('marker-start', d => {
                    if(d.data.activity == 'buy') {
                        return `url(#${d.data.activity})`
                    }
                })
                .attr('stroke', '#337ab7');

            let textpath = lent.append('text')
                .attr('dy', 5)
                .attr('filter', 'url(#solid)')
                .attr('fill', function(d) {
                    if(d.data.activity === 'buy') {
                        return '#d9534f';
                    }
                    return '#5cb85c';
                })
                .append('textPath')
                .attr('href', function(d) { 
                    return '#' + d.data.id;
                })
                .attr('startOffset', function(d) {
                    if(d.data.lv <= 1) {
                        return '30%';
                    }
                    if(d.data.lv > 1) {
                        return '50%';
                    }
                })
                .style('text-anchor', 'middle')
                .text(function(d) { 
                    if(d.data.lv > 1) {
                        return `2018/01/01 交易总额：${d.data.value.toFixed(2)}`;
                    }
                    return d.data.value.toFixed(2);
                });

            let node = svg.selectAll('.node');
            let nupd = node.data(data, function(d) {
                    return d.data.id;
                });
            let nent = nupd.enter().append('g')
                .attr('class', function(d) { return 'node' + (d.children ? ' node--internal' : ' node--leaf'); })
                .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });
            nupd.exit().remove();

            let nametext = nent.append('text')
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
                .attr('stroke', function(d) {
                    if(d.data.lv === 0) {
                        return '#000';
                    }
                })
                .on('click', function(d) {
                    if(d.data.lv > 0) {
                        let nodeId = d3.event.target.dataset.id,
                            nodeLv = d3.event.target.dataset.lv;

                        let x = d3.event.screenX, y = d3.event.screenY;
                        y += $(window).scrollTop() - 100;
                        $('.btn-operating').css({left: x, top: y, display: 'block'});

                        // 隐藏节点.
                        let dataType = d3.event.target.dataset.type;
                        $('.btn-operating .hide-node').on('click', function() {
                            if(dataType === 'sell') {
                                operatingData.out.forEach(function(od, i) {
                                    if(od.id === nodeId) {
                                        operatingData.out.splice(i, 1);
                                    }
                                });
                            }

                            if(dataType === 'buy') {
                                operatingData.in.forEach(function(od, i) {
                                    // 删除当前节点及其子节点.
                                    if(od.id === nodeId || od.pid === nodeId) {
                                        operatingData.in.splice(i, 1);
                                    }
                                });
                            }

                            drawTreeChart(operatingData.in, operatingData.out);
                        });

                        // 显示可疑资金.
                        $('.btn-operating .show-suspicious').on('click', function() {
                            $.ajax({
                                type: 'GET',
                                data: {id: nodeId, lv: nodeLv},
                                url: '../js/mock/suspicious.json',
                                success: data => {
                                    if(data.status_code === 0) {
                                        if(JSON.stringify(operatingData.in).indexOf(data.data.id) <= -1) {
                                            operatingData.in.push(data.data);
                                            drawTreeChart(operatingData.in, operatingData.out);
                                        }else {
                                            $('.modal-msg').html('可疑资金流向已显示！');
                                            $('.modal').modal('show');
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
                    return -40;
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
                        return 15;
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
                        return 32;
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
                        return 49;
                    }

                    return 19;
                })
                .text(function(d) { return d.data.related_bank; });

            // nent.append('text')
            //     .attr('filter', 'url(#solid)')
            //     .style('display', function(d) {
            //         if(d.data.lv === 0) {
            //             return 'none';
            //         }
            //     })
            //     .style('stroke', function(d) {
            //         return '#999';
            //     })
            //     .attr('x', function(d) {
            //         if(d.data.activity === 'buy') {
            //             if(d.data.lv === 1) {
            //                 return -70;
            //             }
            //             if(d.data.lv > 1) {
            //                 return -180;
            //             }
            //         }
            //         return 0;
            //     })
            //     .attr('dy', function(d) {
            //         return 4;
            //     })
            //     .text(function(d) { 
            //         if(d.data.lv > 1) {
            //             return `2018/01/01 交易总额：${d.data.value.toFixed(2)}`;
            //         }
            //         return d.data.value.toFixed(2);
            //     });

            function diagonal(d) {
                if (d.data.activity == 'buy') {
                    // return `M ${d.y} , ${d.x}
                    //     C ${d.parent.y + 100} , ${d.x}
                    //     ${d.parent.y + 100} , ${d.parent.x}
                    //     ${d.parent.y + 20} , ${d.parent.x}
                    //     T ${d.parent.y} , ${d.parent.x}`;
                    return `M ${d.y} , ${d.x}
                        C ${d.parent.y + 100} , ${d.x}
                        ${d.parent.y + 100} , ${d.parent.x}
                        ${d.parent.y + 20} , ${d.parent.x}
                        T ${d.parent.y} , ${d.parent.x}`;
                }else {
                    return `M ${d.y} , ${d.x}
                        C ${d.parent.y - 100} , ${d.x}
                        ${d.parent.y - 100} , ${d.parent.x}
                        ${d.parent.y - 20} , ${d.parent.x}
                        T ${d.parent.y} , ${d.parent.x}`;
                }
            }
        }

    };

    $.ajax({
        type: 'GET',
        data: {},
        url: '../js/mock/relations.json',
        success: data => {
            if(data.status_code === 0) {
                // 先保存原始数据.
                originData.in = deepClone(data.data.in);
                originData.out = deepClone(data.data.out);
                operatingData.in = deepClone(data.data.in);
                operatingData.out = deepClone(data.data.out);
                console.log(originData);

                // 显示全部隐藏企业.
                $('.show-all-hide-node').on('click', function() {
                    operatingData.in = deepClone(originData.in);
                    operatingData.out = deepClone(originData.out);
                    drawTreeChart(operatingData.in, operatingData.out);
                });

                drawTreeChart(operatingData.in, operatingData.out);
            }
        }
    });
});