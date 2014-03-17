/**
 * screen object
 * author: peter
 * date: 2013-01-28
 */
/* the in game stuff*/
btg = btg || {};
(function(btg) {
	//start screen
	btg.StartScreen = me.ScreenObject.extend({
		startScene: [],
		clouds: [],
		init: function() {
			this.zIndex = 1;
			this.startScene = [{
				name: "cc_bg",
				x: 0,
				y: 0,
				visible: true
			}, {
				name: "boy",
				x: 246,
				y: 106,
				visible: true
			}, {
				name: "boy_stage",
				x: 200,
				y: 261,
				visible: true
			}, {
				name: "girl",
				x: 577,
				y: 113,
				visible: true
			}, {
				name: "girl_stage",
				x: 526,
				y: 261,
				flip: true,
				visible: true
			}, {
				name: "play",
				x: 359,
				y: 414,
				visible: true
			}];
			this.startScene.items = {};
			for(var i = 0 ; i < this.startScene.length ; i++) {
				//this.startScene[i].image = me.loader.getImage(this.startScene[i].name);
				this.startScene.items[this.startScene[i].name] = {
					x: this.startScene[i].x,
					y: this.startScene[i].y
				};
			}
			this.cloudType = {
				"1": {
					width: 452,
					height: 276
				},
				"2": {
					width: 350,
					height: 202
				}
			};
			this.clouds = [{
				type: 1,
				x: 100,
				y: 100
			}, {
				type: 2,
				x: 300,
				y: 300
			}, {
				type: 1,
				x: 400,
				y: 400
			}];
			this.parent(true);
			// make sure the background is black
			me.video.clearSurface(me.video.getSystemContext(), "black");//getScreenFrameBuffer() me.video.getSystemContext()
		},
		
		update: function() {
			
		},

		onResetEvent: function() {
			//loading.hide();
			//bg
			me.game.add(new btg.ui.BackGround("cc_bg"), this.zIndex++);
			//cloud
			for(var i = 0 ; i < this.clouds.length ; i++) {
				this.clouds[i].sprite = new me.SpriteObject(
					this.clouds[i].x,
					this.clouds[i].y,
					me.loader.getImage("clouds" + this.clouds[i].type)
				);
				(function(obj, i) {
					obj.clouds[i].tween = new me.Tween(obj.clouds[i].sprite.pos).to({
						x: -100
					}, 20000).onComplete(obj.tweenbw.bind(obj, i)).start()
				})(this, i);
				me.game.add(this.clouds[i].sprite, this.zIndex);
			}
			this.zIndex++;
			//stage
			this.boyStage = new me.SpriteObject(
				this.startScene.items["boy_stage"].x,
				this.startScene.items["boy_stage"].y,
				me.loader.getImage("stage")
			);
			this.girlStage = new me.SpriteObject(
				this.startScene.items["girl_stage"].x,
				this.startScene.items["girl_stage"].y,
				me.loader.getImage("stage")
			);
			this.girlStage.flipX();
			me.game.add(this.boyStage, this.zIndex);
			me.game.add(this.girlStage, this.zIndex);
			this.zIndex++;
			//player
			this.boy = new btg.ui.Character(
				this.startScene.items["boy"].x,
				this.startScene.items["boy"].y,
				"boy",
				{x: -10, y: 10}
			);
			this.girl = new btg.ui.Character(
				this.startScene.items["girl"].x,
				this.startScene.items["girl"].y,
				"girl",
				{x: 10, y: 10}
			);
			me.game.add(this.boy, this.zIndex);
			me.game.add(this.girl, this.zIndex);
			/*me.gamestat.add("chooseCharacter", new me.AnimationSheet(
				this.startScene.items["boy"].x,
				this.startScene.items["boy"].y,
				me.loader.getImage("chooseCharacter"),
				192,
				192
			));*/
			me.gamestat.add("chooseCharacter", "");
			//me.game.add(me.gamestat.getItemValue("chooseCharacter"), this.zIndex);
			this.zIndex++;
			//btn
			me.game.add(new btg.ui.Button(
					this.startScene.items["play"].x,
					this.startScene.items["play"].y,
					"play",
					{
						click: function() {
							me.game.viewport.fadeIn("#000000", 1000, function() {
								//loading.info.style.display = "block";
								seaking.initLevel();
								//window.location.reload();
							});
						}
					}), this.zIndex++);
		},
		
		tweenbw: function(i) {
			this.clouds[i].sprite.pos.x = 1000;
			this.clouds[i].tween.to({
				x: -1000
			}, 20000).onComplete(this.tweenbw.bind(this, i)).start();
		},

		tweenff: function(i) {
			this.clouds[i].tween.to({
				x: 0
			}, 20000).onComplete(this.tweenbw.bind(this, i)).start();
		},
		
		onDestroyEvent: function() {
			console.log('onDestory');
		},

		handleEvent: function() {

		},

		draw: function(context) {
			
		},
		
		_draw: function(context) {
			context.save();
			for(var i = 0 ; i < this.startScene.length ; i++) {
				if(this.startScene[i].visible) {
					context.drawImage(this.startScene[i].image, this.startScene[i].x, this.startScene[i].y);
				}
			}
			context.restore();
		}
	});

	//play screen
	btg.PlayScreen = me.ScreenObject.extend({
		currentLevel: 0,
		init: function() {
			this.parent(true);
		},

		onResetEvent: function () {
			btg.game.loadLevel(btg.game.currentLevel);
		},

		onUpdateFrame: function() {
			// navigate the map :)
			if(me.input.isKeyPressed('left')) {
				me.game.viewport.move(-(me.game.currentLevel.tilewidth / 2),0);
				// force redraw
				// me.game.repaint();

			} else if (me.input.isKeyPressed('right')) {
				me.game.viewport.move(me.game.currentLevel.tilewidth / 2,0);
				// force redraw
				// me.game.repaint();
			}

			if(me.input.isKeyPressed('up')) {
				me.game.viewport.move(0,-(me.game.currentLevel.tileheight / 2));
				// force redraw
				// me.game.repaint();
			} else if (me.input.isKeyPressed('down')) {
				me.game.viewport.move(0,me.game.currentLevel.tileheight / 2);
				// force redraw
				// me.game.repaint();
			}

			this.parent(this);
		},

		onDestroyEvent: function () {
			// remove the HUD
			me.game.disableHUD();

			// stop the current audio track
			me.audio.stopTrack();
		},

		draw: function(context) {
			this.parent(context);
		}
	});

	//fight screen
	btg.FightScreen = me.ScreenObject.extend({
		init: function() {
			//this.parent(true);
		},
		onResetEvent: function () {
			btg.game.isFight = true;
			btg.game.loadLevel(btg.game.currentLevel);
		},

		onDestroyEvent: function () {
			// remove the HUD
			me.game.disableHUD();

			// stop the current audio track
			me.audio.stopTrack();
		},

		draw: function(context) {

		}
	});
	
	//instanceDungeon screen
	btg.InstanceDungeonScreen = me.ScreenObject.extend({
		init: function() {
			//this.parent(true);
		},
		onResetEvent: function () {
			btg.game.currentScene = "id";
			btg.game.loadIdLevel(btg.game.currentIdLevel);
		},

		onDestroyEvent: function () {
			// remove the HUD
			me.game.disableHUD();

			// stop the current audio track
			me.audio.stopTrack();
		},

		draw: function(context) {

		}
	});
})(btg);