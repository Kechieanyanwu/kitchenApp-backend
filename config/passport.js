const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../database/models/user');
const { comparePassword } = require('../utilities/password');

const customFields = {
    usernameField: 'email',
    passwordField: 'password'
};

const verifyCallback = async (username, password, done) => {
    let user;
    let passwordIsEqual;

    try {
        user = await User.findOne({ where: { email: username } });
    } catch (err) {
        done(err);
    }

    if (!user) {
        return done(null, false);
    } else {

        try {
            passwordIsEqual = await comparePassword(password, user.hashed_password);
        } catch (err) {
            done(err);
        }
        if (passwordIsEqual) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    }
};


const strategy = new LocalStrategy(customFields, verifyCallback);


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser( async (userID, done) => {
    let user;
    try {
        user = await User.findByPk(userID);
    } catch (err) {
        done(err);
    }
    done(null, user);
}); 

passport.use(strategy);
