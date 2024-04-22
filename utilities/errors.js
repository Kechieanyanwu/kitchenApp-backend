const nonExistentItemError = new Error('Nonexistent item');
const incompleteItemError = new Error('Item must have an item name, quantity and category ID');
const incompleteCategoryError = new Error('Request must only contain a category name');
const incompleteUserError = new Error('A user must have an email, a username, and a password');
const emptyBodyError = new Error('Empty Body');




module.exports = {
    nonExistentItemError,
    incompleteCategoryError,
    incompleteUserError,
    incompleteItemError,
    emptyBodyError,
}