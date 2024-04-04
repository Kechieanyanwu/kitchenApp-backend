const {
        nonExistentItemError,
        incompleteItemError,
        incompleteCategoryError,
        incompleteUserError,
        emptyBodyError
            } = require("./errors");

const emailValidator = require("email-validator");


const validateNewGroceryItem = (req, res, next) => {
    if (JSON.stringify(req.body) == "{}") {
        const err = emptyBodyError;
        err.status = 400;
        next(err);
    } 
    requestObjectKeys = Object.keys(req.body);
    if (req.body.item_name && req.body.quantity && req.body.category_id && req.body.user_id && (requestObjectKeys.length == 4)) {
        req.item_name = req.body.item_name;
        req.quantity = req.body.quantity;
        req.category_id = req.body.category_id;
        req.user_id = req.body.user_id;
        if (typeof req.item_name === "string" && typeof req.quantity === "number" && typeof req.category_id === "number" && typeof req.body.user_id === "number") {
            next();
        } else {
            const err = new Error("Item name must be a string, userID, quantity and category ID must be a number");
            err.status = 400; 

            next(err);
        }
    } else {
        const err = incompleteItemError;
        err.status = 400; 
        next(err);
    }
};


const validateNewCategory = (req, res, next) => {
    if (JSON.stringify(req.body) == "{}") {
        const err = emptyBodyError;
        err.status = 400;
        next(err);
    }
    
    requestObjectKeys = Object.keys(req.body);


    if (req.body.category_name && req.body.user_id && (requestObjectKeys.length == 2)) {
        if (typeof req.body.category_name === "string" && typeof req.body.user_id === "number") {
            req.category_name = req.body.category_name;
            req.user_id = req.body.user_id;
            next();
        } else {
            const err = new Error("Category name must be a string and userID must be a number"); 
            err.status = 400;
            next(err);
        }
    } else {
        const err = incompleteCategoryError;
        err.status = 400;
        next(err);
    }
};


const validateID = async (itemID, modelName, t) => {
    const item = await modelName.findByPk(itemID, 
        { transaction: t }) 

    if (item === null) {
        throw nonExistentItemError;
    }
    return item;
}

const validateNewUser = (req, res, next) => {
    if (JSON.stringify(req.body) == "{}") {
        const err = emptyBodyError;
        err.status = 400;
        next(err);
    } else {
        if (!req.body.username || !req.body.password || !req.body.email) {
            const err = incompleteUserError;
            err.status = 400;
            next(err);
        }
    }
    //validate email
    if (emailValidator.validate(req.body.email)) {
        req.email = req.body.email
    } else {
        const err = new Error("Invalid Email");
        err.status = 400;
        next(err);
    };
    req.username = req.body.username;
    req.password = req.body.password;
    next();
}


module.exports = {
    validateNewCategory,
    validateNewGroceryItem,
    validateID,
    validateNewUser,
    incompleteUserError,
    nonExistentItemError
}