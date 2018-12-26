/*
 * @Author: notek 
 * @Email: notek1314@gmail.com 
 * @Date: 2018/12/26
 * @Description: 检测用户登录状态.
 * @return: null
 * @params:
 */
function checkLoginStatus() {
    let user = sessionStorage.getItem('user');

    if(!user) {
        return false;
    }

    return true;
};