
/*
 * Link actions.
 */

var link = require('../controller/link');

module.exports = function(app){
  app.get('/:user_id/links', link.index);

  app.get('/:user_id/link/new', link.new);

  app.post('/:user_id/link/new', link.create);

  app.get('/:user_id/link/:id', link.show);

  app.get('/:user_id/link/:id/edit', link.edit);

  app.post('/:user_id/link/:id/edit', link.update);

  app.delete('/:user_id/link/:id', link.destory);
}
