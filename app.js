var express=require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


server.listen(  process.env.PORT || 3000);

app.get('/',function(req,res){
	res.sendFile( __dirname + "/index.html" );
});
 


var allUsers=[];
var rooms=[];

io.sockets.on(  'connection',function( socket ){

	//send message
	socket.on('send message',function(data){
		if ( data.receivername == undefined || data.receivername == "" ){
			io.sockets.emit( 'new message',{
				sendername:socket.myname,
				msg:data.msg
			});	
		}else{
			socket.to( rooms[ data.receivername ] ).emit( 'new message',{
				sendername:socket.myname,
				msg:data.msg
			});
			socket.emit( 'new message',{
				sendername:socket.myname,
				msg:data.msg
			});
		}
	});
	
	//new user comes
	socket.on('new user',function(data){
		io.sockets.emit('new user',{username:data});
		
		socket.myname = data;
		rooms[data] = socket.id;
		
		allUsers.push(data);
		socket.emit( 'fetched users' , allUsers );
		
	});
	
	
	socket.onclose = function(reason){
    	delete rooms[this.myname];
		var foundIndex = allUsers.indexOf(this.myname);
		if ( foundIndex >=0 )
    		allUsers.splice(  foundIndex , 1 );
		io.emit( 'fetched users' , allUsers );
		Object.getPrototypeOf(this).onclose.call(this,reason);
	};
	
} );