/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-03
 * Description: 敌人的船
 */
(function(btg) {
	btg.EnemyBoat = btg.BoatBase.extend({
		boatId: 0,
		init: function(x, y, settings, isFight, cId, pId, formationPosition, layer) {
			if(isFight) {
				this.isFight = isFight;
			} else {
				this.isFight = false;
			}
			if(!this.isFight) {
				this.boatId = settings.boatId;
				this.isFight = isFight;
			} else {
				this.cId = cId;
				this.boatId = pId;
				this.formationPosition = formationPosition;
				this.layer = layer;
			}
			
			// call the parent constructor
			this.parent(x, y, settings);
			
			this.type = me.game.ENEMY_OBJECT;
		},
		
		update: function (character) {
			this.parent(this);
		}
	})
})(btg);