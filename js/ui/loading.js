/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-27
 * Description: 资源加载
 */
var loading = function() {
	
};
(function(loading) {
	if(typeof document.querySelector != "function") {
		document.querySelector = function(id) {
			return document.getElementById(id.replace("#", ""));
		}
	}
	loading.bg = document.querySelector("#loadingbg");
	loading.dom = document.querySelector("#loading");
	loading.info = document.querySelector("#loadingInfo");
	//loading.tips = document.querySelector("#tips");
	loading.reconnect = document.querySelector("#reconnect");
	
	loading.show = function() {
		loading.dom.style.display = "block";
	};
	
	loading.hide = function() {
		loading.bg.style.display = "none";
		loading.dom.style.display = "none";
	};
	
//	loading.showTips = function() {
//		loading.tips.style.display = "block";
//	};
//
//	loading.hideTips = function() {
//		loading.tips.style.display = "none";
//	};
	
	loading.reconnect.show = function() {
		loading.reconnect.style.display = "block";
	};
	
	loading.reconnect.hide = function() {
		loading.reconnect.style.display = "none";
	};
	
	(function() {
		loading.bg.style.width = window.innerWidth + "px";
		loading.bg.style.height = window.innerHeight + "px";
		loading.bg.style.display = "block";
		loading.dom.style.left = (window.innerWidth - 400) / 2 + "px";
		loading.dom.style.top = (window.innerHeight - 60) / 2 + "px";
		loading.dom.style.display = "block";
		
		loading.info.style.left = (window.innerWidth - 400) / 2 + 140 + "px";
		loading.info.style.top = (window.innerHeight - 60) / 2 + "px";
		
//		loading.tips.style.height = window.innerHeight + "px";
//		loading.tips.style.lineHeight = window.innerHeight + "px";
//		loading.tips.style.left = "0px";
//		loading.tips.style.top = "0px";
//		loading.tips.children[0].style.left = (window.innerWidth - 320) / 2 + "px";
//		loading.tips.children[0].style.top = (window.innerHeight - 320) / 2 + "px";
		
		loading.reconnect.style.height = window.innerHeight + "px";
		loading.reconnect.style.lineHeight = window.innerHeight + "px";
		loading.reconnect.style.left = "0px";
		loading.reconnect.style.top = "0px";
		loading.reconnect.children[0].style.left = (window.innerWidth) / 2 - 30 + "px";
		loading.reconnect.children[0].style.top = "16px";
		loading.reconnect.children[0].onclick = function() {
			btg.initSocket();
		};
		loading.reconnect.hide();
	})();
})(loading);