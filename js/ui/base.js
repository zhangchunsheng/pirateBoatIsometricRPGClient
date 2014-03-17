/**
 * UI
 * author: Peter Zhang
 * date: 2013-01-29
 */
btg.ui = btg.ui || {};
(function(ui) {
	/**
	 * 背景
	 */
	ui.BackGround = me.SpriteObject.extend({
		init:function(image) {
			this.image = me.loader.getImage(image);
			x = 0;
			y = 0;
			// parent constructor
			this.parent(x, y, this.image);
		},
		
		draw: function(context) {
			// clear the screen
			me.video.clearSurface(context, "black");
			this.parent(context);
		}
	});
	
	/**
	 * 按钮
	 */
	ui.Button = me.SpriteObject.extend({
		init:function(x, y, image, events) {
			this.imageName = image;
			for(var o in events) {
				this[o] = events[o];
			}
			this.image = me.loader.getImage(this.imageName);
			x = x;
			y = y;
			// parent constructor
			this.parent(x, y, this.image);
			
			me.input.registerMouseEvent('mousedown', this, this._mousedown.bind(this));
			me.input.registerMouseEvent('mouseup', this, this._mouseup.bind(this));
		},
		
		_click: function(e) {
			if(this.click) {
				this.click();
				return true;
			}
			return false;
		},

		_mousedown: function(e) {
			this.image = me.loader.getImage(this.imageName + "_h");
			me.game.sort();
		},
		
		_mousemove: function(e) {
			
		},
		
		_mouseup: function(e) {
			this.image = me.loader.getImage(this.imageName);
			me.game.sort();
			this._click(e);
			return false;
		}
	});
	
	/**
	 * character
	 */
	ui.Character = me.SpriteObject.extend({
		init:function(x, y, image, offset, events) {
			this.imageName = image;
			for(var o in events) {
				this[o] = events[o];
			}
			this.image = me.loader.getImage(this.imageName);
			if(this.imageName == "boy") {
				this.cId = 1;
			} else {
				this.cId = 0;
			}
			this.x = x;
			this.y = y;
			this.selectOffset = offset;
			// parent constructor
			this.parent(x, y, this.image);
			
			me.input.registerMouseEvent('mousedown', this, this._mousedown.bind(this));
			me.input.registerMouseEvent('mouseup', this, this._mouseup.bind(this));
		},
		
		_click: function(e) {
			if(this.click) {
				this.click();
				return true;
			}
			return false;
		},

		_mousedown: function(e) {
			
		},
		
		_mousemove: function(e) {
			
		},
		
		_mouseup: function(e) {
			/*var character = me.gamestat.getItemValue("chooseCharacter");
			character.pos.x = this.pos.x;
			character.pos.y = this.pos.y;*/
			if(me.gamestat.getItemValue("chooseCharacter") == ""
				|| me.gamestat.getItemValue("chooseCharacter").imageName != this.imageName) {
				this.pos.x += this.selectOffset.x;
				this.pos.y += this.selectOffset.y;
				if(me.gamestat.getItemValue("chooseCharacter") != "") {
					me.gamestat.getItemValue("chooseCharacter").pos.x = me.gamestat.getItemValue("chooseCharacter").x;
					me.gamestat.getItemValue("chooseCharacter").pos.y = me.gamestat.getItemValue("chooseCharacter").y;
				}
				btg.character.cId = this.cId;
				me.gamestat.setValue("chooseCharacter", this);
			}
			this._click(e);
			return false;
		}
	});
	
	ui.MoveableEntity = me.AnimationSheet.extend({
		init: function(x, y, image, spritewidth, spriteheight) {
			if(typeof image == "string") {
				image = me.loader.getImage(image);
			}

			this.parent(x, y, image, spritewidth, spriteheight);

			me.input.registerMouseEvent('mousedown', this, this.mouseDown.bind(this));
			me.input.registerMouseEvent('mouseup', this, this.mouseUp.bind(this));
			me.input.registerMouseEvent('mousemove', null, this.mouseMove.bind(this));
		},
		mouseUp: function(e) {
			this.mDown = false;
			// force out on touchend
			if (me.sys.touch)
				this.mouseout();
		},
		mouseDown: function(e) {
			this.mDown = true;
			if (me.sys.touch) {
				mX = me.input.mouse.pos.x;
				mY = me.input.mouse.pos.y;
			}
			this.v = new me.Vector2d(mX - this.left, mY - this.top);
			// stop propagating event
			return false;
		},
		mouseMove: function(e) {
			mX = me.input.mouse.pos.x;
			mY = me.input.mouse.pos.y;

			if (this.mDown) {
				this.pos.x = mX - this.v.x;
				this.pos.y = mY - this.v.y;
				return false;
			}
			return true;
		}
	});
	
	ui.mainScene = me.HUD_Item.extend({
		leftTop: null,
		leftBottom: null,
		rightTop: null,
		init: function(x, y) {
			this.parent(x, y);
			this.leftTop = [];
			this.leftBottom = [];
			this.rightTop = [];
		},
		
		draw: function(context) {
			
		}
	});

    ui.path = me.HUD_Item.extend({
        init: function(x, y, path) {
            this.parent(x, y);
            this.x = x;
            this.y = y;
            this.path = [].concat(path);
        },
		
        draw : function(context, x, y) {
            var vpos = me.game.viewport.pos;
            var path = this.path;
            context.save();
            context.beginPath();
            context.lineWidth = 4;
            context.strokeStyle = 'red';
            context.moveTo(path[0].x - vpos.x, path[0].y - vpos.y);
            for(var i=1; i<path.length; i++) {
                context.lineTo(path[i].x - vpos.x, path[i].y - vpos.y);
            }
            context.stroke();
            context.restore();
        }
    });

    ui.polygonShape = me.ObjectEntity.extend({
        init : function(x, y, settings, polygonV) {
            this.polygonV = polygonV;
        },
        update : function() {
            return true;
        },
        draw : function(context) {
            return;
            var vpos = me.game.viewport.pos;
            context.save();
            for(var i=0; i<this.polygonV.length; i++) {

                var poly = this.polygonV[i];
                context.lineWidth = 4;
                context.strokeStyle = 'black';
                context.beginPath();
                context.moveTo(poly[0][0]-vpos.x, poly[0][1]-vpos.y);
                for(var j=1; j<poly.length; j++) {
                    context.lineTo(poly[j][0]-vpos.x, poly[j][1]-vpos.y);
                }
                context.lineTo(poly[0][0]-vpos.x, poly[0][1]-vpos.y);
                context.stroke();
            }

            if(true) {
                var len, v, vertexes, vlen;
                var trg;
                var cell;
                var polyV = [];
                var cellV = [];
                var polygonData = this.polygonV;
                len = polygonData.length;
                for(i=0; i<len; i++) {
                    vertexes = polygonData[i];
                    v = [];
                    vlen = vertexes.length;
                    for(j=0; j<vlen; j++) {
                        v.push(new navmesh.Vector2f(vertexes[j][0], vertexes[j][1]));
                    }
                    polyV.push(new navmesh.Polygon(v.length, v));
                }
                var d = new navmesh.Delaunay();
                var triangleV = d.createDelaunay(polyV);

                for(i=0; i<triangleV.length; i++) {
                    trg = triangleV[i];
                    context.lineWidth = 2;
                    context.strokeStyle = 'blue';
                    context.beginPath();
                    context.moveTo(trg.pointA.x-vpos.x, trg.pointA.y-vpos.y);
                    context.lineTo(trg.pointB.x-vpos.x, trg.pointB.y-vpos.y);
                    context.lineTo(trg.pointC.x-vpos.x, trg.pointC.y-vpos.y);
                    context.stroke();
                }
            }

            context.fillText(btg.mainPlayer.pos.x + ',' + btg.mainPlayer.pos.y, 300, 300);
            context.fillText(me.input.mouse.pos.x + ',' + me.input.mouse.pos.y, 300, 350);
            context.restore();
        }
    });
	
	ui.rect = me.HUD_Item.extend({
		init: function(x, y, width, height, path, type) {
			this.parent(x, y);
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.sideLength = Math.round(Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)));
			this.path = path;
			this.type = type;
		},
		
		draw: function(context) {
			this.drawPath(context);
		},
		
		drawPath: function(context) {
			context.save();
			context.translate(this.x, this.y);
			context.fillStyle = "black";
			context.fillText("orthogonal x:" + (me.game.viewport.pos.x + this.x) + " y:" + (me.game.viewport.pos.y + this.y), -43, 0);
			var x = 0;
			var y = 0;
			x = (me.game.viewport.pos.x + this.x) - me.game.currentLevel.realwidth / 2;
			context.fillText("isometric x:" + x + " y:" + ((me.game.viewport.pos.y + this.y) - me.game.currentLevel.tileheight / 2), -43, 10);
			context.fillText("ort_tiled x:" + Math.floor((me.game.viewport.pos.y + this.y) / me.game.currentLevel.tileheight) + " y:" + Math.floor((me.game.viewport.pos.x + this.x) / me.game.currentLevel.tilewidth), -43, 20);
			context.fillText("iso_tiled x:" + Math.floor(((me.game.viewport.pos.y + this.y) - me.game.currentLevel.tileheight / 2) / (me.game.currentLevel.tileheight / 2)) + " y:" + Math.floor(x / (me.game.currentLevel.tilewidth / 2)), -43, 30);
			x = Math.floor(x / (me.game.currentLevel.tilewidth / 2)) * me.game.currentLevel.tilewidth / 2 + me.game.currentLevel.realwidth / 2;
			y = Math.floor(((me.game.viewport.pos.y + this.y) - me.game.currentLevel.tileheight / 2) / (me.game.currentLevel.tileheight / 2)) * me.game.currentLevel.tileheight / 2 + me.game.currentLevel.tileheight / 2;
			context.fillStyle = "green";
			context.globalAlpha = 0.6;
			context.scale(1, 0.5);
			context.rotate(45 * Math.PI / 180);
			context.fillRect(0, 0, this.sideLength / 2, this.sideLength / 2);
			context.globalAlpha = 0.2;
			context.fillStyle = "yellow";
			//context.fillRect((x - me.game.viewport.pos.x) - this.x, (y - me.game.viewport.pos.y) - this.y, this.sideLength / 2, this.sideLength / 2);
			context.restore();
			context.save();
			if(this.path.length > 0) {
				var pos = null;
				var _pos = {x: btg.mainPlayer.pos.x - me.game.viewport.pos.x + btg.mainPlayer.width / 2, y: btg.mainPlayer.pos.y - me.game.viewport.pos.y + btg.mainPlayer.height};
				context.translate(_pos.x, _pos.y);
				context.beginPath();
				context.strokeStyle = "#000000";
				//context.moveTo(pos.x - me.game.viewport.pos.x, pos.y - me.game.viewport.pos.y);
				context.arc(0, 0, 5, 0, 2 * Math.PI);
				for(var i = 0 ; i < this.path.length ; i++) {
					if(this.type == 1) {
						pos = convertToOrthogonalPixel(this.path[i].pos.x, this.path[i].pos.y, 1);
					} else {//get position from isometric
						pos = btg.map.isometricGridXY[this.path[i].pos.x][this.path[i].pos.y].orthogonal;
					}
					context.lineTo(pos.x - 20 - me.game.viewport.pos.x + btg.mainPlayer.width / 2 - _pos.x, pos.y + 20 - me.game.viewport.pos.y + btg.mainPlayer.height - _pos.y);
					context.arc(pos.x - 20 - me.game.viewport.pos.x + btg.mainPlayer.width / 2 - _pos.x, pos.y + 20 - me.game.viewport.pos.y + btg.mainPlayer.height - _pos.y, 5, 0, 2 * Math.PI);
				}
				context.stroke();
			}
			context.restore();
		}
	});
	
	ui.loading = me.HUD_Item.extend({
		allcount: 0,
		count: 0,
		init: function(x, y) {
			this.leftImg
			this.loadingImg
			this.rightImg
		},
		
		draw: function(context) {
			
		}
	});
})(btg.ui);