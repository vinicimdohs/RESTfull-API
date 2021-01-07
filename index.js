//Primary file for the API


//Dependencies
var http = require('http');

//The server should responde to all request with a string
var server = http.createServer(function(req,res){
    res.end('hello World\n');
});
//Start the server,and have it listen on port 3000
server.listen(3000,function(){
    console.log("the server is listenig on port 3000")
});