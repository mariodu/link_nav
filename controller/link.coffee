mongoose = require 'mongoose'
Link     = mongoose.model 'Link'
Category = mongoose.model 'Category'
User     = mongoose.model 'User'
sanitize = require('validator').sanitize
check = require('validator').check

exports.index = (req, res) ->
  if req.session.hasOwnProperty('user') && parseInt(req.params.user_id) == req.session.user.user_id
    is_public = [ is_public: true, { is_public: false} ]
  else
    is_public = [ is_public: true]
  Link.find owner: req.params.user_id, $or: is_public, (err, links, count) ->
    throw err if err
    res.send links

exports.new = (req, res) ->
  need_login req, res, (req, res) ->
    Category.find owner: req.params.user_id, (err, categories) ->
      throw err if err
      res.render 'link/new', path: req.session.user.username + ' | new link', categories: categories

exports.create = (req, res) ->
  need_login req, res, (req, res) ->
    link_name = sanitize(req.body.linkname).trim();
    link_name = sanitize(link_name).xss();
    is_public = sanitize(req.body.linkpublic).trim();
    is_public = sanitize(is_public).xss();
    link_description = sanitize(req.body.linkdescription).trim();
    link_description = sanitize(link_description).xss();
    link_category = sanitize(req.body.linkcategory).trim();
    link_category = sanitize(link_category).xss();
    link_url = sanitize(req.body.linkurl).trim();
    link_url = sanitize(link_url).xss();

    if link_name == "" || link_url == ""
      info=
        error_code: 100
        error_info: "Please fill form"
      return res.send info

    try
      check(link_url, 'url format incorrect').isUrl()
    catch error
      info=
        error_code: 113
        error_info: error.message
      return res.send info

    Link.find owner: req.params.user_id, '$or': [ name: link_name, { url: link_url }], (err, links)->
      throw err if err
      if links.length > 0
        info =
          error_code: 112
          error_info: "already exist"
        return res.send(info)
      newLink = new Link name: link_name, url: link_url, description: link_description, is_public: is_public, owner: req.params.user_id, category: link_category
      newLink.save (err, result) ->
        throw err if err
        new_link_id = result._id
        User.findByIdAndUpdate req.params.user_id, $push: 'links': new_link_id, (err, result) ->
          throw err if err
          Category.findByIdAndUpdate link_category, $push: 'links': new_link_id, (err, result) ->
            info =
              error_code: 1
              error_info: "create success"
            res.send(info)


exports.destory = (req, res) ->

exports.edit = (req, res) ->

exports.update = (req, res) ->

exports.show = (req, res) ->


need_login = (req, res, callback) ->
  if !req.session.user
    info =
      error_code: 110
      error_info: 'Login first'
      refer_path: '/user/login'
    return res.send info
  if req.session.hasOwnProperty('user') && parseInt(req.params.user_id) == req.session.user.user_id
    callback req, res
  else
    info =
      error_code: 111
      error_info: "no right for other user's data"
      refer_path: req.headers.referer
    res.send info