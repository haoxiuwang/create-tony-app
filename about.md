我想为我的nodejs web框架Tony,建立一个create-tony-app.js，用于按照路由配置自动初始化工程。

下面是配置文件示例：
{
  "middlewares": [
    ["log"], 
    ["cookies"], 
    ["./serveStatic","public"],
    ["./serveStatic","library"],
    ["./session"]
  ],
  "routes": {
    "/": [],//默认提供home.service.js
    "/api": [[],["auth"]],
    "/api/auth": [],
    "/api/users": [["jwt"],["blogs"]]
  }
}
以上配置中，middlewares的每个成员代表工程级别的中间件，每个成员是数组，表示中间件模块名称及其options(optiions可以省略)。Tony框架所有中间件模块代码如下：

function log(options){

    return (req,res)=>{}
}


每个中间件既可以是npm库中的模块，模块名不需要指定路径“log”，也可以是本地middlewares文件夹中的自定义中间件，模块名前加上路径"./"前缀，如“./log”（不需要写成"./middlewares/log"，尽管所有本地中间件均在middlewares文件夹中）。

routers的每一个成员，代表一个路由与其所依赖中间件和服务的对应关系。值为数组，包含两个子数组，第一个是中间件列表，第二个是服务列表:

每一个路由
"/api/users": [[中间件列表],["服务列表"]]

每一个路由都有一个默认服务，默认服务不需要出现在列表中，默认服务的名字通过path的最后一个params来决定，如auth.service.js,users.services.js,home.service.js,不需要列出。path"/"的默认服务为home.service.js.

如果一个路由没有中间件，而且除了一个默认服务外，没有其他服务, 其值可以简写为一个空数组，如"/api/auth": [],而不需写成："/api/auth": [[],[]],

创建工程过程如下：

1. 首先要按照该配置文件生成app.js，其代码应该如下：

import http from "http";
import { enhanceRequest, enhanceResponse } from "./tony/helpers.js";
import { handleError } from "./tony/error.js";
import log from "log";
const _log = log()
import cookies from "cookies";
const _cookies = cookies()
import serveStatic from "./middlewares/serveStatic";
const _serveStatic = serveStatic("public")
const _serveStatic1 = serveStatic("library")


import main from "./routers"
import api from "./routers/api"
import error from "./routers/error"

http.createServer(async (req, res) => {
    try {
        enhanceRequest(req);
        enhanceResponse(res);

        //middlewares
        await _log(req, res);
        await _cookie(req, res);
        await _serveStatic(req, res)!;
        await _serveStatic1(req, res)!;
        await _session(req, res)!;
        //routers
        await main(req,res)!;
        await api(req,res)!;
        await error(req,res)
    } catch (err) {
        handleError(err, res);
    }
}).listen(3000, () => {
    console.log("Tony server running at http://localhost:3000");
});

Tony 语法糖, `expression!`:

    expression!是下面语句的简写：
    if(!expression)return

    而expression!true则代表：
    if(!expression)return true

    如上面代码中，await _session(req, res)!

    Tony工程使用esbuild进行编译，tony/esbuild.plugin.js负责处理语法糖，其核心语句为：

    source.replace(/^(.+)\s*!(true)?\s*;?\s*$/mg, (_, a, b) => 
        `if (!${a.trim()}) return ${b ? b : "false"}`
      );

    Tony语法糖，主要用来简介化表示，流程是否需要继续。

2. 工程目录：

    app.js
    public
    library
    tony
        error.js
        helper.js
        esbuild.plugin.js
    middlewares
        serveStatic.js
        session.js
    routers
        index.js
        home.service.js
        error.js
        api
            index.js
            service.js
            auth
                index.js
                auth.service.js
            users
                index.js
                users.service.js
                blogs.service.js
                

3. api/index.js:
    import {dosomething} from "./service"
    import users from "./users"
    import auth from "./auth"
    import _auth from "../../middlewares/auth"
    const __auth = _auth()
    import error from "../../routers/error"
    export default async (req,res)=>{    
        req.url.startsWith("/api")!true  
        await __auth(req,res)!           
        await auth(req,res)!   
        await users(req,res)!
        //这里由程序员根据需要完成调用service函数，如dosomething并响应请求，如正常完成则返回false,否则有后面的error处理。
        error(req,res)    
    }
4. api/auth.js:
    import {login,logout} from "./auth.service.js";
    import error from "../../../routers/error/index.js";
    export default async (req, res) => {
        req.path.startsWith("/api/auth")!
        //这里由程序员调用service相关函数，以最终完成请求处理，return false, 或调用子路由。
        await error(req, res);
    };

5. api/users

    import {getUsers,getUser...} from "./auth.service.js";
    import error from "../../../routers/error/index.js";
    export default async (req, res) => {
        req.path.startsWith("/api/users")!
        //这里由程序员调用service相关函数，以最终完成请求处理，return false, 或调用子路由。
        await error(req, res);
    };

6. api/users:

    import {getUsers,getUser} from "./auth.service.js";
    import {getBlogs} from "./blogs.service.js"
    import error from "../../../routers/error/index.js";
    export default async (req, res) => {
        req.path.startsWith("/api/users")!
        //这里由程序员调用service相关函数，以最终完成请求处理，return false, 或调用子路由。
        await error(req, res);
    };


7. routers/index
    import {dosomething} from "./service"
    export default async (req,res)=>{   
        req.path=="/"!
        //这里由程序员根据需要完成调用service函数，如dosomething并响应请求
    }
8. 服务的模板：

async function todo(req, res) {
  // TODO: implement service logic for \api\users
}
export { todo };

9. 第二层路由，以"/api"为例，其处理程序代码应该包含调用子路由，如users和auth，请参照我所提供的api/index.js代码。

10. 每一次路由处理代码都应该以error函数结尾。
