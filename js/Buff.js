/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-04
 * Description: buff
 */
(function(btg) {
	btg.Buff = me.ObjectEntity.extend({
		cId: 0,
		boatId: 0,
		buffImg: null,
		buffImgName: null,
		suffix: "_buff",
		init: function(obj, settings) {
			x = obj.pos.x + obj.hWidth;
			y = obj.pos.y + obj.marginTop;
			obj.cId = 0;
			this.buffImgName = obj.cId + this.suffix;
			this.buffImg = me.loader.getImage(this.buffImgName);
			x = x - this.buffImg.width * 2;
			settings.image = this.buffImgName;
			settings.spritewidth = this.buffImg.width;
			settings.spriteheight = this.buffImg.height;
			this.cId = obj.cId;
			this.boatId = obj.boatId;
			// call the parent constructor
			this.parent(x, y, settings);
		},
		
		update: function() {
			this.parent(this);
		},
		
		draw: function(context) {
			// save the previous value
			var local_alpha = context.globalAlpha;
			// semi transparency
			context.globalAlpha = this.alpha;
			// parent draw function
			this.parent(context);
			// restore previous value
			context.globalAlpha = local_alpha;
		}
	});
})(btg);