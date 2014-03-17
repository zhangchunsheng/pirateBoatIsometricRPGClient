/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-03
 * Description: 敌人
 */
(function(btg) {
	btg.EnemyEntity = btg.CharacterBase.extend({
		cId: 0,
		init: function(x, y, settings, cId) {
			// call the parent constructor
			this.cId = cId;
			this.visible = false;
			settings.image = "character" + cId;
			settings.spritewidth = g_config.pirateBoat[this.cId].width;
			settings.spriteheight = g_config.pirateBoat[this.cId].height;
			this.parent(x, y, settings);
			
			this.type = me.game.ENEMY_OBJECT;
		},
		
		update: function (character) {
			this.parent(this);
		}
	})
})(btg);