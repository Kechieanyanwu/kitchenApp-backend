// Model and Sequelize Imports
const { sequelize } = require("../../database/models"); 
const { Checklist } = require("../../database/models/checklist");
const { Inventory } = require("../../database/models/inventory");
const { nonExistentItemError } = require("../../utilities/errors");
const { validateID } = require("../../utilities/model");


// to be modified to filter by user

// Beginning of functions
const getAllItems = async (modelName, userID, t) => { //modified for a user
    // let items
    // try {
    //     const items = await modelName.findAll({
    //         where: {
    //             user_id: userID
    //         }
    //     },
    //     { raw: true, attributes: { exclude: ["date_created", "date_updated"] }, transaction: t });

    // } catch (error) {
    //     throw error;
    // }
    // return items;
        try {
            const items = await modelName.findAll(
            // { raw: true, transaction: t }); 
            { raw: true, attributes: {exclude: ["date_created", "date_updated"]}, transaction: t }); 
            // { transaction: t }); 
            return items;
    } catch (error) {
        throw error;
    }
}



const getItem = async (modelName, itemID, t) => {
    try{
            const requestedItem = await modelName.findByPk(itemID, 
                { attributes: {exclude: ["date_created", "date_updated"]},
                transaction: t })
            if (requestedItem === null) {
                throw nonExistentItemError;
            } else {
                return requestedItem.dataValues;
            }
    } catch (err) {
        throw err;
    }
}

// const getItem = async (modelName, itemID, userID, t) => { //modify so you return the requested item outside of the try-catch thing
//     try{
//         const requestedItem = await modelName.findByPk(itemID, 
//             {
//                 where: {
//                     user_id: userID
//                 }
//             }, 
//             { transaction: t })
//         if (requestedItem === null) {
//             throw nonExistentItemError;
//         } else {
//             delete requestedItem.dataValues.date_created;
//             delete requestedItem.dataValues.date_updated;
//             return requestedItem.dataValues;
//         }

//     } catch (err) {
//         throw err;
//     }
// }


const addNewItem = async(modelName, newItem, t) => { //update to include userID
    try {
        const addedItem = await modelName.create(newItem,
            { transaction: t });

        // remove these columns from result
        delete addedItem.dataValues.date_created;
        delete addedItem.dataValues.date_updated;

        if (modelName.name == "User") {
            delete addedItem.dataValues.hashed_password;
            delete addedItem.dataValues.salt;
        }

        // return new item
        return addedItem.dataValues

    } catch (err) {
        throw err;
    }
}

const updateItem = async(modelName, itemID, desiredUpdate, t) => { 
    let item;
    try {
        item = await validateID(itemID, modelName, t)
    } catch (err) {
        throw err;
    }

    await item.update(desiredUpdate, { transaction: t });

    // remove these columns from result
    delete item.dataValues.date_created;
    delete item.dataValues.date_updated;

    //return updated item 
    return item.dataValues;

}

const deleteItem = async (modelName, itemID, t) => {
    let item;
    try {
        item = await validateID(itemID, modelName, t)
    } catch (err) {
        throw err;
    }

    await item.destroy({ transaction: t });

    if (modelName.name != "User") { // not returning an array of users for privacy sake
        const items = await modelName.findAll(
            {
                raw: true,
                attributes: { exclude: ["date_created", "date_updated"] },
                transaction: t
            });
        return items; 
    } else {
        return
    }
}

const moveCheckedItem = async (itemID, t) => {
    let item;
    try {
        item = await validateID(itemID, Checklist, t)
    } catch (err) {
        throw err;
    }

    newItem = item.get({ transaction: t });

    //remove unnecessary values
    delete newItem.id;
    delete newItem.purchased;
    
    //add to inventory table
    await Inventory.create(newItem, { transaction: t });

    await Checklist.destroy({ where: { id: itemID }, transaction: t })
    
    const updatedChecklist = await Checklist.findAll(
        { attributes: { exclude: ["date_created", "date_updated"] }, 
        transaction: t });

    return updatedChecklist;
}


module.exports = { 
    getAllItems,
    addNewItem,
    getItem,
    updateItem,
    deleteItem,
    moveCheckedItem,
 };
