/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Zheng Ming、Peter Zhang
 * Date: 2013-03-19
 * Description: 地砖拼图
 */
(function(btg) {
	/**
	 * a generic MultipleImage Layer Object
	 * @class
	 * @memberOf btg
	 * @constructor
	 * @param {name}   name        layer name
	 * @param {int}    width       layer width in pixels
	 * @param {int}    height      layer height in pixels
	 * @param {int}    imgWidth       per image width in pixels
	 * @param {int}    imgHeight      per image height in pixels
	 * @param {array}  mapImageNames       image data (as defined in the asset list)
	 * @param {int}    z           z position
	 * @param {float}  [ratio=1.0]   scrolling ratio to be applied
	 */
	btg.MultipleImageLayer = Object.extend({
		/**
		 * Define if and how an Image Layer should be repeated.<br>
		 * By default, an Image Layer is repeated both vertically and horizontally.<br>
		 * Property values : <br>
		 * * 'repeat' - The background image will be repeated both vertically and horizontally. (default) <br>
		 * * 'repeat-x' - The background image will be repeated only horizontally.<br>
		 * * 'repeat-y' - The background image will be repeated only vertically.<br>
		 * * 'no-repeat' - The background-image will not be repeated.<br>
		 * @public
		 * @type String
		 * @name me.ImageLayer#repeat
		 */
		//repeat: 'repeat', (define through getter/setter

		/**
		 * Define the image scrolling ratio<br>
		 * Scrolling speed is defined by multiplying the viewport delta position (e.g. followed entity) by the specified ratio<br>
		 * Default value : 1.0 <br>
		 * @public
		 * @type float
		 * @name me.ImageLayer#ratio
		 */
		ratio: 1.0,

		/**
		 * constructor
		 * @private
		 * @function
		 * var bgLayer = new btg.MultipleImageLayer('bg', me.game.currentLevel.realwidth, me.game.currentLevel.realheight, 1024, 1024, mapData, -1);
		 */
		init: function (name, width, height, imgWidth, imgHeight, mapImageNames, z) {
			// layer name
			this.name = name;

			// get the corresponding image (throw an exception if not found)
			//this.image = (imagesrc) ? me.loader.getImage(me.utils.getBasename(imagesrc)) : null;
			this.images = [];

			for (var i = 0; i < mapImageNames.length; i++) {
				for (var j = 0; j < mapImageNames[i].length; j++) {
                    if(mapImageNames[i][j]) {
                        this.images.push({
                            rect: {
                                top: i * imgWidth,
                                left: j * imgHeight,
                                right: j * imgWidth + imgWidth,
                                bottom: i * imgHeight + imgHeight
                            },
                            image : mapImageNames[i][j]//me.loader.getImage(mapImageNames[i][j])
                        });
                    }
				}
			}

			if(this.images.length === 0) {
				console.log("melonJS: can't read images in MultipleImageLayer");
			}

			this.imagewidth = imgWidth;
			this.imageheight = imgHeight;

			// displaying order
			this.z = z;

			// if ratio !=0 scrolling image
			this.ratio = 1.0;

			// last position of the viewport
			this.lastpos = me.game.viewport.pos.clone();
			// current base offset when drawing the image
			this.offset = new me.Vector2d(0, 0);

			// set layer width & height
			this.width = width ? Math.min(me.game.viewport.width, width) : me.game.viewport.width;
			this.height = height ? Math.min(me.game.viewport.height, height) : me.game.viewport.height;

			// make it visible
			this.visible = true;

			// default opacity
			this.opacity = 1.0;
		},

		/**
		 * reset function
		 * @private
		 * @function
		 */
		reset: function () {
			// clear all allocated objects
			this.image = null;
			this.lastpos = null;
			this.viewport = null;
			this.offset = null;
		},

		/**
		 * get the layer alpha channel value<br>
		 * @return current opacity value between 0 and 1
		 */
		getOpacity: function () {
			return this.opacity;
		},

		/**
		 * set the layer alpha channel value<br>
		 * @param {alpha} alpha opacity value between 0 and 1
		 */
		setOpacity: function (alpha) {
			if (alpha) {
				this.opacity = alpha.clamp(0.0, 1.0);
			}
		},

		/**
		 * update function
		 * @private
		 * @function
		 */
		update: function () {
			if (this.ratio === 0) {
				// static image
				return false;
			} else {
				// reference to the viewport
				var vpos = me.game.viewport.pos;
				// parallax / scrolling image
				if (!this.lastpos.equals(vpos)) {
					// viewport changed
					this.offset = vpos.clone();
					// this.offset.x = (this.imagewidth + this.offset.x + ((vpos.x - this.lastpos.x) * this.ratio)) % this.imagewidth;
					// this.offset.y = (this.imageheight + this.offset.y + ((vpos.y - this.lastpos.y) * this.ratio)) % this.imageheight;
					this.lastpos.setV(vpos);
					return true;
				}
				return false
			}
		},

		/**
		 * draw the image layer
		 * @private
		 */
		draw: function (context) {
			var images = this.images;
			// check if transparency
			if (this.opacity < 1.0) {
				// set the layer alpha value
				var _alpha = context.globalAlpha;
				context.globalAlpha = this.opacity;
			}

			// draw the images which entered the viewport
			for (var i = 0, len = images.length; i < len; i++) {
				var imgRect = images[i].rect;

				if (images[i].image && me.game.viewport.overlaps(imgRect)) {
					context.drawImage(images[i].image, imgRect.left, imgRect.top);
					// context.drawImage(images[i].image, sx, sy, this.imagewidth, this.imageheight );
					// context.drawImage(images[i].image, 0, 0, this.imagewidth, this.imageheight, imgRect.left - vpos.x, imgRect.top - vpos.y, this.imagewidth, this.imageheight);
				}
			}
			// restore context state
			if (this.opacity < 1.0) {
				context.globalAlpha = _alpha;
			}
		}
	});
})(btg);