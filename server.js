var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function getUsersInRoom(room)
{
	var rooms = io.sockets.adapter.rooms;
    var requested_room = room;
   // console.log(rooms);    	
    var users = []
    
    if (rooms[requested_room] != null)
    	{
    		console.log("getUsersInRoom sees this room --> " + Object.keys(rooms[requested_room]['sockets']));
    		for (client_id in rooms[requested_room]['sockets'])
    		{
    			
    				console.log("Client: " + client_id);
    				//console.log(io.sockets.connected[client_id]);
    				var user = io.sockets.connected[client_id].name;
    				users.push(user);
    				console.log("getUsersInRoom Says --> User Name in room: " + user);    			
    			
    		}

    	}
    console.log('full user list --> ' + users);
    return users;
}

function sendRoomUsers(room)
{
	var users = getUsersInRoom(room);
	io.in(room).emit('room_users', users);

    	// for (var index in users)
    	// {
    	// 	console.log("User Name in room: " + users[index]);
    	// 	io.in(room).emit('room_users', users[index]);
    	// }
}

function getConnectionCount()
{
	return io.sockets.server.engine.clientsCount;
}

// An attempt to get a room count - Start here

function getRoomUserCount(room)
{

	console.log('sockets in room: ' + room);
	if (io.nsps['/'].adapter.rooms[room] != null)
	{
		console.log(Object.keys(io.nsps['/'].adapter.rooms[room].sockets));
		console.log('length in room: ' + room);
		console.log(Object.keys(io.nsps['/'].adapter.rooms[room].sockets).length);

		return Object.keys(io.nsps['/'].adapter.rooms[room].sockets).length;
	}
	else
		return 0;


	//console.log(count + ': In room ' + room);	

	
}

// handle incoming connections from clients
io.on('connection', function(socket) {
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    console.log('Client Connected');


    socket.on('room', function(room) {
    	console.log(room['person'] + ' Welecome to the room: ' + room['room']);
    	console.log('socketid: ' + socket.id);

    	console.log('cleint connected: ' + getConnectionCount());
    	//console.log('clientID: ' + Object.keys(io.engine.clients) )    	
        
    	if (room['person'] != null)
    	{

        	socket.join(room['room']);        
        	socket.name = room['person'];
        
        	io.in(room).emit('message', 'Welcome to the room: ' + room);
        	getRoomUserCount(room['room']);
        	sendRoomUsers(room['room']);
    	}   
                
        
    });

    socket.on('leaveRoom', function(room) {    	
    	
    	console.log(socket.name + ' Is leaving room: ' + room);
    	socket.leave(room);
    	getRoomUserCount(room);
    	

    });

    socket.on('message', function(client) {
    	console.log("hello: " + JSON.stringify(client));
    	console.log("client came from room: " + client['room']);
    	io.in(client['room']).emit('message', client['person'] + ': ' + client['message']);
    	console.log('Connected clients: ' + getConnectionCount());    	
    });

    socket.on('room_in_list', function(room) {    	
    	
    	sendRoomUsers(room);
    	

    });
    

    socket.on('disconnect', function() {

      console.log(socket.id + ' Got disconnect! ' + socket.name);      
      console.log('Client Connected: ' + getConnectionCount());  
      io.emit('user_disconnect', '');
      
	});
});

