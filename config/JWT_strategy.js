/* eslint-disable no-undef */
const passport = require('passport');
// const fs = require('fs');
const { User } = require('../database/models/user');
// const path = require('path');
require('dotenv').config();

const jwtStrategy = require('passport-jwt').Strategy;
const extractJWT = require('passport-jwt').ExtractJwt;

// const pathToKey = path.join(__dirname, '../pemfiles/id_rsa_pub.pem');
// const publicKey = fs.readFileSync(pathToKey, 'utf8');
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
    console.log('You are in your JWT strategy verify callback'); //test
    //could use a cachedUser service here
    console.log('jwt payload', jwt_payload); //test
    try {
        console.log('subject of jwt payload', jwt_payload.sub); //test
        user = await User.findOne({ where: { id: jwt_payload.sub } });
    } catch (err) {
        done(err, false);
    }

    if (user) {
        console.log('there\'s a user in your verify callback'); //test
        return done(null, user);
    } else {
        console.log('there\'s no user in your verify callback'); //test
        return done(null, false);
    }

};

const strategy = new jwtStrategy(options, verifyCallback);

passport.use(strategy);
