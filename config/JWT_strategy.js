/* eslint-disable no-undef */
const passport = require('passport');
const { User } = require('../database/models/user');
require('dotenv').config();

const jwtStrategy = require('passport-jwt').Strategy;
const extractJWT = require('passport-jwt').ExtractJwt;


const publicKey = process.env.PUBLIC_KEY;

const options = {
    secretOrKey: publicKey,
    jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    issuer: 'localhost:4002',
    audience: 'mylocalapp',
    algorithms: ['RS256'],

};


const verifyCallback = async (jwt_payload, done) => {
    let user;
    //could use a cachedUser service here
    try {
        user = await User.findOne({ where: { id: jwt_payload.sub } });
    } catch (err) {
        done(err, false);
    }

    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }

};

const strategy = new jwtStrategy(options, verifyCallback);

passport.use(strategy);
