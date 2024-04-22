const express = require('express');
const userRouter = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { validateNewUser } = require('../../../utilities/model');
const { hashPassword }  = require('../../../utilities/password');
const { addNewItem, deleteItem } = require('../controllers/controller');
const { User } = require('../../../database/models/user');
const isJWTAuth = require('../../../config/isJWTAuth');

userRouter.use(jsonParser);

// user register
userRouter.post('/register', validateNewUser, async (req, res, next) => {

    // to add a check for whether the email already exists so you can't have a duplicate user 
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
userRouter.delete('/:itemID', isJWTAuth, async (req, res, next) => {
    const itemID = req.params.itemID;
    let updatedUsers;

    try {
        updatedUsers = await deleteItem(User, itemID);
    } catch (err) {
        next(err);
    }
    res.status(200).send(updatedUsers);
});




const errorHandler = (err, req, res) => {
    res.status(err.status).send(err.message);
};

userRouter.use(errorHandler);


module.exports = userRouter;
