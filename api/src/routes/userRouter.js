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
// to implement permissions. Only admin should have permission for this 
userRouter.delete('/:itemID', isJWTAuth, populateUser, async (req, res, next) => {
    let updatedUsers;

    try {
        updatedUsers = await deleteItem(User, req.userId); //to change this to not return any updated users
    } catch (err) {
        next(err);
    }
    res.status(200).send(updatedUsers);
});




const errorHandler = (err, req, res, next) => {
    res.status(err.status).send(err.message);
};

userRouter.use(errorHandler);


module.exports = userRouter;
