/* eslint-disable no-undef */
const jwt = require('jsonwebtoken');
const fs = require('fs');


// const privateKey = fs.readFileSync(__dirname + '/../pemfiles/id_rsa_priv.pem');


const issueToken = (user) => {
    const privateKey = fs.readFileSync(__dirname + '/../../pemfiles/id_rsa_priv.pem');
    const { id } = user;
    // const expiresIn = '1d';
    const expiresIn = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
    // const expiresIn = 60 * 60 * 24;
    const options = {
        algorithm: 'RS256',
        expiresIn: expiresIn,
        issuer: 'localhost:4002',
        audience: 'mylocalapp'
    };

    const payload = {
        sub: id,
        iat: Date.now()
    };

    const signedToken = jwt.sign(payload, privateKey, options);

    return {
        token: 'Bearer ' + signedToken,
        expires: expiresIn
    };
};

module.exports = issueToken;