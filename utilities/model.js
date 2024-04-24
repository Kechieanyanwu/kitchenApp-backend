const {
    nonExistentItemError,
    incompleteItemError,
    incompleteUserError,
    emptyBodyError
} = require('./errors');

const emailValidator = require('email-validator');

const validateNewGroceryItem = (req, res, next) => {
    if (JSON.stringify(req.body) == '{}') {
        // console.log('empty body error in validateNewGroceryItem'); //test
        const err = emptyBodyError;
        err.status = 400;
        next(err);
    } else {
        const requestObjectKeys = Object.keys(req.body);
    
        if (req.body.item_name && req.body.quantity && req.body.category_id && (requestObjectKeys.length == 3)) {
            // console.log('In validate new grocery item'); //test
            req.item_name = req.body.item_name;
            req.quantity = req.body.quantity;
            req.category_id = req.body.category_id;
            if (typeof req.item_name === 'string' && typeof req.quantity === 'number' && typeof req.category_id === 'number') {
                // console.log('Going to endpoint'); //test
                next();
            } else {
                const err = new Error('Item name must be a string, quantity and category ID must be a number');
                // console.log(err); //test
                err.status = 400; 
                next(err);
            }
        } else {
            const err = incompleteItemError;
            // console.log(err); //test
            err.status = 400; 
            next(err);
        }
    }
    
};


const validateNewCategory = (req, res, next) => {
    if (JSON.stringify(req.body) == '{}') {
        // console.log('You have an empty request body'); //test
        const err = emptyBodyError;
        err.status = 400;
        next(err);
    } else {
        if (req.body.category_name && typeof req.body.category_name === 'string' ) {
            req.category_name = req.body.category_name;
            next();
        } else {
            const err = new Error('There must be a field, Category name, which must be a string'); 
            // console.log(err); //test
            err.status = 400;
            next(err);
        }
    }
};

const validateID = async (itemID, modelName, t) => {
    const item = await modelName.findByPk(itemID, 
        { transaction: t });

    if (item === null) {
        throw nonExistentItemError;
    }
    return item;
};

const validateNewUser = (req, res, next) => {
    if (JSON.stringify(req.body) == '{}') {
        const err = emptyBodyError;
        err.status = 400;
        next(err);
    } else {
        if (req.body.username || req.body.password || req.body.email) {
            if (emailValidator.validate(req.body.email)) {
                req.email = req.body.email;
                req.username = req.body.username;
                req.password = req.body.password;
                next();
            } else {
                const err = new Error('Invalid Email');
                err.status = 400;
                next(err);
            }
        } else {
            const err = incompleteUserError;
            err.status = 400;
            next(err);
        }
    }  
};


module.exports = {
    validateNewCategory,
    validateNewGroceryItem,
    validateID,
    validateNewUser,
    incompleteUserError,
    nonExistentItemError
};