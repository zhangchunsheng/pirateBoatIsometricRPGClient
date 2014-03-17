/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Peter Zhang
 * Date: 2013-01-23
 * Description: seaking
 */
var seaking = {
	onload: function() {
		btg.calculateScreen();
		if (!me.video.init('jsapp', btg.screen.width, btg.screen.height)) {
			alert("Sorry but your browser does not support html 5 canvas.");
			return;
		}
		me.state.set(me.state.LOADING, new btg.DefaultLoadingScreen());
		me.state.set(me.state.Ready, new btg.StartScreen());
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new btg.PlayScreen());
		
		me.sys.useNativeAnimFrame = true;

		// set gravity to zero
		me.sys.gravity = 0;
		// initialize the "audio"
		me.audio.init("mp3,ogg");

		// set all resources to be loaded
		me.loader.onload = this.loaded.bind(this);

		// set all resources to be loaded
		// me.loader.preload(g_resources);

		// load everything & display a loading screen
		// me.state.change(me.state.LOADING);
	},

	loaded: function() {
		console.log(me);
		me.state.change(me.state.Ready);
	},

	/**
	 * 初始化等级
	 */
	initLevel: function() {
		// start the game
		me.state.change(me.state.PLAY);
		
		// add our player entity in the entity pool
		me.entityPool.add("mainPlayer", btg.PlayerEntity);
		// add npc
		me.entityPool.add("NpcEntity", btg.NpcEntity);
		// add seaport
		me.entityPool.add("Seaport", btg.Seaport);
		
		me.entityPool.add("EnemyBoat", btg.EnemyBoat);
		me.entityPool.add("FenceEntity", btg.FenceEntity);
		me.entityPool.add("TreasureEntity", btg.TreasureEntity);

		me.game.addHUD(0, 0, me.game.viewport.getWidth(), me.game.viewport.getHeight());
		//me.game.HUD.addItem("mainScene", new btg.ui.mainScene(0, 0));

		me.debug.renderHitBox = btg.debug;
		me.debug.renderCollisionMap = btg.debug;
	},

	registerEvent: function(rect) {
		me.input.registerMouseEvent("mousedown", rect, mouseDown, true);
		me.input.registerMouseEvent("mousemove", rect, mouseMove, true);
		me.input.registerMouseEvent("mouseup", rect, mouseUp, true);

		// enable the keyboard (to navigate in the map)
		me.input.bindKey(me.input.KEY.LEFT,	 "left");
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.UP,	 "up");
		me.input.bindKey(me.input.KEY.DOWN,	 "down");
	},

	unregisterEvent: function(rect) {
		me.input.releaseMouseEvent("mousedown", rect);
		me.input.releaseMouseEvent("mousemove", rect);
		me.input.releaseMouseEvent("mouseup", rect);
	},

	showMainSceneUI: function() {
		btg.canvas = UI.getDom("#jsapp > canvas");
		UI.init(true);
		UI.loading(UI.initMainScene, ui_resources.mainScene);
	},

	/**
	 * 进入上一个城市
	 */
	gotoPreviousLevel: function() {
		// reset everything
		me.game.reset();

		btg.game.currentLevel--;
		// load the new level
		btg.game.loadLevel(btg.game.currentLevel);
	},

	/**
	 * 进入下一个城市
	 */
	gotoNextLevel: function() {
		// reset everything
		me.game.reset();

		btg.game.currentLevel++;
		// load the new level
		btg.game.loadLevel(btg.game.currentLevel);
	},
	
	/**
	 * 进入另一个城市
	 */
	gotoLevel: function(levelId) {
		// reset everything
		me.game.reset();

		btg.game.currentLevel = levelId;
		
		// load the new level
		btg.game.loadLevel(btg.game.currentLevel);
	},
	
	/**
	 * 进入副本
	 */
	gotoIdLevel: function(levelId) {
		// reset everything
		me.game.reset();
		
		btg.game.currentIdLevel = levelId;
		// load the new level
		btg.game.loadIdLevel(btg.game.currentIdLevel);
	},

	/**
	 * 重置
	 */
	reset: function() {
		me.game.reset();
		// load a level
		me.levelDirector.loadLevel("map" + btg.game.currentLevel);

		if(btg.map.graph == null) {
			me.game.sort();
			btg.map.graph = btg.map.getGraph();
		}
		// move the camera to the center of the map
		// me.game.viewport.move(me.game.currentLevel.realwidth / 2,me.game.currentLevel.realheight / 2);
	},

	onUpdateFrame: function() {
		// update our sprites
		me.game.update();

		// draw the rest of the game
		me.game.draw();
	},

	onDestroyEvent: function () {
		// remove the HUD
		me.game.disableHUD();

		// stop the current audio track
		me.audio.stopTrack();
	}
};