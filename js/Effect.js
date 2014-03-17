/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-10
 * Description: 战斗特效
 */
(function(btg) {
	btg.Effect = me.ObjectEntity.extend({
		id: 0,
		effectName: "fire_001",
		effectImg: null,
		boat: null,
		init: function(obj, effectName, settings) {
			x = obj.pos.x + obj.hWidth;
			y = obj.pos.y + obj.marginTop;
			this.effectName = effectName;
			settings.image = this.effectName;
			settings.spritewidth = 192;
			settings.spriteheight = 190;
			x = x - settings.spritewidth / 2;
			
			this.boat = obj;
			
			// call the parent constructor
			this.parent(x, y, settings);
			this.initAnimation(x, y, settings);
		},
		
		initAnimation: function (x, y, settings) {
			this.setVelocity(1.0, 1.0);
		},
		
		onCollision: function() {
			this.collidable = false;
		},
		
		update: function() {
			this.parent(this);
			return true;
		}
	});
})(btg);