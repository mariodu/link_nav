express = require 'express'
http = require 'http'
path = require 'path'
db = require './db'
routes = require './routes'

app = express()

app.set 'port', process.env.PORT || 3000
app.set 'views', __dirname + '/views'
app.set 'view engine', 'jade'
app.use express.favicon()
app.use express.logger('dev')
app.use express.bodyParser()
app.use express.methodOverride()
app.use express.cookieParser('link_nav_user_cookie')
app.use express.session({
  secret: 'link_nav_user_session'
  })
app.use app.router
app.use require('less-middleware')({ src: __dirname + '/public' })
app.use express.static(path.join(__dirname, 'public'))

app.configure 'development', ->
  app.use express.errorHandler dumpExceptions: true, showStack: true

app.configure 'production', ->
  app.use express.errorHandler()

app.all '*', require('./controller/user').auth_user

routes app

console.log app.routes

http.createServer(app).listen(app.get('port'), ->
  console.log 'Express server listening on port ' + app.get('port'))