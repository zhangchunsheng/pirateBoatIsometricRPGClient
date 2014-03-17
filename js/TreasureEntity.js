/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-04-10
 * Description: 宝物
 */
(function(btg) {
	btg.TreasureEntity = me.ObjectEntity.extend({
		init: function(x, y, settings) {
			settings = {};
			settings.image = "id_items1";
			settings.spritewidth = 334;
			settings.spriteheight = 272;
			
			var height = me.game.currentLevel.realheight;
			this.position = "top";
			y = y - settings.spriteheight;
			if(y > height / 2) {
				this.position = "bottom";
				x -= 60;
				y += 100;
			} else {
				y += 70;
			}
			this.parent(x, y, settings);
			
			this.initAnimation();
			this.renderable.setCurrentAnimation(this.position + "Treasure");
		},
		
		initAnimation: function() {
			this.renderable.addAnimation("topTreasure", [2]);
			this.renderable.addAnimation("bottomTreasure", [3]);
		},
		
		update: function() {
			this.parent(this);
		},
		
		draw: function(context) {
			this.parent(context);
		}
	});
})(btg);