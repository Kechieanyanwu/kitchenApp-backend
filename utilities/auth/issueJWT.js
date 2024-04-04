const jwt = require('jsonwebtoken');
const fs = require('fs');

// eslint-disable-next-line no-undef
const privateKey = fs.readFileSync(__dirname + '/../../pemfiles/id_rsa_priv.pem');

const issueToken = (user) => {
    const { id } = user;
    // const expiresIn = '1d';
    const expiresIn = 60 * 60 * 24;
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