const express = require('express');
const checklistRouter = express.Router(); //creating a router instance 
const { getAllItems,
        getItem,
        addNewItem,
        updateItem,
        deleteItem,
        moveCheckedItem} = require('../controllers/controller');
const { validateNewGroceryItem } = require('../../utilities/model');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json(); //used only in specific routes

const { Checklist } = require('../../database/models/checklist'); 
const { sequelize } = require('../../database/models');
const { Inventory } = require('../../database/models/inventory');

const passport = require('passport');
require('../../config/JWT_strategy');
// const passport = require('passport'); //test
// require('../../config/JWT_strategy')(passport); //test
checklistRouter.use(passport.initialize());

// checklistRouter.use((req, res, next) => { //test
//     console.log('Logging headers before entering checklist route', req.headers);
//     next();
// });

// checklistRouter.use(passport.authenticate('jwt', { session: false })); //just added


const isJWTAuth = (req, res, next) => {
    console.log('in isJWTauth'); //test
    if (req.headers.authorization) {
        passport.authenticate('jwt', { session: false }, function(err, user) {
            if(!err && user) {
                req.user = user;
                next();
            } else {
                res.status(401).json({ authenticated: false, message: 'Error occured' });
            }
        });
    } else {
        res.status(401).json({ message: 'No JWT token supplied'});
    }
};

//get all checklist items
// checklistRouter.get('/', async (req, res, next) => {
checklistRouter.get('/', isJWTAuth, async (req, res, next) => {
    let checklistArray;
    try {
        checklistArray = await getAllItems(Checklist); //based on ID
    } catch (err) {
        next(err) //validate that all errs have message and status 
    }
    res.status(200).json(checklistArray)
});

//get specific item
checklistRouter.get('/:itemID', async (req, res, next) => {
    const itemID = req.params.itemID;
    let item; 
    try {
        item = await getItem(Checklist, itemID)
    } catch (err) {
        err.status = 400;
        next(err);
    }
    res.status(200).send(item);
})

//add new checklist item
checklistRouter.post('/', jsonParser, validateNewGroceryItem, async (req, res, next) => {
    let addedItem;
    const newItem = {item_name: req.item_name, quantity: req.quantity, category_id: req.category_id, user_id: req.user_id};
    try {
        addedItem = await addNewItem(Checklist, newItem);
    } catch (err) {
        err.status = 400;
        next(err);
    }
    res.status(201).send(addedItem)
})


//update existing checklist item
checklistRouter.put('/:itemID', jsonParser, async (req, res, next) => {
    //can i have a cached list of items in the database? Like an array of existing IDs? so I don't have to keep querying? Potentially....
    const itemID = req.params.itemID; //code smell, could use a general router.params thingy especially to validate existence
    const update = req.body;
    let updatedItem;

    if (update.purchased === true ) { //if this item has been marked as purchased
        let updatedChecklist
        try {
            updatedChecklist = await moveCheckedItem(itemID);
        } catch (err) {
            throw (err);
        }
        res.status(200).send(updatedChecklist);
    } else {
        try {
            updatedItem = await updateItem(Checklist, itemID, update);
        } catch (err) {
            next(err);
        }
        res.status(200).send(updatedItem);
    }
})

checklistRouter.delete('/:itemID', jsonParser, async (req, res, next) => {

    const itemID = req.params.itemID;
    let updatedChecklist;

    try {
        updatedChecklist = await deleteItem(Checklist, itemID);
    } catch (err) {
        next(err);
    }
    res.status(200).send(updatedChecklist)

})


const errorHandler = (err, req, res, next) => {
    res.status(err.status).send(err.message);
};

checklistRouter.use(errorHandler);


module.exports = checklistRouter;