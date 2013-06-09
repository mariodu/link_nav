var mongoose = require( 'mongoose' );
var User = mongoose.model( 'User' );
var Category = mongoose.model( 'Category' );
var sanitize = require('validator').sanitize;

exports.index = function(req, res){
  var is_public;
  console.log(req);
  if( req.session.hasOwnProperty('user') && req.params.user_id == req.session.user.user_id ){
    is_public = [{is_public: true}, {is_public: false}];
  }else{
    is_public = [{is_public: true}];
  }
  Category.find({ owner: req.params.user_id, '$or': is_public }, function(err, categories, count){
    if(err) throw err;
    res.send(categories);
    return;
  });
};

exports.new = function(req, res){
  need_login(req, res, function(req, res){
    res.render('category/new', { path: req.session.user.username + ' | new category' });
  });
};

exports.create = function(req, res){
  var info = {};
  need_login(req, res, function(req, res){
    var cat_name = sanitize(req.body.categoryname).trim();
    cat_name = sanitize(cat_name).xss();
    var is_public = sanitize(req.body.categorypublic).trim();
    is_public = sanitize(is_public).xss();

    if( cat_name == "" ){
      info['error_code'] = 100;
      info['error_info'] = "Please fill form";
      res.send(info);
      return;
    }

    Category.find({ 'owner': req.params.user_id, 'name': cat_name }, function(err, category){
      if(err) throw err;
      if (category.length > 0) {
        info['error_code'] = 112;
        info['error_info'] = "already exist";
        res.send(info);
        return;
      }

      var newCategory = new Category({
        name: cat_name,
        is_public: is_public,
        owner: req.params.user_id
      });

      newCategory.save(function(err, result){
        if(err) throw err;
        User.findByIdAndUpdate(req.params.user_id, { $push: { 'categories': result._id } }, function(err, result){
          if(err) throw err;
          info['error_code'] = 1;
          info['error_info'] = "create success";
          res.send(info);
          return;
        });
        return;
      });
    });
  });
};

exports.destory = function(req, res){
  info = {};
  need_login(req, res, function(req, res){
    Category.findById(req.params.id, function(err, category){
      if(err) throw err;
      if(category.length <= 0){
        info['error_code'] = 114;
        info['error_info'] = "record not found";
        return res.send(info);
      }
      category.remove(function(err, category){
        if(err) throw err;
        info['error_code'] = 2;
        info['error_info'] = "delete success";
        return res.send(info);
      });
    });
  });
};

exports.edit = function(req, res){

};

exports.update = function(req, res){

};


exports.show = function(req, res){
  info = {};
  need_login(req, res, function(req, res){
    Category.findById(parseInt(req.params.id), function(err, category){
      if(err) throw err;
      if(category.length <= 0){
        info['error_code'] = 114;
        info['error_info'] = "record not found";
        return res.send(info);
      }else{
        return res.send(category);
      }
    });
  });
};

function need_login(req, res, callback){
  var info = {};
  if( !req.session.user ){
    info['error_code'] = 110;
    info['error_info'] = 'Login first';
    info['refer_path'] = '/user/login';
    res.send(info);
    return;
  }

  if( req.session.hasOwnProperty('user') && req.params.user_id == req.session.user.user_id ){
    callback(req, res);
    return;
  }else{
    info['error_code'] = 111;
    info['error_info'] = "no right for other user's data";
    info['refer_path'] = req.headers.referer
    res.send(info);
    return;
  }
}