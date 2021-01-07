//Primary file for the API


//Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
//The server should responde to all request with a string
var server = http.createServer(function(req,res){
    //Get the URL and parse it
    var parsedUrl = url.parse(req.url,true)//ATENÇÃO

    //Get the path
    var path = parsedUrl.pathname;
    var trimedPath = path.replace(/^\/+|\/+$/g,'');

    //Get the query string as an object
    var queryStringObject = parsedUrl.query;

    //Get the HTTP Method
    var method = req.method.toLowerCase();

    //Get the Headers as an object
    var headers = req.headers;

    //Get the payload,if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });

    req.on('end',function(){
        buffer += decoder.end();

        //Send the Response
        res.end('hello World\n');

        //Log the request path
        console.log('Request received on path: '+trimedPath+' with method: '+method+' and with these query string parameters: ',queryStringObject);
        console.log('Headers',headers);
        console.log('Request received with this payload:',buffer);
    })
});
//Start the server,and have it listen on port 3000
server.listen(3000,function(){
    console.log("the server is listenig on port 3000")
});