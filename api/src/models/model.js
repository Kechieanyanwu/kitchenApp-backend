
const categoriesSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            id: {type: "number"},
            category_name: {type: "string"},
            user_id: {type: "number"},
    },
    required: ["id", "category_name", "user_id"],
  },
};


const checklistSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            id: {type: "number"},
            item_name: {type: "string"},
            quantity: {type: "number"},
            category_id: {type: "number"},
            user_id: {type: "number"},
            purchased: {type: "boolean"},
        },
        required: ["id", "item_name", "quantity", "category_id", "purchased", "user_id"],
    }
}

const inventorySchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            id: { type: "number" },
            item_name: { type: "string" },
            quantity: { type: "integer" },
            category_id: { type: "integer" },
            user_id: {type: "number"},
        },
        required: ["id", "item_name", "quantity", "category_id", "user_id"],
    },
};

const userSchema = { //kinda like a DTO
    type: "array",
    items: {
        type: "object",
        properties: {
            id: { type: "number" },
            username: { type: "string" },
            email: { type: "string" },
            hashed_password: { type: "string" },
            salt: { type: "string" },
        },
        required: ["id", "username", "email", "hashed_password", "salt"],
    },
};

module.exports = {
    categoriesSchema,
    checklistSchema,
    inventorySchema,
    userSchema,
};