/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Dewey
 * Date: 2013-02-26
 * Description: 任务弹出框
 */
(function(UI, lib) {
	UI.taskWindow = {};
	UI.taskWindow.taskType = ['currentMainTask', 'currentBranchTask', 'currentDayTask', 'currentExerciseTask'];
	UI.taskWindow.w = {};
	/**
	 * 初始化任务弹出框
	 * @param  {Object} tasks
	 */
	UI.taskWindow.initTaskWindow = function () {
		var docfrag = document.createDocumentFragment();

		UI.taskWindow.w = new lib.ui.baseWindow({
			title: '任&nbsp;务',
			closed: function(_this){
				UI.windowManager.pop(UI.taskWindow);
				UI.taskWindow.w = {};
			},
			id: 'taskWindow'
		});
		//创建.task-content-holder对象，并填充内部节点
		for (var i = 0, holder; i < UI.taskWindow.taskType.length; i++) {
			holder = UI._ui.makeDom(
				'div',
				{
					className: taskWindow[0].items[0].name
				},
				taskWindow[0].items[0].style,
				null
			);
			holder.style.top = i * 100 + 50 + 'px';
			holder.dataset['taskType'] = UI.taskWindow.taskType[i];

			var _frag = document.createDocumentFragment();
			UI.taskWindow[UI.taskWindow.taskType[i]] = {};
			//创建内部节点
			for (var j = taskWindow[0].items.length - 1, _tmp; j > 0; j--) {
				_tmp = UI._ui.makeDom(
					'div',
					{
						className: taskWindow[0].items[j].name,
						innerHTML: taskWindow[0].items[j].innerHTML || ''
					},
					taskWindow[0].items[j].style,
					null
				);
				_frag.appendChild(_tmp);
				UI.taskWindow[UI.taskWindow.taskType[i]][_tmp.className] = _tmp;
			}
			
			//创建奖励栏项目
			UI.taskWindow[UI.taskWindow.taskType[i]].rewards = [];
			UI.taskWindow[UI.taskWindow.taskType[i]].rewards[0] = UI._ui.makeDom(
				'span',
				{},
				{
					'padding-left': '6px'
				},
				null
			);
			UI.taskWindow[UI.taskWindow.taskType[i]]['task-reward'].appendChild(UI.taskWindow[UI.taskWindow.taskType[i]].rewards[0]);
			UI.taskWindow[UI.taskWindow.taskType[i]].rewards[1] = UI._ui.makeDom(
				'span',
				{},
				{
					'padding-left': '4px'
				},
				null
			);
			UI.taskWindow[UI.taskWindow.taskType[i]]['task-reward'].appendChild(UI.taskWindow[UI.taskWindow.taskType[i]].rewards[1]);
			
			holder.appendChild(_frag);
			docfrag.appendChild(holder);
		}

		UI.taskWindow.w.dom.appendChild(docfrag);
		docfrag = null;

		UI.windowManager.push(UI.taskWindow);

		UI.taskWindow.w.dom.style.opacity = 0;
		UI.mainDiv.appendChild(UI.taskWindow.w.dom);		
	}

	/**
	 * 填充任务信息
	 * @param  {[type]} tasks 任务数据对象
	 */
	UI.taskWindow.fillData = function (tasks) {
		var cssMathcingName = [
			{
				taskStatusText : '可接',
				taskStatusClass : 'accepted',
				taskBtnText : '接受',
				taskBtnStatus : 'enableTask'
			}, {
				taskStatusText : '已接',
				taskStatusClass : 'unfinished',
				taskBtnText : '进行中',
				taskBtnStatus : 'enableTask'
			}, {
				taskStatusText : '不可接',
				taskStatusClass : 'disable',
				taskBtnText : '接受',
				taskBtnStatus : 'disableTask'
			}, {
				taskStatusText : '已完成',
				taskStatusClass : 'finished',
				taskBtnText : '提交',
				taskBtnStatus : 'submitTask'
			}];

		for (var o in tasks) {
			this[o]['task-type'].style.background = 'url(./res/ui/font/' + UI.lang + '/' + o.replace("current", "") + '.png) no-repeat';
			this[o]['task-name'].innerHTML = '[' + tasks[o].taskName + ']' + '<span class="task-' 
										+ cssMathcingName[tasks[o].status].taskStatusClass + '">('
										+ cssMathcingName[tasks[o].status].taskStatusText + ')</span>'
			this[o]['task-description'].innerHTML = tasks[o].taskDescription;
			this[o].rewards[0].innerHTML = '经验' + tasks[o].getExp;
			this[o].rewards[1].innerHTML = '金钱' + tasks[o].getMoney;
			this[o]['submit-btn'].className += ' ' + cssMathcingName[tasks[o].status].taskBtnStatus;
			this[o]['submit-btn'].innerHTML = cssMathcingName[tasks[o].status].taskBtnText;
			UI.bind(this[o]['submit-btn'], "click", function() {
				btg.findNpc(21);
				UI.taskWindow.w.destroy();
				btg.mainPlayer.isTalkToNpc = true;
			});
		}
	}


	/**
	 * 显示任务弹出框
	 */
	UI.taskWindow.showTaskWindow = function() {
		if (!UI.taskWindow.w.dom) {
			UI.taskWindow.initTaskWindow();
		}
		UI.display(UI.taskWindow.w.dom, true);
		UI.taskWindow.w.dom.style.opacity = 1;
		btg.game_socket.getCurrentTaskInfo();
	};

	/**
	 * 綁定事件
	 */
	UI.taskWindow.bindEvent = function() {
		UI.bind('#task', 'click', function(e){
			UI.stopPropagation(e);
			UI.taskWindow.showTaskWindow();
		});
	};
})(window.UI, smartlib);