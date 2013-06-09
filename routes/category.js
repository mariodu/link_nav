
/*
 * Category actions.
 */

var category = require('../controller/category.js');

module.exports = function(app){
  app.get('/:user_id/categories', category.index);

  app.get('/:user_id/category/new', category.new);

  app.post('/:user_id/category/new', category.create);

  app.get('/:user_id/category/:id', category.show);

  app.get('/:user_id/category/:id/edit', category.edit);

  app.post('/:user_id/category/:id', category.update);

  app.delete('/:user_id/category/:id', category.destory);
}