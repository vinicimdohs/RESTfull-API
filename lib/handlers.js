var _data = require('./data');
var helpers = require('./helpers');

//Define handlers
var handlers = {};

//Users handler
handlers.users = function(data,callback){
        var acceptableMethods = ['post','get','put','delete'];

        if(acceptableMethods.indexOf(data.method) > -1){
            handlers._users[data.method](data,callback);
        }else{
            callback(405);
        }
};

//Container for the users submethods
handlers._users = {};

//Users - post
handlers._users.post = function(data,callback){
    //Check that all required fields are fillet out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;


    if(firstName && lastName && phone && password && tosAgreement){
        //Make sure that the user doesnt already exist
        _data.read('users',phone,function(err,data){
            if(err){
                //Hash the password
                var hashedPassword = helpers.hash(password);
                //Create the user object
                if(hashedPassword){
                    var userObject = {
                        'firstName':firstName,
                        'lastName':lastName,
                        'phone': phone,
                        'hashedPassword':hashedPassword,
                        'tosAgreement': true
                    }
    
                    //Store the user
                    _data.create('users',phone,userObject,function(err){
                        if(!err){
                            callback(200);
                        }else{
                            console.log(err);
                            callback(500,{'Error':'Could not creat the new user'});
    
                        }
                    });
                }else{
                    callback(500,{'Error':'Could not hash the user password'});
                }
                
            }else{
                //User already exists
                callback(400,{'Error':'A user with that phone number already exists'});
            }

        })
    }else{
        callback(400,{'Error':'Missing required fields'})
    }
};

//Users - get
//Required data: phone
//Optional data:none
//@TODO Only let an authenticated user acces their object.Don't let them acces anyone
handlers._users.get = function(data,callback){
    //Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        //Get the token from the headers
        var token = typeof(data.headers.token) =='string' ? data.headers.token : false.token;
        //Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                //Lookuo the user
            _data.read('users',phone,function(err,data){
            if(!err && data){
                //Remove the hashed password from user object before returning
                delete data.hashedPassword;
                callback(200,data);
            }else{
                callback(404);
            }
        });
            }else{
                callback(403,{'Error':'Missing required token in header, or token is invalid'})
            }
        })
    }else{
        callback(400,{'Error':'Missing required field'});
    }
};
//Users - put
//Required data : phone
//Optional data: firstName,lastname,pass (at least one must be specified)
//@TODO Only let an authenticated user update their own object.Don't let them update
handlers._users.put = function(data,callback){
    //Check for the required field
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    //Check for the optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    //Error if the phone is invalid
    if(phone){
        //Error if nothing is sent to update
        if(firstName || lastName || password){

        //Get the token from the headers
        var token = typeof(data.headers.token) =='string' ? data.headers.token : false.token;
        //Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                _data.read('users',phone,function(err,userData){
                    if(!err && userData){
                        //Update the fields necessary
                        if(firstName){
                            userData.firstName = firstName;
                        }
                        if(lastName){
                            userData.lastName = lastName;
                        }
                        if(password){
                            userData.hashedPassword = helpers.hash(password);
                        }
                        //Store the new updates
                        _data.update('users',phone,userData,function(err){
                            if(!err){
                                callback(200);
                            } else{
                                console.log(err);
                                callback(500,{'Error' : 'Could not update the user'})
                            }
                        })
                    }else{
                        callback(400,{'Error':'The specified user does not exist'})
                    }
                })
            }else{
                callback(403,{'Error':'Missing required token in header, or token is invalid'})

            }});
        }else{
            callback(400,{'Error':'Missing fiels to update'});
        }
    }else{
        callback(400,{'Error':'Missing required field'});
    }
};
//Users - delete
//Required field : phone

handlers._users.delete = function(data,callback){
    //Check that the phonr is valid
     //Check that the phone number is valid
     var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    
     if(phone){
         //Get the token from the headers
        var token = typeof(data.headers.token) =='string' ? data.headers.token : false.token;
        //Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                _data.read('users',phone,function(err,data){
                    if(!err && data){
                       _data.delete('users',phone,function(err){
                           if(!err){
                               callback(200);
                           }else{
                               callback(500,{'Error':'Could not delete the specified user'})
                           }
                       })
                    }else{
                        callback(404,{'ERROR':'Could not find the specified user'});
                    }
                });
            }else{
                callback(403,{'Error':'Missing required token in header, or token is invalid'})

            }});
         //Lookuo the user
         
     }else{
         callback(400,{'Error':'Missing required field'});
     }
};

//sample handler
handlers.sample = function(data,callback){
//callback a http satus code, and a payload object
callback(406,{'name':'sample handler'});
};


//Token handler
handlers.tokens = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];

    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    }else{
        callback(405);
    }
};

//Container for all the token methods
handlers._tokens = {};

//Tokens - post
//Required data phone,password
//Optional data:none
handlers._tokens.post = function(data,callback){
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password){
        //Lookup the user who matches that phone number
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
                //Hash the sent password and compare 
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    console.log('depois do hashed pass :',hashedPassword);
                    //If valid, create a new token with a random name
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;

                    var tokenObject = {
                        'phone': phone,
                        'id':tokenId,
                        'expires':expires
                    }

                    //Store the token
                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){
                            callback(200,tokenObject);
                        }else{
                            callback(500,{'Error':'Could not create the new token'});
                        }
                    })
                }else{
                    console.log('ERRO no pass');
                    callback(400,{'Error':'Password did not match the specified user'});
                }
            }else{
                callback(400,{'Error':'Could not find the specified user'});
            }
        });
    }else{
        callback(400,{'Error':'Missing required fields'});
    }
};

//Tokens - get
//Required data: id
handlers._tokens.get = function(data,callback){
//Check if the id is valid
var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    
if(id){
    //Lookuo the token
    _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
            callback(200,tokenData);
        }else{
            callback(404);
        }
    });
}else{
    callback(400,{'Error':'Missing required field'});
}
};

//Tokens - put
//Required data : id,extend
handlers._tokens.put = function(data,callback){
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true: false;
    if(id && extend){
        //Lookup the token
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                //Check to make sure the token isnt already expired
                if(tokenData.expires > Date.now()){
                    //Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    //Store the new updates
                    _data.update('tokens',id,tokenData,function(err){
                        if(!err){
                            callback(200);
                        }else{
                            callback(400,{'Error':'Could not update the token expiration'});
                        }
                    })
                }else{
                    callback(400,{'Error':'The token has already expired,and cannot be extend'})
                }
            }else{
                callback(400,{'Error':'Specified token does not exists'});
            }
        })
    }else{
        callback(400,{'Error':'Missinf required fields or they are invalid'})
    }

};

//Tokens - delete
//Required data:id
handlers._tokens.delete = function(data,callback){
     //Check that the phone id is valid
     var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    
     if(id){
         //Lookuo the token
         _data.read('tokens',id,function(err,data){
             if(!err && data){
                _data.delete('tokens',id,function(err){
                    if(!err){
                        callback(200);
                    }else{
                        callback(500,{'Error':'Could not delete the specified token'})
                    }
                })
             }else{
                 callback(404,{'ERROR':'Could not find the specified token'});
             }
         });
     }else{
         callback(400,{'Error':'Missing required field'});
     }
};


//Verify if a given tokenId is currently valid for a given user
handlers._tokens.verifyToken = function(id,phone,callback){
    //Lookup the token
    _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
            //check that the token is for the given user and has not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now() ){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false)
        }
    })
};


//ping handlers
handlers.ping = function(data,callback){
    callback(200);
}

//not found handler
handlers.notFound = function(data,callback){
callback(404);
};

module.exports = handlers;