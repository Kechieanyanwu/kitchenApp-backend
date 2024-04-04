module.exports = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        // eslint-disable-next-line quotes
        res.status(401).send(`<h1>You are not authorized to view this resource</h1><br><a href="/login">Login</a>`);
    }
};


