
/*
 * GET home page.
 */

// module.exports.index = function(req, res){
//   res.render('index', { title: 'Express' });
// };

module.exports = function(app){
  app.get('/',function(req,res){
    res.render('index', { path: 'Home' });
  });
  require('./user')(app);
  //var user = require('./user');
  //user(app);
  require('./link')(app);
  require('./category')(app);
};
