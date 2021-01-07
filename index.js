//Primary file for the API


//Dependencies
var http = require('http');
var url = require('url');
//The server should responde to all request with a string
var server = http.createServer(function(req,res){
    //Get the URL and parse it
    var parsedUrl = url.parse(req.url,true)//ATENÇÃO

    //Get the path
    var path = parsedUrl.pathname;
    var trimedPath = path.replace(/^\/+|\/+$/g,'');
    //Send the Response
    res.end('hello World\n');

    //Log the request path
    console.log('Request received on path:'+trimedPath);

    
});
//Start the server,and have it listen on port 3000
server.listen(3000,function(){
    console.log("the server is listenig on port 3000")
});