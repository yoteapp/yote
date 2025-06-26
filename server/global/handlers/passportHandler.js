const UserSchema = require('../../resources/user/UserModel')
const User = require('mongoose').model('User');
const YoteError = require('../../global/helpers/YoteError');
let passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// TODO: once working, redo for new asyncs

// console.log("PASSPORT")

// define strategies
passport.use('local', new LocalStrategy({
  passReqToCallback: true
}, async function(req, username, password, done) {
    var projection = {
      username: 1, password_salt: 1, password_hash: 1, roles: 1
    }
    // console.log("TESTING", username, password)
    try {
      const user = await User.findOne({username}, projection).exec();
      if(user && user.checkPassword(password)) {
        console.log("authenticated!");
        return done(null, user);
      } else {
        console.log("NOT authenticated");
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  }
));
// other user auth strategies defined here

passport.serializeUser((user, cb) => {
  // logger.warn("SERIALIZE USER");
  if(user) {
    cb(null, user._id);
  }
});

passport.deserializeUser(async (id, cb) => {
  // logger.warn("DESERIALIZE USER");
  // NOTE: we want mobile user to have access to their api token, but we don't want it to be select: true
  try {
    const user = await User.findOne({_id: id}).exec();
    if(user) {
      return cb(null, user);
    } else {
      return cb(null, false);
    }
  } catch (err) {
    return cb(err);
  }
})

exports.passport = passport;