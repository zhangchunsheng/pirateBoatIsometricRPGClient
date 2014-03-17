/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-01-28
 * Description: 進度條
 */
btg = btg || {};

(function(btg) {
	btg.DefaultLoadingScreen = me.DefaultLoadingScreen.extend({
		init: function() {
			this.parent(true);
			// wozllaGame logo
			this.logo1.set('century gothic', 32, 'yellow', 'middle');
			this.logo2.set('century gothic', 32, 'red', 'middle');
		},
		
		draw: function(context) {
			// measure the logo size
			var logo1_width = this.logo1.measureText(context, "wozlla").width;
			var xpos = (context.canvas.width - logo1_width - this.logo2.measureText(context, "Game").width) / 2;
			var ypos = context.canvas.height / 2;
				
			// clear surface
			me.video.clearSurface(context, "black");
			
			// draw the melonJS logo
			this.logo1.draw(context, 'wozlla', xpos , ypos);
			xpos += logo1_width;
			this.logo2.draw(context, 'Game', xpos, ypos);
			
			ypos += this.logo1.measureText(context, "wozlla").height / 2;

			// display a progressive loading bar
			var progress = Math.floor(this.loadPercent * context.canvas.width);

			// draw the progress bar
			context.strokeStyle = "silver";
			context.strokeRect(0, ypos, context.canvas.width, 6);
			context.fillStyle = "#89b002";
			context.fillRect(2, ypos + 2, progress - 4, 2);
		}
	});
})(btg);