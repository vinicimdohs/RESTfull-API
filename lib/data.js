//Library for storing and editing data

//dependencies
var fs = require('fs');
var path = require('path');
const helpers = require('./helpers');

//Container for the module 
var lib = {};

//Base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/')
//Write data to a file
lib.create = function(dir,file,data,callback){
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescription){
        if(!err && fileDescription){
        //Convert data to string
        var stringData = JSON.stringify(data);

        //write to file and close it
        fs.writeFile(fileDescription,stringData,function(err){
            if(!err){
                fs.close(fileDescription,function(err){
                    if(!err){
                        callback(false);
                    }else{
                        callback('Error closing new file');
                    }
                })
            }else{
                callback('Error writing to new file');
            }
        })
        }else{
            callback('Could not creat new file, it may already exist');
        }
    })
};
//Read data from a file
lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
       if(!err && data){
           var parsedData = helpers.parseJsonToObject(data);
           callback(false,parsedData);
       }else{
        callback(err,data);
       }
        
    })
}

//Update data inside a file
lib.update = function(dir,file,data,callback){
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescription){
        if(!err && fileDescription){
            //Convert data srting
            var stringData = JSON.stringify(data);
            //Truncate the file
            fs.ftruncate(fileDescription,function(err){
                if(!err){
                    //Write the file and close it
                    fs.writeFile(fileDescription,stringData,function(err){
                        if(!err){
                            fs.close(fileDescription,function(err){
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing file');
                                }
                            })
                        }else{
                            callback('Error writing to existing file');
                        }
                    })
                }else{
                    callback('Error truncating file')
                }
            })
        }else{
            callback('Could not open the file for updating,it may not exist')
        }
    })
};

//Delete a file
lib.delete = function(dir,file,callback){
    //Unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
       if(!err){
           callback(false);
       }else{
            callback('Error deleting file');
       }
    })
}


//export de module ES5
module.exports = lib;