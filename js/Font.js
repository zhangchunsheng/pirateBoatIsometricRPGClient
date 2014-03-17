/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-10
 * Description: 绘制文字
 */
(function(btg) {
	btg.Font = Object.extend({
		id: 0,
		type: 1,//1 - 文字 2 - 图片
		fontName: "微软雅黑 bold",
		fontSize: "14",
		fontColor: "white",
		font: null,
		fontImgName: "",
		fontImg: null,
		text: "",
		x: 0,
		y: 0,
		alpha: 1,
		container: null,
		init: function(context, obj) {
			this.fontName = obj.fontName;
			this.fontSize = obj.fontSize;
			this.fontColor = obj.fontColor;
			this.font = new me.Font(this.fontName, this.fontSize, this.fontColor);
			
			var fontSize = this.font.measureText(context, obj.effectName);
			var pos = btg.getScreenXY(new me.Vector2d(
				obj.pos.x + obj.hWidth - fontSize.width / 2, obj.pos.y - fontSize.height
			));
			this.x = pos.x;
			this.y = pos.y;
			this.container = obj;
			this.text = obj.effectName;
			
			new me.Tween(this).to({y: this.y - 50, alpha: 0}, 3000).onComplete(function() {
				obj.effectName = "";
			}).start();
		},
		
		measureText: function() {
			
		},
		
		update: function() {
			
		},
		
		draw: function(context) {
			this.drawFont(context);
		},
		
		/**
		 * 特效文字描述
		 */
		drawFont: function(context) {
			context.globalAlpha = this.alpha;
			this.font.draw(context, this.text, this.x, this.y);
			context.globalAlpha = 1;
		}
	});
})(btg);