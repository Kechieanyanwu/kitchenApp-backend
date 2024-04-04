const express = require('express');
const inventoryRouter = express.Router(); //creating a router instance
const { getAllItems,
        getItem,
        addNewItem,
        updateItem,
        deleteItem} = require('../controllers/controller');
const { validateNewGroceryItem } = require("../../utilities/model");
const bodyParser = require("body-parser");
const { Inventory } = require('../../database/models/inventory');
const jsonParser = bodyParser.json(); //used only in specific routes


//get all inventory items
inventoryRouter.get("/", async (req, res, next) => {
    let inventoryArray
    try {
        inventoryArray = await getAllItems(Inventory);
    } catch (err) {
        next(err) //validate that all errs have message and status 
    }
    res.status(200).json(inventoryArray)
});

//get specific inventory item
inventoryRouter.get("/:itemID", async (req, res, next) => {
    const itemID = req.params.itemID;
    let item;
    try {
        item = await getItem(Inventory, itemID) //testing sending no transaction T
    } catch (err) {
        err.status = 400;
        next(err);
    }
    res.status(200).send(item)
})

//add new inventory item
inventoryRouter.post("/", jsonParser, validateNewGroceryItem, async (req, res, next) => {
    let addedItem;
    // const newItem = {item_name: req.item_name, quantity: req.quantity, category_id: req.category_id};

    const newItem = {item_name: req.item_name, quantity: req.quantity, category_id: req.category_id, user_id: req.user_id};

    try {
        addedItem = await addNewItem(Inventory, newItem);
    } catch (err) {
        err.status = 400;
        next(err);
    }
    res.status(201).send(addedItem)
})

//update existing inventory item
inventoryRouter.put("/:itemID", jsonParser, async (req, res, next) => {
    const itemID = req.params.itemID; //code smell, could use a general router.params thingy
    const update = req.body;
    let updatedItem;

    try {
        updatedItem = await updateItem(Inventory, itemID, update);
    } catch (err) {
        next(err);
    }

    res.status(200).send(updatedItem);

})

inventoryRouter.delete("/:itemID", jsonParser, async (req, res, next) => {
    // --- WORKING HERE ----

    const itemID = req.params.itemID;
    let updatedInventory;

    try {
        updatedInventory = await deleteItem(Inventory, itemID);
    } catch (err) {
        next(err);
    }
    res.status(200).send(updatedInventory)

})




const errorHandler = (err, req, res, next) => {
    res.status(err.status).send(err.message);
};

inventoryRouter.use(errorHandler);


module.exports = inventoryRouter;