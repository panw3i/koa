
# Koa 、Koa-router 常用 API



### 说明

Koa 是由 Express 原班人马打造的，通过组合不同的 generator 免除重复繁琐的回调函数嵌套，它的特点是简洁、自由度高，仅仅提供一个轻量优雅的函数库，所有功能都是通过中间件实现
参考


### 安装

node 版本必须大于 7.6.0 ,否则需要使用 babel 或者升级 node

```shell
    node --version # v8.9.0
    mkdir koa-demo
    cd koa-demo
    npm init
    sudo npm install --save koa # koa 版本 v2.4.1
```

### 基本使用
```js
    // /app.js
    const Koa = require('koa');
    const app = new Koa();
​
    app.use(async (ctx) => {
        ctx.body = 'hello';
    })
​
    app.listen(3387, function () {
        console.log('listen at http://localhost:' + 3387);
    });
    // 命令行执行 node app.js

```

### 中间件使用

中间件是一个函数（异步或者同步）处在 HTTP request（请求）与 HTTP response （响应）之间，用来实现某种中间功能 app.use() 来加载中间件。基本上，Koa 所有功能都是通过中间件来实现的，中间件函数会被传入两个参数：
1. `ctx`  `context` 对象，表示一次对话的上下文（requset和response）；
2. `next` 函数，调用 `next` 函数可以把执行权交给下一个中间件，下一个中间件执行完会把执行权再交回上一个中间件。如果中间件中有异步操作，需要使用 async、await 关键字，将其写成异步函数

```js
    const Koa = require('koa');
    const app = new Koa();
​
    // async 声明异步函数
    const fn1 = async (ctx, next) => {
        console.log('>>> fn1');
        /*
            await 关键字 等待 next() 异步执行完成后 再执行下边的语句
            不使用 await 并且下一个中间件是异步的，则 next() 函数的下一条语句会先于下一个中间件异步部分代码执行
        */ 
        await next();
        console.log('<<< fn1');
    }
​
    const fn2 = (ctx, next) => {
        console.log('>>> fn2');
        /*
            next() 的返回值是一个 promise 
            通过 then() 方法可以获得下一个中间件传递回的返回值，并且是异步的
        */ 
        const some = next(); 
        console.log('<<< fn2');
        console.log(some instanceof Promise); // true
        some.then(something => console.log(something));
    }
​
    const fn3 = (ctx) => {
        console.log('>>> fn3');
        console.log('<<< fn3');
        ctx.body = 'hello';
        return 'something';
    }
​
    app.use(fn1);
    app.use(fn2);
    app.use(fn3);

    app.listen(3387, function () {
        console.log('listen at http://localhost:' + 3387);
    });
```
### 路由

koa 路由需要使用中间件 koa-router

```shell
    npm install --save koa-router
```

#### 1. 一般用法

```js
    const Koa = require('koa');
    const Router = require('koa-router');
​
    const app = new Koa();
    const router = new Router();
​
    router.get('/admin', async (ctx, next) => {
        console.log('in admin');
        ctx.body += 'in admin\n';
        await next();
    })
​
    app.use(router.routes());
    app.use(router.allowedMethods());
​
    app.listen(3387, function () {
        console.log('listen at http://localhost:' + 3387);
    });
    
```


#### 2. router 的 HTTP 动词方法 get|put|post|patch|delete|del|all

`router.all()` 方法用来匹配所有 HTTP 动词

```js
    router
        .all('/*', (ctx, next) => {
            ctx.body = ctx._matchedRoute + ' all\n'; // ctx._matchedRoute 获得匹配的 url
            next();
        })
        .get('/admin', (ctx, next) => {
            ctx.body += ctx._matchedRoute + ' get admin\n';
            next();
        })
        .post('/admin', (ctx, next) => {
            ctx.body += ctx._matchedRoute + ' post admin\n';
            next();
        })
        .get('/admin/:user', (ctx, next) => {
            // 通过 ctx.params 获取 url 参数
            ctx.body += ctx._matchedRoute + '--' + ctx.params.user + ' get admin/user\n'; 
            next();
        })
 ```

#### 3. 多个中间件

```js

    router.get('/admin/:user/*', (ctx, next) => {
        ctx.body += ctx._matchedRoute + '--' + ctx.params.user + '\n';
        next();
    }, (ctx, next) => {
        ctx.body += ' get admin/user\n';
        next();
    })
```

#### 4. 嵌套路由
```js
    const app = new Koa();
    const router = new Router();
    const admin = new Router();
​
    admin.get('/:user/*', (ctx, next) => {
        ctx.body += ctx._matchedRoute + '--' + ctx.params.user + '\n';
        next();
    })
​
    router.use('/admin', admin.routes(), admin.allowedMethods()); // 路由嵌套
​
    app.use(router.routes());
    app.use(router.allowedMethods());
    
```
#### 5. 定义路由前缀
```js
    const admin = new Router({
        prefix: '/admin' // 定义路由前缀
    });
​
    admin.get('/:user/*', (ctx, next) => {
        ctx.body += ctx._matchedRoute + '--' + ctx.params.user + '\n';
        next();
    })
​
    app.use(admin.routes());
    app.use(admin.allowedMethods());
```

#### 6. 其他 API

##### 1. router.routes()

返回一个中间件，这个中间件根据请求分派路由

##### 2. router.allowedMethods([options])

根据不同类型（也就是 options 参数）的请求允许请求头包含的方法，返回不同的中间件，以及响应 405 [不被允许] 和 501 [未实现]
options => {throw: true} 抛出错误而不是设置返回状态码 statue 和标头 header
options => {notImplemented: () => returnedValue} 使用这个函数抛出的值代替原来的 notImplemented 501 未实现错误
options => {methodNotAllowed: () => returnedValue} 使用这个函数抛出的值代替原来的 notImplemented 405 不被允许错误

```js
    // 官网例子
    const Koa = require('koa');
    const Router = require('koa-router');
    const Boom = require('boom');
​
    const app = new Koa();
    const router = new Router();
​
    app.use(router.routes());
    app.use(router.allowedMethods({
      throw: true,
      notImplemented: () => new Boom.notImplemented(),
      methodNotAllowed: () => new Boom.methodNotAllowed()
    }));
```

##### 3. router.use([path], middleware)

在路由中使用中间件，中间件运行的顺序是 .use() 方法调用的顺序
path 允许调用中间件的路径，可以是一个路径字符串，也可以是路径组成的数组，不设置表示所有路径都可以使用
middleware 要使用的中间件

```js
    const admin = new Router({
        prefix: '/admin'
    });
​
    admin.use(['/default/:user', '/test'], (ctx, next) => {
        ctx.body = 'in admin\n';
        ctx.body += ctx._matchedRoute + '--' + ctx.params.user + '\n';
        next();
    })
​
    admin.get('/**', (ctx) => {
        ctx.body += 'finish\n';
    })
​
    app.use(admin.routes());
    app.use(admin.allowedMethods());
```

##### 4. router.prefix(prefix)

返回一个子路由，这个路由挂载在 router 上，并且设置了 prefix 前缀

```js
    const router = new Router();
    const admin = router.prefix('/admin');
​
    console.log(admin instanceof Router); // true
​
    admin.get('/:user', (ctx, next) => {
        ctx.body = 'admin user ' + ctx.params.user;
    })
​
    app.use(router.routes());
    app.use(router.allowedMethods());
```

##### 5. router.redirect(source, destination, code)

重定向资源 source 到目的地地址 destination 使用 30x 状态码（code 定义）

```js
    const admin = router.prefix('/admin');
​
    console.log(admin instanceof Router); // true
​
    admin.get('/:user/:id', (ctx, next) => {
        ctx.body = 'admin user ' + ctx.params.user + ' id ' + ctx.params.id;
        next();
    })
    admin.redirect('/default/:id', '/admin/test', 303); // 目的地地址要写全称，包含前缀
​
    admin.get('/test', (ctx) => {
        ctx.body = 'in /admin/test';
    })
```

##### 6. router.param(param, middleware)

给路由参数 param 添加中间件，后续 router 路径中 含有 这个参数的，都会首先触发这个中间件，一般用于自动验证等

```js
    admin
        .param('user', (id, ctx, next) => {
            ctx.state.user = users[id] || null;
            if (!ctx.state.user) {
                return ctx.status = 404;
            }
            return next();
        })
        .get('/abc/:user', (ctx, next) => {
            ctx.body = '/admin/abc ' + JSON.stringify(ctx.state.user)
            next();
        })
        .get('/bcd/:user', (ctx, next) => {
            ctx.body = '/admin/bcd ' + JSON.stringify(ctx.state.user);
            next();
        })
        .get('/cde/test', (ctx, next) => {
            // 没有 user 参数 所以 不经过 param('user') ctx.state.user 不存在
            ctx.body = '/admin/cde ' + JSON.stringify(ctx.state.user); 
            next();
        })
        
        
```
### Koa API

1. Application 应用

通过 new Koa() 创建

##### 1. app 对象的属性（设置）

app.env 默认是 NODE_ENV 的值或者 “development”
app.proxy 布尔值，当真正的代理头字段被信任时，设置为 true 时支持 X-Forwarded-Host 可以使用代理中的地址信息
app.subdomainOffset 用于设置子域名的偏移值，默认为 2 ,再调用 req.subdomains 返回子域名时 例如 tobi.ferrets.example.com 这样的域名会返回 ["ferrets", "tobi"] 如果设置偏移值为 3 则返回 ["tobi"]

```js
    const Koa = require('koa');
    const app = new Koa();
​
    console.log(app.env); // development
    console.log(app.proxy); // false
    app.subdomainOffset = 3;
```
##### 2. app.listen()

listen() 方法只是在内部通过 http.createServer() 创建并返回一个 服务器，给定的参数都会传递给创建的 server.listen(...args) 开启 HTTP 服务

```js
    // 伪代码
    const Koa = require('koa');
    const http = require('http');
    const https = require('https');
    const app = new Koa();
​
    app.listen(3387, function () {
        console.log('listen at http://localhost:' + 3387);
    });
​
    http.createServer(app.callback()).listen(3387);
    https.createServer(options, app.callback).listen(3388);
```

##### 4. app.callback()

返回适用于 http.createServer() 方法的回调函数来处理请求也可以使用此回调函数将 Koa 挂载到 Connect/Express 应用程序中

```js
    const Koa = require('koa');
    const express = require('express');
​
    const app = express(); // 主程序
    const admin = new Koa(); // 子程序
​
    // 子程序 koa 的中间件
    const fn1 = (ctx, next) => {
        ctx.body = 'in admin';
        next();
    }
​
    admin.use(fn1); // 挂载子程序中间件
​
    // 调用 koa 的 callback 方法并将其挂载到主程序 express 上
    app.use('/admin', admin.callback()); 
​
    app.use('/', function (req, res) {
        res.send('noraml');
    })
​
    app.listen(3387, function () {
        console.log('listen at http://localhost:' + 3387);
    });
```
##### 5. app.use()

用来加载中间件，Koa 所有的功能都是通过中间件实现的，每个中间件默认接受两个参数，第一个参数是 Context 对象，第二个参数是next函数，只要调用next函数，就可以把执行权转交给下一个中间件。
##### 6. app.keys

设置签名的 Cookie 秘钥

```js
    // app.keys 设置签名的 Cookie 秘钥
    app.keys = ['im a newer secret', 'i like turtle'];
​
    app.use((ctx, next) => {
        // 设置 { signed: true } 使用签名秘钥
        ctx.cookies.set('name', 'tobi', { signed: true });
        ctx.body = 'in app';
        next();
    });
```

##### 7. app.context

应用创建的 ctx 的原型，可以在其上添加其他属性，这样整个应用的 ctx 都可以使用这些属性

```js
    app.context.testProp = 'test'; // 添加属性
​
    app.use((ctx, next) => {
        ctx.body = 'in app';
        console.log(ctx.testProp); // test ctx 中获取属性值
        console.log(ctx.__proto__ === app.context); // true 
        next();
    });
```

##### 8. error 事件

运行过程中一旦出错，Koa 会触发一个 error 事件，监听这个事件，可以处理错误，但是中间件中如果错误被 try...catch 捕获，则不会触发 error 事件，这个时候可以调用 ctx.app.emit() 手动释放 error 事件

```js
    app.on('error', function (err) {
        console.log('error Event', err);
    })
​
    app.use(async (ctx, next) => {
        ctx.body = 'in app';
        try {
            await next();    
        } catch (error) {
            ctx.status = 404;
            ctx.app.emit('error', error, ctx);
        }
​
    });
​
    app.use((ctx) => {
        ctx.body = 'error';
        ctx.throw('error here');
    })
```

#### 2. Context 上下文

Koa Context 将 node 的 request 和 response 对象封装到单个对象中，为编写程序提供了许多有用的方法，这些操作在 HTTP 服务器开发中频繁使用，没给请求都将创建一个 Context，并在中间件中作为接收器引用，或者 ctx 参数
1. context 的 属性与方法

ctx.req Node 的 request 对象
ctx.res Node 的 response 对象 绕过 Koa 的 response 处理是不被支持的
ctx.request Koa 的 Request 对象
ctx.response koa 的 Response 对象
ctx.app 应用程序实例引用
ctx.state 用于存储一些数据，一些中间件会默认将这里的属性作为 模板渲染的上下文
ctx.cookies.get(name, [options]) 获取名为 name 的 cookie ; options 是参数
ctx.cookies.set(name, value, [options]) 设置 名为 name 的 cookie 值为 value； options 中的参数，包括签名等
ctx.throw([status], [msg], [properties]) 用来抛出错误 status 抛出错误的状态码，msg 描述信息, properties 可以设置 error 的其他属性
ctx.respond 设置为 false 可以绕过 Koa 内置的 response 处理，写入原始的 res 对象而不是让 Koa 处理 response

```js
    // 伪代码，选择执行
    const Koa = require('koa');
    const path = require('path');
    const views = require('koa-views');
​
    const app = new Koa();
​
    // app.keys 设置签名的 Cookie 秘钥
    app.keys = ['im a newer secret', 'i like turtle'];
​
    app.on('error', function (err, ctx) {
        console.log('error Event', err.message, err.user);
    })
​
    // 使用 koa-views 设置 jade 模板，会给 ctx 加上 render 方法
    app.use(views(path.join(__dirname, '/views'), {
        map: {jade: 'jade'}
    }));
​
    app.use(async (ctx, next) => {
        ctx.body = 'in app';
        console.log(ctx.res.__proto__.constructor); // [Function: ServerResponse]
        console.log(ctx.req.__proto__.constructor); // [Function: IncomingMessage]
        console.log(ctx.request); 
        console.log(ctx.response); 
        console.log(ctx.app === app); // true
        ctx.respond = true;
​
        // 设置 cookie 
        ctx.cookies.set('test', 'test cookie value');
        ctx.cookies.get('test'); // test cookie value
​
        // ctx.state 设置模板中渲染的数据
        ctx.state.user = 'some user name';
        await next();
        await ctx.render('index.jade');
​
    });
​
    app.use(async ctx => {
        // 抛出错误
        ctx.throw(401, 'something wrong', {user: 'this is user'});
    })
​
    app.listen(3387, function () {
        console.log('listen at http://localhost:' + 3387);
    });
```
#### 3. Request 请求

通过 ctx.request 获得
1. request 对象的属性与方法

斜体的属性与方法没有 ctx 对象的别名
`request.header` 获取、设置请求标头
`request.headers` 获取、设置请求标头 与 request.header 一样（===）
`request.method` 获取、设置请求方法
`request.length` 以数字返回请求的 Content-Length，或 undefined
`request.url` 获取、设置请求 url
`request.originalUrl` 获取请求原始URL
`request.origin` 获取URL的来源，包括 protocol 和 host
`request.href` 获取完整的请求URL，包括 protocol，host 和 url
`request.path` 获取、设置请求路径名
`request.querystring` 获取、设置原始查询字符串(字符串格式)
`request.query` 获取、设置解析的查询字符串, 当没有查询字符串时，返回一个空对象
`request.search` 获取、设置原始查询字符串(带)
`request.host` 获取当前主机（hostname:port）
`request.hostname` 存在时获取主机名
`request.protocol` 返回请求协议，“https” 或 “http”
`request.secure` 检查请求是否通过 TLS 发出
`request.ip` 请求远程地址
`request.subdomains` 将子域返回为数组
`request.URL` 获取 WHATWG 解析的 URL 对象
`request.type` 获取请求 Content-Type 不含参数 “charset”
`request.charse`t 在存在时获取请求字符集，或者 undefined
`request.fresh` 检查请求缓存是否“新鲜”，也就是内容没有改变
`request.stale` 检查请求缓存是否是陈旧的

`request.is(types...)` 检查传入请求是否包含 Content-Type 头字段， 并且包含任意的 mime type。 如果没有请求主体，返回 null。 如果没有内容类型，或者匹配失败，则返回 false。 反之则返回匹配的 content-type。

`request.accepts(types)` 检查给定的 type(s) 是否可以接受，如果 true，返回最佳匹配，否则为 false。 type 值可能是一个或多个 mime 类型的字符串，如 application/json，扩展名称如 json，或数组
`request.acceptsEncodings(encodings)` 检查 encodings 是否可以接受，返回最佳匹配为 true，否则为 false
`request.acceptsCharsets(charsets)` 检查 charsets 是否可以接受
`request.acceptsLanguages(langs)` 检查 langs 是否可以接受
`request.get(field)` 返回指定请求标头

```js
    app.use(async (ctx, next) => {
        const {request, response} = ctx; 
        console.log(ctx.header === request.header); // true
        console.log(request.headers === request.header); // true
        console.log(request.method === ctx.method);// true
        console.log('url', request.url);
        console.log('originalUrl', request.originalUrl);
        console.log('origin', request.origin);
        console.log('href', request.href);
        console.log('path', request.path);
        console.log('querystring', request.querystring);
        console.log('query', request.query);
        console.log('search', request.search);
        console.log('host', request.host);
        console.log('hostname', request.hostname);
        console.log('protocol', request.protocol);
        console.log('secure', request.secure);
        console.log('ip', request.ip);
        console.log('subdomains', request.subdomains);
        console.log('URL', request.URL);
        console.log('type', request.type);
        console.log('charset', request.charset);
        console.log('fresh', request.fresh);
        console.log('stale', request.stale);
​
        console.log('is json', ctx.is('json'));
        switch (request.accepts('json', 'html', 'text')) {
            case 'json': break;
            case 'html': break;
            case 'text': break;
            default: ctx.throw(406, 'json, html, or text only');
        }
        console.log('acceptsEncodings', request.acceptsEncodings('gzip'));
        console.log('acceptsCharsets', request.acceptsCharsets('utf-8'));
        console.log('acceptsLanguages', request.acceptsLanguages('en'));
        console.log('Content-Type', request.get('Content-Type'));
​
        ctx.body = 'in app';
    });
```
#### 4. Response 响应

通过 ctx.response 获得

1. response 对象的属性与方法

斜体的属性与方法没有 ctx 对象的别名

`response.header` 返回响应头对象

`response.headers` 返回响应头对象 response.header 的别名

`response.status` 获取、设置响应状态 默认为 404 ，根据响应状态码会有对应的响应信息

`response.message` 获取、设置响应状态的消息，默认是根据 response.status 对应的

`response.length` 获取、设置响应的 Content-Length，默认为从 ctx.body 中推导出来 或者 undefined

`response.body` 获取、设置相应的主体，使用 .body 设置后，Koa 会自动将状态设置为 200 或者 204 ，除非 使用 response.status 设置了响应状态；body 设置的值可以是 String\Buffer\Stream\Object

`response.get(field)` 获取指定响应头

`response.set(field, value)` 设置响应头 field 值为 value

`response.set(fields`) 用一个对象设置多个响应标头 fields 是一个 header 的对象

`response.append(field, value)` 给 field 标头添加 value 值

`response.remove(field)` 删除名为 field 的标头

`reponse.type` 获取、设置 响应 Content-Type 的值

`response.is(types...)` 检查指定的类型是否是所提供的类型之一

`response.redirect(url, [alt])` 执行 [302] 重定向到 url

`response.headerSent` 返回是否已经发送了一个响应头

`response.lastModified` 获取、设置最后修改日期


```js
    const Koa = require('koa');
    const fs = require('fs');
​
    const app = new Koa();
​
    app.use(async (ctx, next) => {
        const {request, response} = ctx; 
        const chunk = await next();
​
        ctx.body = chunk; 
        console.log('header', response.header);
        console.log('status', response.status);
        console.log('message', response.message);
        console.log('length', response.length);
        console.log('body', ctx.body === response.body); // true
        response.set('content-type', 'text/json');
        response.append('content-type', 'charset=utf-8');
        console.log('content-type', response.get('content-type'));
        response.remove('content-type');
        console.log('content-type', response.get('content-type'));
        response.type = 'json';
        console.log('content-type', response.get('content-type'));
        response.lastModified = new Date();
        if (!response.headerSent) {
            // response.redirect('/user'); 
        }
    });
​
    app.use((ctx) => {
        return new Promise(function (resolve) {
            let data = '';
            const readStream = fs.createReadStream('./package.json');
            readStream.on('data', function (chunk) {
                data += chunk;
            })
            readStream.on('end', function () {
                resolve(data);
            })
        })
    }) 
​
    app.listen(3387, function () {
        console.log('listen at http://localhost:' + 3387);
    });
```

