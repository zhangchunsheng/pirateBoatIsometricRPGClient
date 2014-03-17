var express = require('express')
	,stylus = require('stylus')
	,nib = require('nib')
	,io = require('socket.io');

var app = express()
	,server = require('http').createServer(app)
	,io = io.listen(server);

/*var express = require('express');
var server = express.createServer();
var io = require('socket.io').listen(server);*/

var players = [];
var nextId = 0;
var player = {};
var x = 0;
var y = 0;
function random(lower, higher) {
	return Math.floor(Math.random() * (higher + 1 - lower)) + lower; 
	//return Math.floor(Math.random()*higher+1) + lower;
}
for(var i = 0 ; i < 100 ; i++) {
	nextId++;
	players[i] = {};
	players[i].id = nextId;
	players[i].x = random(600, 4000);
	players[i].y = random(100, 2000);
}

// Game server part

io.sockets.on('connection', function(socket) {
    var player;
	console.log("connect");

    socket.on('logon', function(pos) {
		console.log(pos);
        // Create the player
        player = { id: nextId++, x: pos.x, y: pos.y };

        // Send existing players to client
        socket.emit('players', players);

        // Send the new player to other clients
        socket.broadcast.emit('connected', player)

        // Add client to list of players
        players.push(player);
    });

    socket.on('move', function(data) {
        if (player) {
            player.x = data.x;
            player.y = data.y;

            // Broadcast position change to all other clients
            socket.broadcast.emit('moved', player)
        }
    });

    socket.on('disconnect', function() {
        players.splice(players.indexOf(player), 1);
		console.log(player);
        io.sockets.emit('disconnected', player);
    });
});


// HTTP server part
/*server.configure(function() {
    server.get('/version', function(req, res) {
        res.send('0.0.1');
    });
    server.use(express.logger());
    server.use(express.static(__dirname));
});

server.configure('development', function() {
    server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.configure('production', function() {
    server.use(express.errorHandler());
});*/

server.listen(8001);

console.log('server listening on port %s', server.address().port);