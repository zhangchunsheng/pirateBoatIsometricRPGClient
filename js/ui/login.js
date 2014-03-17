/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-02-26
 * Description: 登录页面
 */
(function(UI, lib) {
	/**
	 * 初始化登录页
	 */
	UI.initLoginPage = function(){
		UI.mainDiv.innerHTML = '<img src="./res/ui/layout/login/denglu_bg.jpg" /><div id="form"><div class="input-wrap">输入用户名<input name="user_name" type="text"></div><div class="input-wrap">输入密&nbsp;&nbsp;码<input name="user_name" type="text"></div><div id="changeUser"></div><div id="login"></div></div>';

		UI.bind('changeUser', 'click', UI.initRegister);
		UI.bind('login', 'click', function(){
			
		})
	};

	/**
	 * 初始化注册页
	 */
	UI.initRegister = function(){
		UI.mainDiv.innerHTML = '<img src="./res/ui/layout/login/denglu_bg.jpg" /><div id="form"><div class="input-wrap">输入用户名<input name="user_name" type="text"><span class="instruct">5-50字符，数字和字母</span></div><div class="input-wrap">输入密&nbsp;&nbsp;码<input name="user_name" type="text"><span class="instruct">6-32字符，数字和字母</span></div><div class="input-wrap">输入密&nbsp;&nbsp;码<input name="user_name" type="text"></div><div id="backToLogin"></div><div id="createUser"></div></div>';

		UI.bind('backToLogin', 'click', UI.initLoginPage);
		UI.bind('createUser', 'click', function(){
			
		});
	};
})(window.UI, smartlib);