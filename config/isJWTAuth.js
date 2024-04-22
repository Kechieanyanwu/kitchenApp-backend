
const passport = require('passport');
require('./JWT_strategy');
passport.initialize();


const isJWTAuth = (req, res, next) => {
    if (req.headers.authorization) {
        passport.authenticate('jwt', { session: false }, function(err, user, info) {
            if (!err && user) {
                req.user = user;
                next();
            } else {
                console.log(info);
                res.status(401).json({ authenticated: false, message: 'Failed to authenticate using JWT' });
            }
        })(req, res, next); // This invokes the passport.authenticate function
    } else {
        res.status(401).json({ message: 'No JWT token supplied' });
    }
};

module.exports = isJWTAuth;