/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
// const fs = require('fs');
require('dotenv').config();


// const privateKey = fs.readFileSync(__dirname + '/../pemfiles/id_rsa_priv.pem');


const issueToken = (userID) => {
    // const privateKey = fs.readFileSync(__dirname + '/../../pemfiles/id_rsa_priv.pem');
    const privateKey = process.env.PRIVATE_KEY;
    const expiresIn = Math.floor(Date.now() / 1000) + (60 * 60 * 24);

    const options = {
        algorithm: 'RS256',
        expiresIn: expiresIn,
        issuer: 'localhost:4002',
        audience: 'mylocalapp'
    };

    const payload = {
        sub: userID,
        iat: Date.now()
    };

    const signedToken = jwt.sign(payload, privateKey, options);

    return {
        token: 'Bearer ' + signedToken,
        expires: expiresIn
    };
};

module.exports = issueToken;