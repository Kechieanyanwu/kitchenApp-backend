const express = require('express');
const checklistRouter = express.Router(); 

const { 
    getAllItems,
    addNewItem,
    updateItem,
    deleteItem,
    moveCheckedItem,
    countAllItems } = require('../controllers/controller');

const { validateNewGroceryItem } = require('../../../utilities/model');
checklistRouter.use(express.json()); 
const isJWTAuth = require('../../../config/isJWTAuth');
const populateUser = require('../../../utilities/user');

const { Checklist } = require('../../../database/models/checklist'); 

checklistRouter.use(isJWTAuth); 
checklistRouter.use(populateUser); 


//get all checklist items
checklistRouter.get('/', async (req, res, next) => {
    let checklistArray;
    try {
        checklistArray = await getAllItems(Checklist, req.userId);
    } catch (err) {
        next(err);
    }
    res.status(200).json(checklistArray);
});

//count all checklist items
checklistRouter.get('/count', async (req, res, next) => {
    let count;
    try {
        count = await countAllItems(Checklist, req.userId);
    } catch (err) {
        next(err);
    }
    console.log(count);
    res.status(200).json({ count });
});


//add new checklist item
checklistRouter.post('/', validateNewGroceryItem, async (req, res, next) => {
    let addedItem;
    const newItem = { item_name: req.item_name, quantity: req.quantity, category_id: req.category_id, user_id: req.userId };
    try {
        addedItem = await addNewItem(Checklist, newItem);
    } catch (err) {
        next(err);
    }
    res.status(201).send(addedItem);
});


//update existing checklist item
checklistRouter.put('/:itemID', async (req, res, next) => {
    //can i have a cached list of items in the database? Like an array of existing IDs? so I don't have to keep querying? Potentially....
    const itemID = req.params.itemID;
    const update = req.body;
    let updatedItem;

    if (update.purchased === true ) {
        let updatedChecklist;
        try {
            updatedChecklist = await moveCheckedItem(itemID, req.userId);
        } catch (err) {
            next(err);
        }
        res.status(200).send(updatedChecklist);
    } else {
        try {
            updatedItem = await updateItem(Checklist, itemID, req.userId, update);
        } catch (err) {
            next(err);
        }
        
        res.status(200).send(updatedItem);
    }
});

checklistRouter.delete('/:itemID', async (req, res, next) => {

    const itemID = req.params.itemID;
    let updatedChecklist;

    try {
        updatedChecklist = await deleteItem(Checklist, itemID,req.userId);
    } catch (err) {
        next(err);
    }
    
    res.status(200).send(updatedChecklist);

});


// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    res.status(err.status || 500).send(err.message);
};

checklistRouter.use(errorHandler);


module.exports = checklistRouter;