/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-03-01
 * Description: 城市传送
 */
(function(btg) {
	btg.Seaport = me.ObjectEntity.extend({
		id: 1,
		newAngle: 0,
		imgName: "seaport_001",
		img: null,
		init: function(x, y, settings) {
			this.img = me.loader.getImage(this.imgName);
			if(!settings.image) {
				settings.image = this.imgName;
				settings.spritewidth = 192;
				settings.spriteheight = 190;
				if(btg.map.style == "isometric") {//orthogonal
					var tiled = btg.map.getIsometricTileId(x, y);
					var pos = btg.map.getOrthogonalPosition(tiled.row, tiled.col);
				} else {
					var pos = {x: x, y: y};
				}
			} else {
				var pos = {x: x, y: y};
			}
			// call the parent constructor
			this.parent(pos.x, pos.y, settings);
			
			btg.map.playerLayerZ = settings.z;//获得所在的层

			this.initAnimation(pos.x, pos.y, settings);
			btg.game.currentMap.seaport = this;
			/*this.particles = [];
			for(var i = 0; i < 100; i++) {
				this.particles.push(new particle());
			}*/
		},

		initAnimation: function (x, y, settings) {
			this.setVelocity(1.0, 1.0);
			//this.addAnimation("default",  [0]);
			//this.setCurrentAnimation("default");
		},

		onCollision: function() {
			this.collidable = false;
		},

		update: function() {
			// Set the new angle increment - Big Numbers = More Fast Spin
			this.newAngle += 20;

			if (this.newAngle > 360)
				this.newAngle = 0;

			//this.angle = Number.prototype.degToRad(this.newAngle);

			//this.pos.y += this.accel.y;
			this.parent(this);
			return true;
		},

		drawParticle: function(ctx) {
			ctx.save();
			ctx.globalCompositeOperation = "source-over";
			ctx.fillStyle = "black";
			//ctx.fillRect(0, 0, me.video.getWidth(), me.video.getHeight);
			ctx.globalCompositeOperation = "lighter";

			for(var i = 0; i < this.particles.length; i++) {
				var p = this.particles[i];
				ctx.beginPath();
				//changing opacity according to the life.
				//opacity goes to 0 at the end of life of a particle
				p.opacity = Math.round(p.remaining_life / p.life * 100) / 100
				//a gradient instead of white fill
				var gradient = ctx.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
				gradient.addColorStop(0, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
				gradient.addColorStop(0.5, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
				gradient.addColorStop(1, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", 0)");
				ctx.fillStyle = gradient;
				ctx.arc(p.location.x, p.location.y, p.radius, Math.PI * 2, false);
				ctx.fill();

				//lets move the particles
				p.remaining_life--;
				p.radius--;
				p.location.x += p.speed.x;
				p.location.y += p.speed.y;

				//regenerate particles
				if(p.remaining_life < 0 || p.radius < 0) {
					//a brand new particle replacing the dead one
					this.particles[i] = new particle();
				}
			}
			ctx.restore();
		}
	});
})(btg);

function particle() {
	var mouse = {};
	//speed, life, location, life, colors
	//speed.x range = -2.5 to 2.5
	//speed.y range = -15 to -5 to make it move upwards
	//lets change the Y speed to make it look like a flame
	this.speed = {x: -2.5 + Math.random() * 5, y: -15 + Math.random() * 10};
	//location = mouse coordinates
	//Now the flame follows the mouse coordinates
	if(mouse.x && mouse.y) {
		this.location = {x: mouse.x, y: mouse.y};
	} else {
		this.location = {x: me.video.getWidth() / 2, y: me.video.getHeight() / 2};
	}
	//radius range = 10-30
	this.radius = 10 + Math.random() * 20;
	//life range = 20-30
	this.life = 20 + Math.random() * 10;
	this.remaining_life = this.life;
	//colors
	this.r = Math.round(Math.random() * 255);
	this.g = Math.round(Math.random() * 255);
	this.b = Math.round(Math.random() * 255);
}