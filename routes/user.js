
/*
 * User actions.
 */

var user = require('../controller/user.js');

module.exports = function(app){
  app.get('/user/login', user.login_page);

  app.post('/user/login', user.login);

  app.get('/user/register', user.register);

  app.post('/user/register', user.create);

  app.get('/user/logout', user.logout);

  app.get('/user/:user_name', user.center);

  app.get('/user/:id/edit', user.edit);

  app.post('/user/:id/edit', user.update);

  app.get('/users', user.index);

  app.get('/user/:id', user.show);

  app.delete('/user/:id', user.destory);
}
