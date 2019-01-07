/*
 * @Author: notek 
 * @Email: notek1314@gmail.com 
 * @Date: 2018/12/26
 * @Description: 检测用户登录状态.
 * @return: 登录状态 boolean
 * @params:
 */
function checkLoginStatus() {
    let user = sessionStorage.getItem('user');

    if(!user) {
        return false;
    }

    return true;
};

/*
 * @Author: notek 
 * @Email: notek1314@gmail.com 
 * @Date: 2018/12/26
 * @Description: 对对象进行深克隆.
 * @return: new object
 * @params:
 */
function deepClone(data) {
    let type = function(obj) {
        var toString = Object.prototype.toString;
        var map = {
            '[object Boolean]'  : 'boolean', 
            '[object Number]'   : 'number', 
            '[object String]'   : 'string', 
            '[object Function]' : 'function', 
            '[object Array]'    : 'array', 
            '[object Date]'     : 'date', 
            '[object RegExp]'   : 'regExp', 
            '[object Undefined]': 'undefined',
            '[object Null]'     : 'null', 
            '[object Object]'   : 'object'
        };
        return map[toString.call(obj)];
    }

    var t = type(data), o, i, ni;
    
    if(t === 'array') {
        o = [];
    }else if( t === 'object') {
        o = {};
    }else {
        return data;
    }
    
    if(t === 'array') {
        for (i = 0, ni = data.length; i < ni; i++) {
            o.push(deepClone(data[i]));
        }
        return o;
    }else if( t === 'object') {
        for( i in data) {
            o[i] = deepClone(data[i]);
        }
        return o;
    }
};

/*
 * @Author: notek 
 * @Email: notek1314@gmail.com 
 * @Date: 2018/01/07
 * @Description: 对数字做格式化处理.
 * @return: 格式化后的数字 string
 * @params:
 */
function toThousands(num) {
    if (num == undefined || num == null) {
        return '0.00';
    }

    let arr = num.toString().split('.');
    arr[0] = arr[0].replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    !arr[1] && (arr[1] = '00');
    arr[1] = arr[1].length === 1 ? arr[1] + 0 : arr[1];
    return arr.join('.');
}
