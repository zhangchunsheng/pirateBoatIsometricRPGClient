/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-05
 * Description: 相關實體類
 */
/**
 * ProgressEntity
 */
(function(btg) {
	btg.ProgressEntity = me.ObjectEntity.extend({
		currentPosition: 100,
		type: "life",//life anger
		bgImgName: "fi_life_bg",
		bgImg: null,
		leftImg: null,
		rightImg: null,
		centerImg: null,
		prefix: "fi_",
		suffix_left: "_left",
		suffix_center: "_center",
		suffix_right: "_right",
		x: 0,
		y: 0,
		anchor: 0,
		paddingTop: 3,
		paddingLeft: 3,
		paddingRight: 7,
		beginX: 0,
		beginY: 0,
		length: 0,
		updated: true,
		boat: null,
		percent: 0,
		init: function(obj, settings, type) {
			// call the parent constructor
			this.type = type;
			this.bgImg = me.loader.getImage(this.bgImgName);
			settings.image = this.bgImgName;
			settings.spritewidth = this.bgImg.width;
			settings.spriteheight = this.bgImg.height;
			this.leftImg = me.loader.getImage(this.prefix + this.type + this.suffix_left);
			this.rightImg = me.loader.getImage(this.prefix + this.type + this.suffix_right);
			this.centerImg = me.loader.getImage(this.prefix + this.type + this.suffix_center);
			this.x = obj.pos.x + obj.hWidth - g_config.map.level[btg.game.currentLevel].fightSceneX;
			this.x = this.x - this.bgImg.width / 2;
			this.y = obj.pos.y + obj.marginTop - g_config.map.level[btg.game.currentLevel].fightSceneY;
			//this.length = Math.floor((this.bgImg.width - this.leftImg.width * 2) / this.centerImg.width);
			this.length = this.bgImg.width - this.leftImg.width * 2 - this.paddingLeft * 2;
			if(this.type == "anger") {
				this.y += this.bgImg.height;
			}
			this.beginX = this.x + this.paddingLeft;
			this.beginY = this.y + this.paddingTop;
			this.boat = obj;
			this.animationspeed = me.sys.fps / 1;
			//this.parent(x, y, settings);
		},
		
		update: function(progress) {
			if(this.type == "life") {
				this.percent = this.boat.currentLife / this.boat.life;
			} else {
				this.percent = this.boat.currentAnger / this.boat.fullAnger;
				if(this.percent >= 1)
					this.percent = 1;
			}
			this.x = this.boat.pos.x + this.boat.hWidth - me.game.viewport.pos.x;
			this.y = this.boat.pos.y + this.boat.marginTop - me.game.viewport.pos.y;
			this.x = this.x - this.bgImg.width / 2;
			if(this.type == "anger") {
				this.y += this.bgImg.height;
			}
			this.beginX = this.x + this.paddingLeft;
			this.beginY = this.y + this.paddingTop;
		},
		
		draw: function(ctx) {
			if(this.updated) {
				ctx.save();
				this.drawBackground(ctx);
				if(this.percent != 0) {
					this.drawLeft(ctx);
					this.drawCenter(ctx);
					this.drawRight(ctx);
				}
				ctx.restore();
			}
		},
		
		/**
		 * 創建背景
		 */
		drawBackground: function(ctx) {
			ctx.drawImage(this.bgImg, this.x, this.y);
		},
		
		/**
		 * 創建左邊
		 */
		drawLeft: function(ctx) {
			ctx.drawImage(this.leftImg, this.beginX, this.beginY);
		},
		
		/**
		 * 創建中間
		 */
		drawCenter: function(ctx) {
			/*for(var i = 0 ; i < this.length ; i++) {
				ctx.drawImage(this.centerImg, this.beginX + this.leftImg.width + i * this.centerImg.width, this.beginY);
			}*/
			ctx.drawImage(this.centerImg, 0, 0, this.centerImg.width, this.centerImg.height, this.beginX + this.leftImg.width, this.beginY, this.length * this. percent, this.centerImg.height);
		},
		
		/**
		 * 創建右邊
		 */
		drawRight: function(ctx) {
			ctx.drawImage(this.rightImg, this.beginX + this.leftImg.width + this.length * this. percent, this.beginY);
		}
	});
})(btg);