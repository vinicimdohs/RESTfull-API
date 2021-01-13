//Primary file for the API

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');//ES6
var fs = require('fs');
var _data = require('./lib/data');

//testing
_data.delete('test','newfile',function(err){
    console.log('this was the error',err)
})

//Instantiate the http server
var httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
});

//Start the http server
httpServer.listen(config.httpPort,function(){
    console.log("the server is listenig on port:"+config.httpPort+" in mode :"+config.envName);
});

//Instantiate the https server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res);
});

//Start the https server
httpsServer.listen(config.httspPort,function(){
    console.log("the server is listenig on port:"+config.httpsPort+" in mode :"+config.envName);
});

//All the server logic for both the http and https server
var unifiedServer = function(req,res){
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
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
                //Send the Response
                res.end(payloadString);

            //Log the request path
            console.log('Returning this response: ',statusCode,payloadString)
        });
    })
};

//Define handlers
var handlers = {};

//sample handler
handlers.sample = function(data,callback){
//callback a http satus code, and a payload object
callback(406,{'name':'sample handler'});
};

//ping handlers
handlers.ping = function(data,callback){
    callback(200);
}

//not found handler
handlers.notFound = function(data,callback){
callback(404);
};

//Define a request router
var router = {
    'sample' : handlers.sample,
    'ping' : handlers.ping,
}