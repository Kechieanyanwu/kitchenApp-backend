// Model and Sequelize Imports
const { Checklist } = require('../../../database/models/checklist');
const { Inventory } = require('../../../database/models/inventory');
const { nonExistentItemError } = require('../../../utilities/errors');


const getAllItems = async (modelName, userID, t) => { 
    const items = await modelName.findAll({
        where: { user_id: userID },
        raw: true, 
        attributes: { exclude: ['date_created', 'date_updated'] }, 
        transaction: t
    });
    return items;
};


const countAllItems = async (modelName, userID, t) => {
    const count = await modelName.count({
        where: { user_id: userID },
        transaction: t 
    });
    return count;
};

const getItem = async (modelName, itemID, userID, t) => {
    const requestedItem = await modelName.findOne({ 
        where: { 
            id: itemID, 
            user_id: userID 
        }, 
        raw: true,
        attributes: { exclude: ['date_created', 'date_updated'] },
        transaction: t 
    });

    if (requestedItem === null) {
        throw nonExistentItemError;
    } else {
        return requestedItem;
    }
};


const addNewItem = async(modelName, newItem, t) => {
    const addedItem = await modelName.create(newItem,
        { transaction: t });

    delete addedItem.dataValues.date_created;
    delete addedItem.dataValues.date_updated;

    if (modelName.name == 'User') {
        delete addedItem.dataValues.hashed_password;
        delete addedItem.dataValues.salt;
    }

    return addedItem.dataValues;

};

const updateItem = async(modelName, itemID, userID, desiredUpdate, t) => {
    console.log('finding item ', itemID); //test
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

        delete item.dataValues.date_created;
        delete item.dataValues.date_updated;
    
        return item.dataValues;
    }
};


const deleteItem = async (modelName, itemID, userID, t) => {
    let item;

    if (modelName.name === 'User') {
        item = await modelName.findOne({
            where: {
                id: itemID,
            },
            transaction: t
        });
    } else {
        item = await modelName.findOne({
            where: {
                id: itemID,
                user_id: userID
            },
            transaction: t
        });
    }

    if (!item) {
        throw nonExistentItemError;
    }

    await item.destroy({ transaction: t });

    if (modelName.name !== 'User') {
        const items = await modelName.findAll({
            raw: true,
            attributes: { exclude: ['date_created', 'date_updated'] },
            transaction: t
        });
        return items;
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

        const newItem = {
            ...item.get({ plain: true }),
            id: undefined,
            purchased: undefined
        };

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
