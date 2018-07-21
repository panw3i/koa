const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const controller = require('./middleware');
const app = new Koa();

const db = {
    tobi: { name: 'tobi', species: 'ferret' },
    loki: { name: 'loki', species: 'ferret' },
    jane: { name: 'jane', species: 'ferret' }
};

let home = new Router()


// const pets = {
//     list: (ctx) => {
//         const names = Object.keys(db);
//         ctx.body = 'pets: ' + names.join(', ');
//     },
//
//     show: (ctx, name) => {
//         const pet = db[name];
//         if (!pet) return ctx.throw('cannot find that pet', 404);
//         ctx.body = pet.name + ' is a ' + pet.species;
//     }
// };


app.use(serve(__dirname + '/static'));
//
// app.use(_.get('/pets', pets.list));
// app.use(_.get('/pets/:name', pets.show));


home.get('/', async ( ctx )=>{
    ctx.body = `
    <ul>
      <li><a href="/static/1.html">/static/1.html</a></li>
      <li><a href="/static/2.html">/static/2.html/a></li>
    </ul>
  `
})

// 装载所有子路由
home.use('/home', home.routes(), home.allowedMethods())


let router = new Router()
app.use(router.routes()).use(router.allowedMethods())


router.use('/', home.routes(), home.allowedMethods())

app.listen(3000);
console.log('listening on port 3000');