/**
 * Copyright(c)2013,Wozlla,www.wozlla.com
 * Version: 1.0
 * Author: Zheng Ming
 * Date: 2013-03-10
 * Description: 寻路
 */
(function() {
   /*
    *  !! keywords
    *  tile coords : 矩阵（二维数组）坐标
    *  pixel coords : 像素坐标（地图中未做任何转换的点)
    *
    */

    var userPathFinder = true;

    var pathSearcherSingleton = new function() {
        var prefix = 'graph';
        var hash = 0;
        var delta = 1;

        var _this = this;

        this.graphWeightCache = {};

        /**
         * @param startPixel 启始点像素坐标
         * @param endPixel   结束点像素坐标
         * @param collisionMap (optional) 指定一个碰撞地图
         * @return 砖块的坐标路径
         */
        this.searchTileCoordsPath = function(startPixel, endPixel, collisionMap) {
            collisionMap = collisionMap || me.game.currentLevel.getLayerByName('collision');
            var key = collisionMap.$_graph_hash;
            if(!key) key = collisionMap.$_graph_hash = prefix + (hash++);
            var graphWeight = null;
            var graph = _this.graphWeightCache[key];
            if(!graph) {
                var grid = collisionMap.layerData;
                graphWeight = [];
                var rowCount = grid.length;
                var colCount = grid[0].length;
                for(var i= 0; i<rowCount; i++) {
                    var row = [];
                    for(var j= 0; j<colCount; j++) {
                        var val = grid[i][j] ? 0 : 1;
                        for(var x=0; x<delta; x++) {
                            row.push(val);
                        }

                    }
                    for(var z=0; z<delta; z++) {
                        graphWeight.push(row);
                    }
                }
                graph = new Graph(graphWeight);
                this.graphWeightCache[key] = graph;
                //console.log(graphWeight.length, graphWeight[0].length);
            }

            var renderer = _this.getRenderer(collisionMap);
            var startTileCoords = renderer.pixelToTileCoords(startPixel.x, startPixel.y).ceilSelf();
            var endTileCoords = renderer.pixelToTileCoords(endPixel.x, endPixel.y).ceilSelf();
            //console.log(startTileCoords, endTileCoords);
            var startNode = graph.nodes[startTileCoords.x][startTileCoords.y];
            var endNode = graph.nodes[endTileCoords.x][endTileCoords.y];
            if(endNode.isWall()) {
                endNode = this.searchClosestMovableTileCoords(startPixel, endPixel, graph, renderer);
            }
            var enableDiagonal = true;
            var path = astar.search(graph.nodes, startNode, endNode, enableDiagonal);
            //console.log(path);
            return path;
        };

        this.searchClosestMovableTileCoords = function(startPixel, endPixel, graph, renderer) {
            var xDiv = endPixel.x - startPixel.x > 0 ? 10 : -10;
            var yDiv = 10 * Math.abs((endPixel.y - startPixel.y)/(endPixel.x - startPixel.x));
            yDiv = endPixel.y - startPixel.y > 0 ? yDiv : -yDiv;

            while(true) {

                endPixel.x -= xDiv;
                endPixel.y -= yDiv;

                var tileCoords = renderer.pixelToTileCoords(endPixel.x, endPixel.y).ceilSelf();
                var node = graph.nodes[tileCoords.x][tileCoords.y];
                if(!node.isWall()) {
                    return node;
                }
            }

            return null;

        };

        /**
         * @param startPixel 启始点像素坐标
         * @param endPixel   结束点像素坐标
         * @param collisionMap (optional) 指定一个碰撞地图
         * @return 像素坐标路径
         */
        this.searchPixelCoordsPath = function(startPixel, endPixel, collisionMap) {
            var tileCoordsPath = _this.searchTileCoordsPath(startPixel, endPixel, collisionMap);
            var renderer = _this.getRenderer(collisionMap);
            var paths = [];
            for(var i = 0, len = tileCoordsPath.length; i < len; i++) {
                var pixCoords = renderer.tileToPixelCoords(tileCoordsPath[i].x, tileCoordsPath[i].y).ceilSelf();
                paths.push(pixCoords);
            }
            return paths;
        };

        this.getRenderer = function(layer) {
            layer = layer || me.game.currentLevel.getLayerByName('collision');
            var renderer = layer.extension_renderer;// || layer.renderer;
            if(!renderer) {
                switch (layer.orientation) {
                    case "orthogonal": {
                        renderer = new me.TMXOrthogonalRenderer(layer.width, layer.height, layer.tilewidth, layer.tileheight);
                        break;
                    }
                    case "isometric": {
                        renderer = new me.TMXIsometricRenderer(layer.width*delta, layer.height*delta , layer.tilewidth/delta, layer.tileheight/delta);
                        break;
                    }
                    // if none found, throw an exception
                    default : {
                        throw "melonJS: " + this.orientation + " type TMX Tile Map not supported!";
                    }
                }
                layer.extension_renderer = renderer;
            }
            return renderer;
        };
    };

    var navMeshPathSearcher = new function() {

        var keyGen = 0;

        var navMeshCache = {};



        this.searchPath = function(polygonData, startPixel, endPixel) {
            var i, j, len, v, vertexes, vlen;
            var trg;
            var cell;
            var key = polygonData._navMeshKey = polygonData._navMeshKey || 'nav_mesh_' + keyGen++;
            var cellV = [];
            var polyV = [];

            var navMesh;
            if(true || (cellV.length === 0 && polygonData)) {

                var triangleV = navMeshCache[key];
                if(!triangleV) {
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
                    triangleV = d.createDelaunay(polyV);
                    navMeshCache[key] = triangleV;
                }

                //构建寻路cell
                for (j=0; j<triangleV.length; j++) {
                    trg = triangleV[j];
                    cell = new navmesh.Cell(trg.getVertex(0), trg.getVertex(1), trg.getVertex(2));
                    cell.index = j;
                    cellV.push(cell);
                }
                for(i=0; i<cellV.length; i++) {
                    var pCellA = cellV[i];
                    for(j=0; j<cellV.length; j++) {
                        var pCellB = cellV[j];
                        if (pCellA != pCellB) {
                            pCellA.checkAndLink(pCellB);
                        }
                    }
                }
                //navMeshCache[key] = cellV;
            }

            navMesh = new navmesh.NavMesh(cellV);
            var path = navMesh.findPath(startPixel, endPixel);
            path && path.shift();
            return path;
        };


    };

    btg.pathSearcher = pathSearcherSingleton;
    btg.navMeshPathSearcher = navMeshPathSearcher;
})();