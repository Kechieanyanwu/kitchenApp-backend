const express = require('express');
const categoriesRouter = express.Router();

const { getAllItems,
    addNewItem,
    getItem,
    updateItem,
    deleteItem } = require('../controllers/controller');

const { validateNewCategory } = require('../../../utilities/model');
const bodyParser = require('body-parser');
const { Category } = require('../../../database/models/category');
const isJWTAuth = require('../../../config/isJWTAuth');
const populateUser = require('../../../utilities/user');

const jsonParser = bodyParser.json(); //used only in specific routes

categoriesRouter.use(isJWTAuth);
categoriesRouter.use(populateUser);
//to include middleware that adds the req.user.dataValues.id to req.userId;

//get all categories
categoriesRouter.get('/', async (req, res, next) => {
    let categoriesArray;
    console.log('User Id as populated by the middleware is', req.userId); //test
    try {
        categoriesArray = await getAllItems(Category); 
    } catch (err) {
        next(err); //validate that all errs have message and status 
    }
    res.status(200).json(categoriesArray);
});



//add new category

// categoriesRouter.post("/", jsonParser, validateNewCategory, async (req, res, next) => {
//     let addedCategory;
//     const newCategory = { category_name: req.category_name, user_id: req.userID }; //included req.userID - will need to work on this 

//     try {
//         addedCategory = await addNewItem(Category, newCategory);
//     } catch (err) {
//         err.status = 400;
//         next(err);
//     }
//     res.status(201).send(addedCategory); 
// })

categoriesRouter.post('/', jsonParser, validateNewCategory, async (req, res, next) => {
    let addedCategory;
    const newCategory = { category_name: req.category_name, user_id: req.user_id };

    try {
        addedCategory = await addNewItem(Category, newCategory);
    } catch (err) {
        err.status = 400;
        next(err);
    }
    res.status(201).send(addedCategory); 
});


//update existing category
categoriesRouter.put('/:itemID', jsonParser, async (req, res, next) => {
    const itemID = req.params.itemID; //code smell, could use a general router.params thingy
    const update = req.body;
    let updatedCategory;

    try {
        updatedCategory = await updateItem(Category, itemID, update);
    } catch (err) {
        next(err);
    }

    res.status(200).send(updatedCategory);

});

categoriesRouter.delete('/:itemID', jsonParser, async (req, res, next) => {
    const itemID = req.params.itemID;
    let updatedCategories;

    try {
        updatedCategories = await deleteItem(Category, itemID);
    } catch (err) {
        next(err);
    }
    res.status(200).send(updatedCategories);

});


const errorHandler = (err, req, res) => {
    console.log('in categories error handler'); //test
    res.status(err.status).send(err.message);
};

categoriesRouter.use(errorHandler);


module.exports = categoriesRouter;