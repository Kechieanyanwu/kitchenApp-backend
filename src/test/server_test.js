// to go through tests and check for presence of user_id

// Test framework Imports
const chai = require('chai');
const chaiHttp = require("chai-http"); //included
const assert = chai.assert;
const { server } = require("../server"); 


// Model Imports 
const { categoriesSchema,
        checklistSchema,
        inventorySchema } = require('../models/model');

// Controller Imports
const { getAllItems } = require('../controllers/controller');

const { incompleteUserError,
    nonExistentItemError,
    incompleteItemError,
    incompleteCategoryError } = require("../../utilities/errors");

// Sequelize Imports
const { Inventory } = require('../../database/models/inventory');

// Usage binding
chai.use(require('chai-json-schema-ajv')); //for validating JSON schema
chai.use(require('chai-as-promised')); //extends chai to handle promises 
chai.use(chaiHttp); //for handling http responses


// Beginning of tests
describe("KitchenApp testing", function () {
    console.log("creating an agent"); //test
    let agent = chai.request.agent(server);

    after(() => {
        agent.close();
    });
 
    describe("Endpoint testing", () => {
        describe("Login testing", () => {
            it("attaches an authenticated userID to the session", async () => {
                // // setup
                // const userDetails = {
                //     email: "seeddummyemail@pivotech.io",
                //     password: "johnnytest"
                // }

                // const userID = 1;
                // // const userIDCookie = {userID: 1};
                
                // //login
                // const response = await agent.post("/user/login").send(userDetails);

                // //assert that it includes a cookie with the userID
                // console.log(response.body); //test
                
                // // assert.deepNestedInclude(response.body, userIDCookie)
                // assert.equal(response.session, userID)
                // assert.equal(response.status, 200)
            })
        })

        describe("GET Endpoint testing", () => { 
            const endpoints = [
                {
                    name: "Categories",
                    path: "/categories",
                    schema: categoriesSchema,
                },
                {
                    name: "Checklist",
                    path: "/checklist",
                    schema: checklistSchema,
                },
                {
                    name: "Inventory",
                    path: "/inventory",
                    schema: inventorySchema,
                },
            ];
        
            for (const endpoint of endpoints) {
                describe(`${endpoint.name}`, () => {
                    it("sends a 200 code on a good request" , async () => {
                        const response = await agent.get(endpoint.path); 
                        console.log(response.body);//test
                        console.log(endpoint.name); //test
                        assert.jsonSchema(response.body, endpoint.schema);
                        assert.equal(response.status, 200);
                    
                    });
                });
            }
        })

        describe("GET item endpoint testing", () => {
            const endpoints = [
                {
                name: "Categories",
                route: "/categories/",
                testCases: [
                    {
                        requestType: "Good",
                        description: "responds with 200 and the correct item to a valid request",
                        itemID: 3,
                        expectedResponse: { id: 3, category_name: "Cleaning", user_id: 1 },
                        expectedStatus: 200,
                    },
                    {
                        requestType: "Bad",
                        description: "returns a 400 error for a nonexistent item",
                        itemID: 10,
                        expectedStatus: 400,
                        expectedError: nonExistentItemError,
                    }
                    ]
                },
                {
                name: "Inventory",
                route: "/inventory/",
                testCases: [
                    {
                        requestType: "Good",
                        description: "responds with 200 and the correct item to a valid request",
                        itemID: 3,
                        expectedResponse: { id: 3, item_name: "Dettol Wipes", quantity: 3, category_id: 3, user_id: 1 },
                        expectedStatus: 200,
                    },
                    {
                        requestType: "Bad",
                        description: "returns a 400 error for a nonexistent item",
                        itemID: 10,
                        expectedStatus: 400,
                        expectedError: nonExistentItemError,
                    }
                    ]
                },
                {
                name: "Checklist",
                route: "/checklist/",
                testCases: [
                    {
                        requestType: "Good",
                        description: "responds with 200 and the correct item to a valid request",
                        itemID: 3,
                        expectedResponse: { id: 3, item_name: "Dishwashing tabs", quantity: 10, purchased: false, category_id: 3, user_id: 1 },
                        expectedStatus: 200,
                    },
                    {
                        requestType: "Bad",
                        description: "returns a 400 error for a nonexistent item",
                        itemID: 10,
                        expectedStatus: 400,
                        expectedError: nonExistentItemError,
                    }
                    ]
                }
            ]
            endpoints.forEach((endpoint) => {
                describe(`${endpoint.name}`, () => {
                    endpoint.testCases.forEach((testCase) => {
                        const { description, itemID, expectedStatus, expectedResponse, expectedError, requestType } = testCase
                        it(description, async() => { //could probably refactor this so we have two separate table-driven tests for A and B. Possibly later 
                            const response = await agent.get(endpoint.route + itemID); 
                            
                            //asserts status code is correct
                            assert.equal(response.status, expectedStatus);
                            
                            //assertion for a good request
                            if(requestType == "Good") {
                                assert.deepEqual(response.body, expectedResponse);
                            }
                            //assertion for a bad request from a nonexistent item
                            if (requestType == "Bad") {
                                assert.deepEqual(response.error.text, expectedError.message);
                            } 
                        })
                    })
                })
            })
        })
        
        describe("POST endpoint testing", () => {
            const endpoints = [
                {
                name: "Categories",
                route: "/categories",
                testCases: [ //test if I can take out user_id
                    {
                        requestType: "Good",
                        description: "responds with 201 to a valid request body",
                        requestBody: { "category_name": "Post Category Test", "user_id": 1 },
                        expectedStatus: 201,
                        expectedResponse: {"id": 6, "category_name": "Post Category Test", "user_id": 1,}
                    },
                    {
                        requestType: "Bad",
                        description: "rejects an empty request body",
                        requestBody: undefined,
                        expectedStatus: 400,
                        expectedError: "Empty Body"
                    }, 
                    {
                        requestType: "Bad",
                        description: "rejects a request body with an incorrect schema",
                        requestBody: { "inventory": "Dairy" },
                        expectedStatus: 400,
                        expectedError: incompleteCategoryError.message
                    }
                    ]
                },
                {
                    name: "Checklist",
                    route: "/checklist",
                    testCases: [
                    {
                        requestType: "Good",
                        description: "responds with 201 to a valid request body",  
                        requestBody: {
                            "item_name": "Post Checklist Test",
                            "quantity": 2,
                            "category_id": 3,
                            "user_id": 1,
                        },
                        expectedStatus: 201,
                        expectedResponse: {
                            "id": 6,
                            "item_name": "Post Checklist Test",
                            "quantity": 2,
                            "category_id": 3,
                            "purchased": false,
                            "user_id": 1,
                        },
                    },
                    {
                        requestType: "Bad", //uh-oh, is this code smell? Let's finish and get back to it
                        description: "rejects an empty request body",  
                        requestBody: undefined,
                        expectedStatus: 400,
                        expectedError: "Empty Body"
                    }, 
                    {
                        requestType: "Bad",
                        description: "rejects a request body with an incorrect schema",
                        requestBody: { "inventory": "Dairy" },
                        expectedStatus: 400,
                        expectedError: incompleteItemError.message
                    },
                    ]
                },
                {
                    name: "Inventory",
                    route: "/inventory",
                    testCases: [
                    {
                        requestType: "Good",
                        description: "responds with 201 to a valid request body",  
                        requestBody: {
                            "item_name": "Post Inventory Test",
                            "quantity": 20,
                            "category_id": 3,
                            "user_id": 1,
                        },
                        expectedStatus: 201,
                        expectedResponse: {
                            "id": 6,
                            "item_name": "Post Inventory Test",
                            "quantity": 20,
                            "category_id": 3,
                            "user_id": 1,
                        },
                    },
                    {
                        requestType: "Bad",
                        description: "rejects an empty request body",  
                        requestBody: undefined,
                        expectedStatus: 400,
                        expectedError: "Empty Body"
                    }, 
                    {
                        requestType: "Bad",
                        description: "rejects a request body with an incorrect schema",
                        requestBody: { "inventory": "Dairy" },
                        expectedStatus: 400,
                        expectedError: incompleteItemError.message
                    },
                    ]
                },
                // working here to update to User
                {
                    name: "User",
                    route: "/user/register",
                    testCases: [
                    {
                        requestType: "Good",
                        description: "responds with 201 to a valid request body",  
                        requestBody: {
                            email: "serverTest@gmail.com",
                            username: "Server Test",
                            password: "johnnytest"
                        },
                        expectedStatus: 201,
                        expectedResponse: {
                            id: 2,
                            email: "serverTest@gmail.com",
                            username: "Server Test",
                        },
                    },
                    {
                        requestType: "Bad", //uh-oh, is this code smell? Let's finish and get back to it
                        description: "rejects an empty request body",  
                        requestBody: undefined,
                        expectedStatus: 400,
                        expectedError: "Empty Body"
                    }, 
                    {
                        requestType: "Bad", //to update
                        description: "rejects a request body with an incorrect schema",
                        requestBody: { "email": "Dairy" },
                        expectedStatus: 400,
                        expectedError: incompleteUserError.message
                    },
                    ]
                }
            ];
            
            endpoints.forEach((endpoint) => {
                describe(`${endpoint.name}`, () => {
                    endpoint.testCases.forEach((testCase) => {
                        const { description, requestBody, expectedStatus, expectedResponse, requestType, expectedError } = testCase
                        it(description, async() => {
                            const response = await agent.post(endpoint.route).send(requestBody); 

                            assert.equal(response.status, expectedStatus);

                            if (requestType == "Good") {
                                assert.deepEqual(response.body, expectedResponse);
                            }

                            if (requestType == "Bad") {
                                assert.deepEqual(response.error.text, expectedError);
                            }
        
                        })
                    })
                })
            })
            });

        describe("Update Item endpoint testing", () => { // to refactor into table-driven test
            describe("Category", ()=> {
                it("correctly returns an updated category", async () => {
                    //update item 1
                    const requestBody = { category_name: "Update Category Test" };
                    const itemID = 1;

                    const expectedResponse = { id: 1, category_name: "Update Category Test", "user_id": 1 };
                    const expectedStatus = 200;

                    //make update
                    const response = await agent.put("/categories/" + itemID).send(requestBody); 

                    //assert that the expectedResponse went through
                    assert.equal(response.status, expectedStatus)
                    assert.deepEqual(response.body, expectedResponse);
                })
                it("returns an error for a nonexistent category", async () => {
                    //update item 11
                    const requestBody = { category_name: "Update Category Endpoint" };
                    const itemID = 11;

                    const expectedError = nonExistentItemError
                    const expectedStatus = 400;

                    //make update
                    const response = await agent.put("/categories/" + itemID).send(requestBody); 

                    //assert that the request failed with the right error and status code
                    assert.equal(response.status, expectedStatus)
                    assert.deepEqual(response.error.text, expectedError.message);
                })

            })
            describe("Inventory", () => {
                it("correctly returns an updated inventory item", async () => {
                    //update item 1
                    const requestBody = {
                        "item_name": "Update Inventory Item Test",
                        "quantity": 25,
                        "category_id": 2,
                    };
                    const itemID = 1;

                    const expectedResponse = {
                        "id": 1,
                        "item_name": "Update Inventory Item Test",
                        "quantity": 25,
                        "category_id": 2,
                        "user_id": 1
                    };
                    const expectedStatus = 200;

                    //make update
                    const response = await agent.put("/inventory/" + itemID).send(requestBody);

                    //assert that the expectedResponse went through
                    assert.equal(response.status, expectedStatus)
                    assert.deepEqual(response.body, expectedResponse);
                })
                it("returns an error for a nonexistent item", async () => {
                    //update item 11
                    const requestBody = {
                        "item_name": "Update Inventory Item Test",
                        "quantity": 25,
                        "category_id": 2,
                    };
                    const itemID = 11;

                    const expectedError = nonExistentItemError
                    const expectedStatus = 400;

                    //make update
                    const response = await agent.put("/inventory/" + itemID).send(requestBody)

                    //assert that the request failed with the right error and status code
                    assert.equal(response.status, expectedStatus)
                    assert.deepEqual(response.error.text, expectedError.message);
                })
            })
            describe("Checklist", () => {
                it("Correctly returns an updated unpurchased checklist item", async () => {
                    //update item 1
                    const requestBody = {
                        "item_name": "Update Checklist Item Test",
                        "quantity": 13,
                        "category_id": 1,
                    };
                    const itemID = 1;

                    const expectedResponse = {
                        "id": 1,
                        "item_name": "Update Checklist Item Test",
                        "quantity": 13,
                        "category_id": 1,
                        "purchased": false,
                        "user_id": 1
                    };
                    const expectedStatus = 200;

                    //make update
                    const response = await agent.put("/checklist/" + itemID).send(requestBody)

                    //assert that the expectedResponse went through
                    assert.equal(response.status, expectedStatus)
                    assert.deepEqual(response.body, expectedResponse);
                })
                it("returns an error for a nonexistent item", async () => {
                    //update item 11
                    const requestBody = {
                        "item_name": "Update Checklist Item Test",
                        "quantity": 13,
                        "category_id": 1,
                    };
                    const itemID = 11;

                    const expectedError = nonExistentItemError
                    const expectedStatus = 400;

                    //make update
                    const response = await agent.put("/checklist/" + itemID).send(requestBody)

                    //assert that the request failed with the right error and status code
                    assert.equal(response.status, expectedStatus)
                    assert.deepEqual(response.error.text, expectedError.message);
                })
                it("correctly moves a purchased item to the inventory", async () => { //might end up with another implementation of this based on the front end
                    //update item and set purchased to true
                    const requestBody = {
                        "item_name": "Update Checklist Item Test",
                        "quantity": 13,
                        "category_id": 1,
                        "purchased": true
                    };
                    const itemID = 1;
                    const assertDeletedItem = {
                        "id": 1,
                        "item_name": "Update Checklist Item Test",
                        "quantity": 13,
                        "category_id": 1,
                        "purchased": false
                    };

                    const assertIncludedItem = {
                        "id": 7,
                        "item_name": "Update Checklist Item Test",
                        "quantity": 13,
                        "category_id": 1,
                        "user_id": 1
                    };

                    const expectedStatus = 200;

                    //make update
                    const response = await agent.put("/checklist/" + itemID).send(requestBody)

                    //assert that the item was added successfully and the response wasn't an updated item
                    assert.equal(response.status, expectedStatus)
                    
                    //asserting that the item is now in Inventory
                    const inventoryArray = await getAllItems(Inventory)

                    
                    //assert that the item is no longer in the checklist
                    assert.notDeepNestedInclude(response.body, assertDeletedItem);
                    //assert that the item is now in the inventory
                    assert.deepNestedInclude(inventoryArray, assertIncludedItem);
                 })
            })
        })
        describe("Delete Item Endpoint Testing", ()=> { // this can be refactored into a table driven test. 
            describe("Categories", () => {
                it("successfully deletes an existing item", async () => {
                    const itemID = 4;
                    const assertDeletedItem = {
                        "id": 4, //wip
                        "category_name": "Post Category Test"
                    };
                    const expectedStatus = 200;
    
                    const response = await agent.delete("/categories/" + itemID);
    
                    assert.equal(response.status, expectedStatus);
    
                    //assert that the item has been deleted from the returned array
                    assert.notDeepNestedInclude(response, assertDeletedItem); //double check this
                })
            })

            describe("Checklist", () => {
                it("successfully deletes an existing item", async () => {
                    const itemID = 4;
                    const assertDeletedItem = {
                        "id": 4,
                        "item_name": "Post Checklist Test",
                        "quantity": 2,
                        "category_id": 3,
                        "purchased": false
                    };
                    
                    const expectedStatus = 200;
    
                    const response = await agent.delete("/checklist/" + itemID);
    
                    assert.equal(response.status, expectedStatus);
    
                    assert.notDeepNestedInclude(response, assertDeletedItem);
                })
            })

            describe("Inventory", () => {
                it("successfully deletes an existing item", async () => {
                    const itemID = 1;
                    const assertDeletedItem = {
                        "id": 1,
                        "item_name": "Update Inventory Item Test",
                        "quantity": 25,
                        "category_id": 2
                    };
                    
                    const expectedStatus = 200;
    
                    const response = await agent.delete("/inventory/" + itemID);

                    assert.equal(response.status, expectedStatus);
    
                    assert.notDeepNestedInclude(response, assertDeletedItem);
                })
            })

            describe("User", () => {
                it("successfully deletes an existing item", async () => {
                    const itemID = 2;
                    const expectedStatus = 200;
    
                    const response = await agent.delete("/user/" + itemID);
    
                    assert.equal(response.status, expectedStatus);
                })
            })
        })

    })
})


