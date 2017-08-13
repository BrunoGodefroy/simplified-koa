const http = require('http')
const co = require('co')

const app = {
  middleware: [],
  getGeneratorsContext: (req, res) => { body: '', req, res },
  use: function (gen) { this.middleware.push(gen) },
  listen: function (port) { http.createServer(this.callback(this)).listen(port) },
  callback: ctx => (req, res) => {
    ctx.genCtx.req = req
    ctx.genCtx.res = res
    co(ctx.compose(ctx.middleware))
      .then(() => res.end(ctx.genCtx.body))
      .catch(error => console.error(error.stack))
  },
  compose: function (middleware) {
    ctx = this
    const dispatch = i => {
      return function* () {
        if (i >= middleware.length) return
        const next = () => co(dispatch(i + 1))
        yield middleware[i].call(ctx.genCtx, next)
      }
    }
    return dispatch(0)
  },
}




// logger

app.use(function* (next) {
  const start = new Date
  console.log('Starting: ', this.body)
  yield next()
  console.log('End: ', this.body)
  const ms = new Date - start
  console.log('%s', ms)
});

// response

app.use(function* () {
  console.log('setting up body')
  this.body = 'Hello World'
});

app.listen(3000)
