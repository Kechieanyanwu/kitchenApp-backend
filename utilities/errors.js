const nonExistentItemError = new Error('Nonexistent item');
nonExistentItemError.status = 400;

const incompleteItemError = new Error('Item must have an item name, quantity and category ID');
incompleteItemError.status = 400;

const incompleteCategoryError = new Error('Request must only contain a category name');
incompleteCategoryError.status = 400;

const incompleteUserError = new Error('A user must have an email, a username, and a password');
incompleteUserError.status = 400;

const emptyBodyError = new Error('Empty Body');
emptyBodyError.status = 400;




module.exports = {
    nonExistentItemError,
    incompleteCategoryError,
    incompleteUserError,
    incompleteItemError,
    emptyBodyError,
};