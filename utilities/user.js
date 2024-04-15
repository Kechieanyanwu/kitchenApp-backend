module.exports = (req, res, next) => {
    if (req.user) {
        req.userId = req.user.dataValues.id;
        next();
    } else {
        const err = new Error('No user is logged in this session');
        next(err);
    }
};