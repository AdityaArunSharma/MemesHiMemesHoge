module.exports.DB = function(){      

      return (process.env.ENVIRONMENT === 'production' ? process.env.MONGO_URL_PRODUCTION : process.env.MONGO_URL_LOCAL);
}

module.exports.Auth = function(){
      return (process.env.ENVIRONMENT === 'production' ? process.env.GOOGLE_CALLBACK_URL_PRODUCTION : process.env.GOOGLE_CALLBACK_URL_LOCAL);
}