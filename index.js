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

        //Choose the handler this request should go to
        var chosenHandler = typeof(router[trimedPath]) !== 'undefined' ? router[trimedPath] : handlers.notFound;
        
        //Construct the data object to end to the handler
        var data = {
            'trimedPath':trimedPath,
            'queryStringObject':queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer,
        };

        //Route the Request to the handler
        chosenHandler(data,function(statusCode,payload){
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            payload = typeof(payload) == 'object' ? payload : {};

            //convert the payload to a string
            var payloadString = JSON.stringify(payload);

            //return the response
            res.writeHead(statusCode);
                //Send the Response
                res.end(payloadString);

            //Log the request path
            console.log('Returning this response: ',statusCode,payloadString)
        });
    })
});

//Start the server,and have it listen on port 3000
server.listen(3000,function(){
    console.log("the server is listenig on port 3000")
});

//Define handlers
var handlers = {};

//sample handler
handlers.sample = function(data,callback){
//callback a http satus code, and a payload object
callback(406,{'name':'sample handler'});
};

//not found handler
handlers.notFound = function(data,callback){
callback(404);
};

//Define a request router
var router = {
    'sample' : handlers.sample
}