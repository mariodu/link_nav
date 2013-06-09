var mongoose = require('mongoose');
var db       = mongoose.connection;
var Schema   = mongoose.Schema;
var autoinc  = require('mongoose-id-autoinc')
db.on('error', console.error.bind(console, 'connection error:'));

autoinc.init(db);

var UserSchema = Schema({
  _id: Number,
  email: {type: String, unique: true},
  username: {type: String, unique: true},
  hashed_password: String,
  salt: String,
  last_login_date: Date,
  login: [{ date: Date, ip: String}],
  created_at: { type: Date, default: Date.now },
  links: [{ type: Number, ref: 'Link' }],
  categories: [{ type: Number, ref: 'Category' }]
});

UserSchema.index({ email: 1, username: 1 });

var CategorySchema = Schema({
  _id: Number,
  name: String,
  is_public: { type: Boolean, default: false},
  owner: { type: Number, ref: 'User' },
  links: [{ type: Number, ref: 'Link' }]
});

CategorySchema.index({ ower: 1 });

var LinkSchema = Schema({
  _id: Number,
  owner: { type: Number, ref: 'User' },
  name: String,
  url: String,
  is_public: { type: Boolean, default: false},
  description: String,
  category: { type: Number, ref: 'Category' }
});

LinkSchema.index({ ower: 1 });

UserSchema.plugin(autoinc.plugin, {model: 'User'});
LinkSchema.plugin(autoinc.plugin, {model: 'Link'});
CategorySchema.plugin(autoinc.plugin, {model: 'Category'});

var User = mongoose.model('User', UserSchema);
var Link = mongoose.model('Link', LinkSchema);
var Category = mongoose.model('Category', CategorySchema);

mongoose.connect( 'mongodb://localhost/link_nav' );