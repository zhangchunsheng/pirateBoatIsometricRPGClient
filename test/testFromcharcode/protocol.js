/**
 *Copyright(c)2013,Wozlla,www.wozlla.com
 *Version: 1.0
 *Author: Edwin Liu
 *Date: 2013-04-14
 *Description:
 */

var HEADER, Message, bt2Str;
HEADER = 5;
Message = function (id, route, body) {
    this.id = id;
    this.route = route;
    this.body = body;
};
/*
 pomele client encode
 id message id;
 route message route
 msg message body
 socketio current support string
 */
var encode = function (id, route, msg) {
    var byteArray, i, index, msgStr;
    msgStr = JSON.stringify(msg);
    if (route.length > 255) {
        throw new Error("route maxlength is overflow");
    }
    byteArray = [];
    index = 0;
    byteArray[index++] = (id >> 24) & 0xFF;
    byteArray[index++] = (id >> 16) & 0xFF;
    byteArray[index++] = (id >> 8) & 0xFF;
    byteArray[index++] = id & 0xFF;
    byteArray[index++] = route.length & 0xFF;
    i = 0;
    while (i < route.length) {
        byteArray[index++] = route.charCodeAt(i);
        i++;
    }
    i = 0;
    while (i < msgStr.length) {
        byteArray[index++] = msgStr.charCodeAt(i);
        i++;
    }
    return bt2Str(byteArray, 0, byteArray.length);
};
/*
 client decode
 msg String data
 return Message Object
 */
var decode = function (msg) {
    var arr, body, buf, id, idx, index, len, route, routeLen;
    idx = void 0;
    len = msg.length;
    arr = new Array(len);
    idx = 0;
    while (idx < len) {
        arr[idx] = msg.charCodeAt(idx);
        ++idx;
    }
    index = 0;
    buf = [];
    id = ((buf[index++] << 24) | buf[index++] << 16 | buf[index++] << 8 | buf[index++]) >>> 0;
    routeLen = buf[HEADER - 1];
    route = bt2Str(buf, HEADER, routeLen + HEADER);
    body = bt2Str(buf, routeLen + HEADER, buf.length);
    return new Message(id, route, body);
};
var bt2Str = function (byteArray, start, end) {
    var i, result;
    result = "";
    i = start;
	var s=String.fromCharCode(256);
	console.log("s:" + s);
	var num=s.charCodeAt(0);
	console.log("num:" + num);
    while (i < byteArray.length && i < end) {
		//console.log(byteArray[i]);
		//console.log(String.fromCharCode(byteArray[i]));
		if(i < 4 && byteArray[i] === 0) {
			//result = result + "\0";
			result += String.fromCharCode(256);
		} else {
			result = result + String.fromCharCode(byteArray[i]);
		}
        i++;
    }
    return result;
};