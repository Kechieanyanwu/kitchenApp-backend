const bcrypt = require("bcrypt");
const saltRounds = 10;


async function comparePassword(plaintextPassword, hashedPassword) {
    let result
    try {
        result = await bcrypt.compare(plaintextPassword, hashedPassword)
    } catch (err) {
        throw err;
    }
    return result 
}

// TODO
async function hashPassword(plaintextPassword) {
    console.log("in hash pwd"); //test
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plaintextPassword, salt);

    return {hash, salt}; 
}

module.exports = {
    comparePassword,
    hashPassword,
}