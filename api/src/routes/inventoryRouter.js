const express = require('express');
const inventoryRouter = express.Router(); //creating a router instance
const { 
    getAllItems,
    addNewItem,
    updateItem,
    deleteItem, 
    countAllItems } = require('../controllers/controller');
const { validateNewGroceryItem } = require('../../../utilities/model');
const { Inventory } = require('../../../database/models/inventory');
inventoryRouter.use(express.json()); 
const isJWTAuth = require('../../../config/isJWTAuth');
const populateUser = require('../../../utilities/user');

inventoryRouter.use(isJWTAuth);
inventoryRouter.use(populateUser);

//get all inventory items
inventoryRouter.get('/', async (req, res, next) => {
    let inventoryArray;
    try {
        inventoryArray = await getAllItems(Inventory, req.userId);
    } catch (err) {
        next(err);
    }
    res.status(200).json(inventoryArray);
});

//count all inventory items
inventoryRouter.get('/count', async (req, res, next) => {
    let count;

    try {
        count = await countAllItems(Inventory, req.userId);
    } catch (err) {
        next(err);
    }

    res.status(200).json({ count });
});


//add new inventory item
inventoryRouter.post('/', validateNewGroceryItem, async (req, res, next) => {
    let addedItem;

    const newItem = { item_name: req.item_name, quantity: req.quantity, category_id: req.category_id, user_id: req.userId };

    try {
        addedItem = await addNewItem(Inventory, newItem);
    } catch (err) {
        next(err);
    }

    res.status(201).send(addedItem);
});

//update existing inventory item
inventoryRouter.put('/:itemID', async (req, res, next) => {
    const itemID = req.params.itemID; //code smell, could use a general router.params thingy
    const update = req.body;
    let updatedItem;

    try {
        updatedItem = await updateItem(Inventory, itemID, req.userId, update);
    } catch (err) {
        next(err);
    }

    res.status(200).send(updatedItem);

});

inventoryRouter.delete('/:itemID', async (req, res, next) => {

    const itemID = req.params.itemID;
    let updatedInventory;

    try {
        updatedInventory = await deleteItem(Inventory, itemID, req.userId);
    } catch (err) {
        next(err);
    }

    res.status(200).send(updatedInventory);

});




// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    res.status(err.status || 500).send(err.message);
};

inventoryRouter.use(errorHandler);


module.exports = inventoryRouter;