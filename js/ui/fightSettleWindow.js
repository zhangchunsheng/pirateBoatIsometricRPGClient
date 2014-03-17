/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-03-29
 * Description: 战斗结算窗体
 */

(function(UI, lib) {
	UI.fightSettleWindow = {};
	UI.fightSettleWindow.w = {};

	UI.fightSettleWindow.initFightSettleWindow = function (winOrLose){		
		var docfrag = document.createDocumentFragment(),
			args = fightSettleWindow[0].style;

		args.title = winOrLose ? '战斗胜利' : '战斗失败';
		args.id = 'fightSettleWindow';
		args.closed = function (){
			UI.windowManager.pop(UI.fightSettleWindow);
			UI.fightSettleWindow.w = {};
		};

		UI.fightSettleWindow.w = new lib.ui.baseWindow(args);
		args = null;
		UI.fightSettleWindow.w.dom.style.top = ui_config.window.top + UI.offset.top + 'px';
		UI.fightSettleWindow.w.dom.style.left = (960 - parseInt(this.w.dom.style.width)) / 2 + UI.offset.left + 'px';

		for (var i = fightSettleWindow[0].items.length - 1, _item, _style; i >= 0; i--) {
			_item = fightSettleWindow[0].items[i];
			_style = _item.style;
			UI.fightSettleWindow[_item.name] = [];
			for (var j = 0, _tmp; j < fightSettleWindow[0].items[i].quantity; j++) {
				for (var o in _item.differ[j]) {
					_style[o] = _item.differ[j][o];
				}
				_tmp = UI._ui.makeDom(
					'div',
					{
						className: _item.name
					},
					_style,
					null
				);
				UI.fightSettleWindow[_item.name].push(_tmp);
				docfrag.appendChild(_tmp);
				_tmp = null;
			};
		};

		// 设置特定界面的样式
		UI.fightSettleWindow.setStyle(winOrLose);

		UI.fightSettleWindow.fillData(winOrLose, data);

		UI.fightSettleWindow.w.dom.appendChild(docfrag);
		docfrag = null;

		UI.windowManager.push(UI.fightSettleWindow);

		UI.fightSettleWindow.w.dom.style.opacity = 0;
		UI.mainDiv.appendChild(UI.fightSettleWindow.w.dom);	
	}

	/**
	 * 设置特定界面的样式
	 */
	UI.fightSettleWindow.setStyle = function (winOrLose){
		for (var i = UI.fightSettleWindow['fight-tag'].length - 1, _text = ['战斗评级', '战斗奖励']; i >= 0; i--) {
			UI.fightSettleWindow['fight-tag'][i].className += winOrLose ? ' win' : ' lose';
			UI.fightSettleWindow['fight-tag'][i].innerHTML = _text[i];
		}
		for (var i = UI.fightSettleWindow['fight-cell'].length - 1; i >= 0; i--) {
			UI.fightSettleWindow['fight-cell'][i].className += winOrLose ? ' cell-win' : ' cell-lose';
		}
		for (var _text = winOrLose ? ['重新播放', '继续副本'] : ['返回副本', '再次战斗'], i = _text.length - 1; i >= 0; i--) {
			UI.fightSettleWindow['frame-btn-alone'][i].innerHTML = _text[i];
		}
		// 绑定按键点击
		UI.bind(UI.fightSettleWindow['frame-btn-alone'][0], 'click', function(e) {
			UI.stopPropagation(e);
			winOrLose ? 
				(function (){
					console.log('重新播放');
				})() :
				(function (){
					console.log('再次战斗');
				})()
		});
		UI.bind(UI.fightSettleWindow['frame-btn-alone'][1], 'click', function(e) {
			UI.stopPropagation(e);
			winOrLose ? 
				(function (){
					console.log('继续副本');
				})() :
				(function (){
					console.log('返回副本');
				})()
		});
	}
	

	/**
	 * 填充数据
	 */
	UI.fightSettleWindow.fillData = function (winOrLose, data){
		if (winOrLose){
			var _result = {
				rank: data.rank,
				rate: data.rate[0],
				reward: data.reward[0]
			}
		} else {
			var _result = {
				rank: 0,
				rate: data.rate[1],
				reward: data.reward[1]
			}
		}
		UI.fightSettleWindow['fight-purple-txt'][0].innerHTML = 'EXP：' + _result.rate.exp;
		UI.fightSettleWindow['fight-purple-txt'][1].innerHTML = '金币：' + _result.reward.gold;
		UI.fightSettleWindow['fight-golden-txt'][0].innerHTML = 'EXP：' + _result.rate.exp;
		UI.fightSettleWindow['fight-golden-txt'][1].innerHTML = '金币：' + _result.reward.gold;
		for (var i = 0; i < _result.rank; i++) {
			UI.fightSettleWindow['fight-star'][i].className += ' shine';
		};
	}

	/**
	 * 显示任务弹出框
	 * @param  {Boolean} winOrLose  true--胜利 false--失败
	 */
	UI.fightSettleWindow.show = function (winOrLose){
		if (!UI.fightSettleWindow.w.dom) {
			UI.fightSettleWindow.initFightSettleWindow(winOrLose);
		}
		UI.show(UI.fightSettleWindow.w.dom);
		UI.fightSettleWindow.w.dom.style.opacity = 1;
	}

	var data = {
		rank: 2,
		rate: [{
			exp: 500000,
			gold: 111111
		}, {
			exp: 0,
			gold: 0
		}],
		reward: [{
			exp: 340000,
			gold: 222222
		}, {
			exp: 340,
			gold: 88
		}]
	}
	
})(window.UI, smartlib);