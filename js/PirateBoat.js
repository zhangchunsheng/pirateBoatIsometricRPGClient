/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-02-05
 * Description: 海盜船類
 */
(function(btg) {
	btg.PirateBoat = btg.BoatBase.extend({
		init: function(x, y, settings, isFight, cId, pId, formationPosition, layer) {
			if(isFight) {
				this.isFight = isFight;
			} else {
				this.isFight = false;
			}
			this.cId = cId;
			this.boatId = pId;
			this.formationPosition = formationPosition;
			this.layer = layer;
			// call the parent constructor
			this.parent(x, y, settings);
			
			//this.setVelocity(6, 6);
			
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
		},
		
		update: function (character) {
			if(this.pos.y > me.game.currentLevel.realheight - 200) {
				this.setVelocity(0, 0);
				var self = this;
				new me.Tween(this.pos).to({x: this.pos.x - 60}, 1000).onComplete(function() {
					loading.info.style.display = "block";
					me.game.viewport.fadeIn("#000000", 1000, function() {
						seaking.gotoLevel(2);
					});
				}).start();
				return false;
			}
			this.parent(this);
		}
	})
})(btg);