var crypto   = require('crypto');
var mongoose = require( 'mongoose' );
var User     = mongoose.model( 'User' );
var check = require('validator').check
, sanitize = require('validator').sanitize;

exports.index = function(req, res){

};

exports.login_page = function(req, res){
  req.session._loginReferer = req.headers.referer;
  if(!req.session.user){
    res.render('user/login', { path: 'Login' });
  }else{
    res.redirect('/');
  }
};

exports.login = function(req, res){
  var info = {};
  if(req.session.user){
    info['error_code'] = 109;
    info['error_info'] = "Already Login";
    res.send(info);
    return;
  }
  var o_email = sanitize(req.body.email).trim();
  var email = sanitize(o_email).xss().toLowerCase();
  var password = sanitize(req.body.password).trim();
  password = sanitize(password).xss();
  if (!email || !password){
    info['error_code'] = '100';
    info['error_info'] = 'Please fill form';
    res.send(info);
    return;
  };

  User.findOne({
    'email':email
  }, function(err, result){
    if(err) throw err;
    if(!result){
      info['error_code'] = "107";
      info['error_info'] = "user not exist";
      res.send(info);
      return;
    }
    password = encrpty_password(password, result.salt);

    if(password!=result.hashed_password){
      info['error_code'] = "108";
      info['error_info'] = "password error";
      res.send(info);
      return;
    }

    set_session_cookies(result, res, req);

    set_user_login_info(result, req);

    var refer = req.session._loginReferer || '/user/'+ result.username;
    info['error_code'] = 1;
    info['error_info'] = "Login success";
    info['refer_path'] = refer;
    res.send(info);
  });
};

exports.register = function(req, res){
  req.session._regReferer = req.headers.referer;
  if(!req.session.user){
    res.render('user/register', { path: 'Register' });
  }else{
    res.redirect('/');
  }
};

exports.create = function(req, res){
  var info = {};
  if(req.session.user){
    info['error_code'] = 109;
    info['error_info'] = "Already Login";
    res.send(info);
    return;
  }
  var o_username = sanitize(req.body.username).trim();
  var username = sanitize(o_username).xss().toLowerCase();
  var o_email = sanitize(req.body.email).trim();
  var email = sanitize(o_email).xss().toLowerCase();
  var password = sanitize(req.body.password).trim();
  password = sanitize(password).xss()
  var password_confirmtion = sanitize(req.body.password_confirmtion).trim();
  password_confirmtion = sanitize(password_confirmtion).xss();

  if (username == '' || password == '' || password_confirmtion == '' || email == '') {
    info['error_code'] = 100;
    info['error_info'] = "Please fill form";
    res.send(info);
    return;
  }
  if (username.length < 5) {
    info['error_code'] = 101;
    info['error_info'] = "username to short";
    res.send(info);
    return;
  }
  try {
    check(username, 'username only 0-9，a-z，A-Z。').isAlphanumeric();
  } catch (e) {
    info['error_code'] = 102;
    info['error_info'] = e.message;
    res.send(info);
    return;
  }
  if(password.length < 6){
    info['error_code'] = 106;
    info['error_info'] = "password too short";
    res.send(info);
    return;
  }
  if (password != password_confirmtion) {
    info['error_code'] = 103;
    info['error_info'] = "password not same";
    res.send(info);
    return;
  }
  try {
    check(email, 'email incorrect').isEmail();
  } catch (e) {
    info['error_code'] = 104;
    info['error_info'] = e.message;
    res.send(info);
    return;
  }

  User.find({ '$or': [{ 'username': username },{'email': email }] }, function(err, result){
    if (err) throw(err);
    if (result.length > 0) {
      info['error_code'] = 105;
      info['error_info'] = "username or email has be registered";
      res.send(info);
      return;
    }

    password = encrpty_password(password);
    var salt = generateSalt();
    var date = new Date();

    var newUser = new User({
      username: username,
      hashed_password: password,
      email: email,
      salt: salt,
      last_login_date: date,
      login: [{ date:date, ip: req.ip}]
    });

    newUser.save(function(err, result){
      if(err) throw(err);
      info['error_code'] = 0;
      info['error_info'] = "Register success! Welcome to Link Nav!";
      info['refer_path'] = req.session._regReferer || '/user/' + result.username;
      set_session_cookies(result, res, req);
      set_user_login_info(result, req);
      res.send(info);
    });
  });
};

exports.logout = function(req, res, next) {
  req.session.destroy();
  res.clearCookie('link_nav_user_cookie', {
    path: '/'
  });
  res.redirect('/');
};

exports.show = function(req, res){

};

exports.edit = function(req, res){

};

exports.update = function(req, res){

};

exports.destory = function(req, res){

};

exports.center = function(req, res){
  req.session._regReferer = req.headers.referer;
  if(!req.session.user){
    res.render('user/login', { path: 'Login' });
  }else if(req.session.user.username == req.params.user_name){
    res.render('user/center', { path: req.session.user.username } );
  }else{
    User.find({ 'username': req.params.user_name }, function(err, result){
      if (err) throw (err);
      if(result.length > 0)
        res.render('user/public_center', { path: req.session.user.username } );
      else
        res.render('404', { path: "404 Not Found" } );
    });
  }
}

exports.auth_user = function(req, res, next) {
  if (req.session.user) {
    res.locals.current_user = req.session.user;
    return next();
  } else {
    var cookie = req.cookies['link_nav_user_cookie'];
    if (!cookie){
      res.locals.current_user = "";
      return next();
    };
    var auth_token = decrypt(cookie, 'link_nav_user_session');
    var auth = auth_token.split('\t');
    var user_email=auth[2].toLowerCase();
    User.findOne({'email': user_email},function(err, result) {
      if(err) return next(err);
      if (result) {
        var session_user = { 'user_id': result._id, 'username': result.username, 'email': result.email };
        req.session.user = session_user;
        res.locals.current_user = req.session.user;
        return next();
      }else{
        return next();
      }
    });
  }
};

//private
function encrpty_password(password, salt){
  var md5 = crypto.createHash('md5');
  hashed_password = md5.update(password).digest('base64');
  return hashed_password;
};

var generateSalt = function()
{
  var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
  var salt = '';
  for (var i = 0; i < 10; i++) {
    var p = Math.floor(Math.random() * set.length);
    salt += set[p];
  }
  return salt;
}

function encrypt(str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}
function decrypt(str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function set_session_cookies(user, res, req) {
  var auth_token = encrypt(user._id + '\t' + user.username + '\t' + user.email, 'link_nav_user_session');
  res.cookie('link_nav_user_cookie', auth_token, {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }); //cookie 有效期1周
  var session_user = { 'user_id': user._id, 'username': user.username, 'email': user.email };
  req.session.user = session_user;
};

function set_user_login_info(user, req){
  var date = new Date();
  user.last_login_date = date;
  user.login.date = date;
  user.login.ip = req.ip;
}

