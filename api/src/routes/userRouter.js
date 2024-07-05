const express = require('express');
const userRouter = express.Router();
const { validateNewUser } = require('../../../utilities/model');
const { hashPassword }  = require('../../../utilities/password');
const { addNewItem, deleteItem } = require('../controllers/controller');
const { User } = require('../../../database/models/user');
const isJWTAuth = require('../../../config/isJWTAuth');
const populateUser = require('../../../utilities/user');
userRouter.use(express.json()); 

// user register
userRouter.post('/register', validateNewUser, async (req, res, next) => {

    const { hash, salt } = await hashPassword(req.password);

    const userObject = {
        username: req.username,
        email: req.email,
        hashed_password: hash,
        salt: salt
    };
    let addedUser;

    try {        
        addedUser = await addNewItem(User, userObject);
    } catch (err) {
        next(err);
    }
    
    res.status(201).send(addedUser);

});

// user delete 
// Is this secure enough? A user can only delete their own account. Might change implementation because how does frontend get the userID?
userRouter.delete('/:itemID', isJWTAuth, populateUser, async (req, res, next) => {
    try {
        await deleteItem(User, req.userId);
    } catch (err) {
        next(err);
    }
    res.status(200).send();
});




// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    res.status(err.status || 500).send(err.message);
};

userRouter.use(errorHandler);


module.exports = userRouter;
