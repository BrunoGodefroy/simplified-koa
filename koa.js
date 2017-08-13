const http = require('http')
const co = require('co')

const Koa = () => ({
  middleware: [],
  getGeneratorsContext: (req, res) => ({ body: '', req, res }),
  use: function (gen) { this.middleware.push(gen) },
  listen: function (port) { http.createServer(this.callback(this)).listen(port) },
  callback: ctx => (req, res) => {
    let generatorsContext = ctx.getGeneratorsContext(req, res)
    co(ctx.compose(ctx.middleware, generatorsContext))
      .then(() => res.end(generatorsContext.body))
      .catch(error => console.error(error.stack))
  },
  compose: function (middleware, generatorsContext) {
    ctx = this
    const dispatch = i => {
      return function* () {
        if (i >= middleware.length) return
        const next = () => co(dispatch(i + 1))
        yield middleware[i].call(generatorsContext, next)
      }
    }
    return dispatch(0)
  },
})


const app = Koa()

// logger

app.use(function* (next) {
  const start = new Date
  console.log('recieving request: %s %s', this.req.method, this.req.url)
  yield next()
  const ms = new Date - start
  console.log('Request time: %d ms', ms)
})

// response

app.use(function* () {
  console.log('Setting up body...')
  this.body = 'Hello World'
})

app.listen(3000)
