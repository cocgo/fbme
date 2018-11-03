// api接口
module.exports = {
    
    randomString(len) {
        len = len || 32;
        // 默认去掉了容易混淆的字符oO,Ll,9gq,Vv,Uu,I1
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    },
    
    // 原生随机数获取
    getOrgR(maxNum){
        return Math.floor(Math.random()*888888+1) % maxNum;
    },
    
    getClientIp(req) {
        var ip = req.headers['x-forwarded-for'] ||
                req.ip ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress || '';
        if(ip.split(',').length>0){
            ip = ip.split(',')[0]
        }
        // console.log(ip);
        ip = ip.match(/\d+.\d+.\d+.\d+/);
        // console.log(ip);
        ip = ip ? ip.join('.') : null;
        // console.log(ip);
        return ip;
    },

    getStrDay(){
        return (new Date()).format('yyyy-MM-dd');
    },
    getStrTime(){
        return (new Date()).format('yyyy-MM-dd hh:mm:ss');
    },
    getUnixTime(){
        return (Math.round(new Date().getTime()/1000) );
    },
    // 获得本周的开始时间戳
    getFirstWeekUnix(){
        // 本周一 时间戳
        var nt = this.getFirstDayOfWeek(new Date());
        return (Math.round(nt.getTime()/1000) );
    },
    // 获得本月的开始时间戳
    getMonthStartUnix() {
        var nt = this.getFirstDayOfWeek(new Date());
        var monthStartDate = new Date(nt.getFullYear(), nt.getMonth(), 1);
        return (Math.round(monthStartDate.getTime()/1000) );
    },

    getFirstDayOfWeek(date) {
        var day = date.getDay() || 7;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
    },
    getFirstWeekStr(){
        // 每周一凌晨清除
        var nt = this.getFirstDayOfWeek(new Date());
        return nt.format("yyyy-MM-dd");
    },

};


Date.prototype.format = function(format)
{
    var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
    "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
    RegExp.$1.length==1 ? o[k] :
    ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
};