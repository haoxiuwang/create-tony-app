
module.exports = {
  "middlewares":[["./log","c:/a.js"],["./cookies"],["./serveStatic","public"]],
  "routes":{
    "/":[],
    "/api":[],//[[["jwt",{"secret":"abc"}]],["auth"]]
    "/api/auth":[],
    "/api/users":[[],["blogs"]],
    "/api2":[],
    "/api2/auth":[],
    "/api2/users":[[],["blogs"]],
    }
  }