//Create and export configuration variables

//Container for all the environments
var environments = {};

//Staging (default) environment
environments.staging = {
    'port': 3000,
    'envName' : 'staging'
};

//Production enviroment
environments.production = {
    'port' : 5000,
    'envName' : 'production',
};

//Determinate wich environment was passed as a comand-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';


//Check that the current environment is one of the env above,if not,default to stagin
var enviromentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//Export the module
//export default enviromentToExport //es6
module.exports = enviromentToExport;