/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-10
 * Description: 点击特效
 */
(function(btg) {
	btg.Click = me.ObjectEntity.extend({
		id: 0,
		init: function(obj, vector, canWalk, settings) {
			x = vector.x;
			y = vector.y;
			if(settings) {
				this.effectName = settings.image;
			} else {
				this.effectName = "click_000";
				settings = {};
				settings.image = this.effectName;
				settings.spritewidth = 64;
				settings.spriteheight = 128;
			}
			this.canWalk = canWalk;
			if(this.canWalk) {
                y -= settings.spriteheight - 40;
                x -= settings.spritewidth/2;
			} else {
				x -= settings.spritewidth / 2;
				y += settings.spriteheight / 2;
			}
			
			// call the parent constructor
			this.parent(x, y, settings);
			this.initAnimation(x, y, settings);
		},
		
		initAnimation: function (x, y, settings) {
			this.animationspeed = 1;
		},
		
		onCollision: function() {
			this.collidable = false;
		},
		
		update: function() {
			if(this.current.idx == this.spritecount.x - 1) {
				me.game.remove(this);
				me.game.sort();
				return false;
			}
			this.parent(this);
			return true;
		}
	});
})(btg);