// Model and Sequelize Imports
const { sequelize } = require('../../../database/models'); 
const { Checklist } = require('../../../database/models/checklist');
const { Inventory } = require('../../../database/models/inventory');
const { nonExistentItemError } = require('../../../utilities/errors');
const { findItem } = require('../../../utilities/model');

const getAllItems = async (modelName, userID, t) => { 
    const items = await modelName.findAll({
        where: { user_id: userID }
    },
    { raw: true, attributes: { exclude: ['date_created', 'date_updated'] }, transaction: t });
    return items;
};


const countAllItems = async (modelName, userID, t) => {
    const count = await modelName.count({
        where: { user_id: userID }
    });
    return count;
};

const getItem = async (modelName, itemID, userID, t) => {
    const requestedItem = await modelName.findOne({ 
        where: { 
            id: itemID, 
            user_id: userID 
        }, 
        transaction: t 
    });

    if (requestedItem === null) {
        throw nonExistentItemError;
    } else {
        delete requestedItem.dataValues.date_created;
        delete requestedItem.dataValues.date_updated;
        return requestedItem.dataValues;
    }
};


const addNewItem = async(modelName, newItem, t) => {
    console.log('in add new item'); //test
    try {
        const addedItem = await modelName.create(newItem,
            { transaction: t });

        // remove these columns from result
        delete addedItem.dataValues.date_created;
        delete addedItem.dataValues.date_updated;

        if (modelName.name == 'User') {
            delete addedItem.dataValues.hashed_password;
            delete addedItem.dataValues.salt;
        }

        console.log('Added items', addedItem.dataValues); //test
        return addedItem.dataValues;

    } catch (err) {
        console.log(err); //test
        throw err;
    }
};

const updateItem = async(modelName, itemID, userID, desiredUpdate, t) => {
    const item = await modelName.findOne({ 
        where: { 
            id: itemID, 
            user_id: userID 
        }, 
        transaction: t 
    });

    if (item === null) {
        throw nonExistentItemError;
    } else {
        await item.update(desiredUpdate, { transaction: t });

        // remove these columns from result
        delete item.dataValues.date_created;
        delete item.dataValues.date_updated;
    
        //return updated item 
        return item.dataValues;
    }
};


const deleteItem = async (modelName, itemID, t) => {
    const item = await validateID(itemID, modelName, t);

    await item.destroy({ transaction: t });

    if (modelName.name != 'User') { // not returning an array of users for privacy sake
        const items = await modelName.findAll(
            {
                raw: true,
                attributes: { exclude: ['date_created', 'date_updated'] },
                transaction: t
            });
        return items; 
    } else {
        return;
    }
};

const moveCheckedItem = async (itemID, userID, t) => {
    const item = await Checklist.findOne({ 
        where: { 
            id: itemID, 
            user_id: userID 
        }, 
        transaction: t 
    });

    if (item === null) {
        throw nonExistentItemError;
    } else {

        // Create a new item object excluding unnecessary values
        const newItem = {
            ...item.get({ plain: true }),
            id: undefined,      // remove id
            purchased: undefined // remove purchased
        };
    
        //add to inventory table
        await Inventory.create(newItem, { transaction: t });

        await Checklist.destroy({ where: { id: itemID, user_id: userID }, transaction: t });
    
        const updatedChecklist = await Checklist.findAll(
            { attributes: { exclude: ['date_created', 'date_updated'] }, 
                transaction: t });

        return updatedChecklist;
    }
};


module.exports = { 
    getAllItems,
    addNewItem,
    getItem,
    updateItem,
    deleteItem,
    moveCheckedItem,
    countAllItems,
};
