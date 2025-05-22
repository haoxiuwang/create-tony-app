
module.exports = {
  "middlewares":[["./log","c:/a.js"],["./cookies"],["./serve-static","public"]],
  "routes":{
    "/":[[["./jwt",{"secret":"abc"}]],[]],
    "/api":[[["./jwt",{"secret":"abc"}]],["auth"]],
    "/api/auth":[[["jwt"]]],
    "/api/users":[[["./jwt",{"secret":"abc"}]],["blogs"]],
    "/api2":[],
    "/api2/auth":[],
    "/api2/users":[[],["blogs"]],
    }
  }