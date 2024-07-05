// to go through tests and check for presence of user_id

// Test framework Imports
const chai = require('chai');
const chaiHttp = require('chai-http'); //included
const assert = chai.assert;
const server  = require('../../index'); 


// Model Imports 
const { categoriesSchema,
    checklistSchema,
    inventorySchema, 
    countSchema } = require('../models/model');

// Controller Imports
const { getAllItems } = require('../controllers/controller');

const { incompleteUserError,
    nonExistentItemError,
    incompleteItemError,
    incompleteCategoryError } = require('../../../utilities/errors');

// Sequelize Imports
const { Inventory } = require('../../../database/models/inventory');

// Usage binding
chai.use(require('chai-json-schema-ajv')); //for validating JSON schema
chai.use(require('chai-as-promised')); //extends chai to handle promises 
chai.use(chaiHttp); //for handling http responses


// Beginning of tests
describe('KitchenApp testing', function () {
  
    describe('Endpoint testing', () => {
        describe('Unauthenticated Requests', async () => {
            let agent;
            before( async () => {
                agent = chai.request.agent(server); //using chai agent because I want all the requests to go in one session, not in several sessions
            });
            
            it('rejects a non-existent user', async () => {
                // setup
                const userDetails = {
                    email: 'nonexistent@pivotech.io',
                    password: 'nonexistent'
                };
                              
                //login
                const response = await agent.post('/login').send(userDetails);
                
                //assert that the response is 401
                console.log(response.text); //change to assertion on error message                                
                assert.equal(response.status, 401);
            });

            describe('GET Endpoint testing', () => { 
                const endpoints = [
                    {
                        name: 'Categories',
                        path: '/categories',
                        schema: categoriesSchema,
                    },
                    {
                        name: 'Checklist',
                        path: '/checklist',
                        schema: checklistSchema,
                    },
                    {
                        name: 'Inventory',
                        path: '/inventory',
                        schema: inventorySchema,
                    },
                ];
        
                for (const endpoint of endpoints) {
                    describe(`${endpoint.name}`, () => {
                        it('sends a 401 code on an unauthenticated request' , async () => {
                        
                            const response = await agent.get(endpoint.path); 
                            console.log(response.text);

                            assert.equal(response.status, 401);
                    
                        });
                    });
                }
            });

            describe('Add new User', () => {
                it('responds with 201 to a valid request body', async () => {
                    const newUser = {
                        email: 'serverTest@gmail.com',
                        username: 'Server Test',
                        password: 'johnnytest'
                    };
                    const expectedStatus = 201;
                    const expectedResponse = {
                        id: 2,
                        email: 'serverTest@gmail.com',
                        username: 'Server Test',
                    };
                    
                    const response = await agent.post('/user/register').send(newUser);

                    assert.equal(response.status, expectedStatus);
                    assert.deepEqual(response.body, expectedResponse);
                });

                it('rejects an empty request body', async () => {
                    const newUser = {};
                    const expectedStatus = 400;
                    const expectedError = 'Empty Body';
                    
                    const response = await agent.post('/user/register').send(newUser);
                    
                    assert.equal(response.status, expectedStatus);
                    assert.include(response.error.text, expectedError, 'object contains error');
                });
                
                it('rejects a request body with an incorrect schema', async () => {
                    const newUser = { 'email': 'Dairy' };
                    const expectedStatus = 400;
                    
                    const response = await agent.post('/user/register').send(newUser);
                 
                    assert.equal(response.status, expectedStatus);
                });
            });

            after( async () => {
                agent.close();
            });
        });

        describe('Authenticated Requests', () => {
            
            let agent;
            let auth_token;
            
            before( async () => {
                agent = chai.request.agent(server); //using chai agent because I want all the requests to go in one session, not in several sessions
            });

            after( async () => {
                agent.close();
            });
            
            describe('Login flow', () => {
                it('Logs in a user and sets an authentication cookie', async () => {
                    // setup
                    const userDetails = {
                        email: 'seeddummyemail@pivotech.io',
                        password: 'johnnytest'
                    };
                  
                    //login
                    const response = await agent.post('/login').send(userDetails);
    
                    //assert that response headers sets an authentication cookie 
                    chai.expect(response.headers['set-cookie']).to.be.an('array');
                    chai.expect(response.headers['set-cookie'][0]).to.include('auth_token=');
                    
                    // set authentication 
                    const cookie = response.headers['set-cookie'][0];
                    const matches = cookie.match(/auth_token=(Bearer%20[^\;]+)/);
                    const authTokenEncoded = matches ? matches[1] : null;
                    auth_token = decodeURIComponent(authTokenEncoded);
            
    
                    assert.equal(response.status, 200);
                });
            });

            describe('Endpoint Flow', () => {
                describe('GET Endpoint testing', () => { 
                    const endpoints = [
                        {
                            name: 'Categories',
                            path: '/categories',
                            schema: categoriesSchema,
                        },
                        {
                            name: 'Checklist',
                            path: '/checklist',
                            schema: checklistSchema,
                        },
                        {
                            name: 'Inventory',
                            path: '/inventory',
                            schema: inventorySchema,
                        },
                        { //just added
                            name: 'Checklist Count',
                            path: '/checklist/count',
                            schema: countSchema,
                        },
                        { //just added
                            name: 'Inventory Count',
                            path: '/inventory/count',
                            schema: countSchema,
                        },
                    ];
            
                    for (const endpoint of endpoints) {
                        describe(`${endpoint.name}`, () => {
                            it('sends a 200 code on a good request' , async () => {
                            
                                const response = await agent.get(endpoint.path).set('Authorization', auth_token); 

                                assert.jsonSchema(response.body, endpoint.schema);
                                assert.equal(response.status, 200);
                        
                            });
                        });
                    }
                });
            
                describe('POST endpoint testing', () => {
                    const endpoints = [
                        {
                            name: 'Categories',
                            route: '/categories',
                            testCases: [
                                {
                                    requestType: 'Good',
                                    description: 'responds with 201 to a valid request body',
                                    requestBody: { 'category_name': 'Post Category Test' },
                                    expectedStatus: 201,
                                    expectedResponse: { 'id': 6, 'category_name': 'Post Category Test', 'user_id': 1 }
                                },
                                {
                                    requestType: 'Bad',
                                    description: 'rejects an empty request body',
                                    requestBody: undefined,
                                    expectedStatus: 400,
                                    expectedError: 'Empty Body'
                                }, 
                                {
                                    requestType: 'Bad',
                                    description: 'rejects a request body with an incorrect schema',
                                    requestBody: { 'inventory': 'Dairy' },
                                    expectedStatus: 400,
                                    expectedError: 'There must be a field, Category name, which must be a string'
                                }
                            ]
                        },
                        {
                            name: 'Checklist',
                            route: '/checklist',
                            testCases: [
                                {
                                    requestType: 'Good',
                                    description: 'responds with 201 to a valid request body',  
                                    requestBody: {
                                        'item_name': 'Post Checklist Test',
                                        'quantity': 2,
                                        'category_id': 3,
                                    },
                                    expectedStatus: 201,
                                    expectedResponse: {
                                        'id': 6,
                                        'item_name': 'Post Checklist Test',
                                        'quantity': 2,
                                        'category_id': 3,
                                        'purchased': false,
                                        'user_id': 1,
                                    },
                                },
                                {
                                    requestType: 'Bad', 
                                    description: 'rejects an empty request body',  
                                    requestBody: undefined,
                                    expectedStatus: 400,
                                    expectedError: 'Empty Body'
                                }, 
                                {
                                    requestType: 'Bad',
                                    description: 'rejects a request body with an incorrect schema',
                                    requestBody: { 'inventory': 'Dairy' },
                                    expectedStatus: 400,
                                    expectedError: incompleteItemError.message
                                },
                            ]
                        },
                        {
                            name: 'Inventory',
                            route: '/inventory',
                            testCases: [
                                {
                                    requestType: 'Good',
                                    description: 'responds with 201 to a valid request body',  
                                    requestBody: {
                                        'item_name': 'Post Inventory Test',
                                        'quantity': 20,
                                        'category_id': 3,
                                    },
                                    expectedStatus: 201,
                                    expectedResponse: {
                                        'id': 6,
                                        'item_name': 'Post Inventory Test',
                                        'quantity': 20,
                                        'category_id': 3,
                                        'user_id': 1,
                                    },
                                },
                                {
                                    requestType: 'Bad',
                                    description: 'rejects an empty request body',  
                                    requestBody: undefined,
                                    expectedStatus: 400,
                                    expectedError: 'Empty Body'
                                }, 
                                {
                                    requestType: 'Bad',
                                    description: 'rejects a request body with an incorrect schema',
                                    requestBody: { 'inventory': 'Dairy' },
                                    expectedStatus: 400,
                                    expectedError: incompleteItemError.message
                                },
                            ]
                        },
                        {
                            name: 'Users',
                            route: '/user/register',
                            testCases: [
                                {
                                    requestType: 'New User',
                                    description: 'responds with 201 to a valid request body',  
                                    requestBody: {
                                        'username': 'newUserTest',
                                        'email': 'newUser@gmail.com',
                                        'password': 'newUserPassword',
                                    },
                                    expectedStatus: 201,
                                    expectedResponse: {
                                        'username': 'newUserTest',
                                        'email': 'newUser@gmail.com',
                                        
                                    },
                                }
                            ]
                        }
                    ];
                
                    endpoints.forEach((endpoint) => {
                        describe(`${endpoint.name}`, () => {
                            endpoint.testCases.forEach((testCase) => {
                                const { description, requestBody, expectedStatus, expectedResponse, requestType, expectedError } = testCase;
                                it(description, async() => {
                                    const response = await agent.post(endpoint.route).set('Authorization', auth_token).send(requestBody); 
                                    assert.equal(response.status, expectedStatus);
    
                                    if (requestType == 'Good') {
                                        assert.deepEqual(response.body, expectedResponse);
                                    } else if (requestType == 'Bad') {
                                        assert.include(response.error.text, expectedError, 'object contains error');
                                    } else if (requestType == 'New User') {
                                        console.log(response.body);
                                        assert.include(response.body, expectedResponse);
                                    }
                                    
                                });
                            });
                        });
                    });
                });

                describe('Update Item endpoint testing', () => { 
                    const endpoints = [
                        {
                            name: 'Category',
                            route: '/categories',
                            testCases: [
                                {
                                    requestType: 'Good',
                                    description: 'correctly returns an updated category',
                                    requestBody: { category_name: 'Update Category Test' },
                                    itemID: 1,
                                    expectedResponse: { id: 1, category_name: 'Update Category Test', 'user_id': 1 },
                                    expectedStatus: 200,
                                },
                                {
                                    requestType: 'Bad',
                                    description: 'returns an error for a nonexistent category',
                                    requestBody: { category_name: 'Update Category Test' },
                                    itemID: 11,
                                    expectedError: nonExistentItemError,
                                    expectedStatus: 400,
                                },
                            ] 
                        },
                        {
                            name: 'Inventory',
                            route: '/inventory',
                            testCases: [
                                {
                                    requestType: 'Good',
                                    description: 'correctly returns an updated inventory item',
                                    requestBody: {
                                        'item_name': 'Update Inventory Item Test',
                                        'quantity': 25,
                                        'category_id': 2,
                                    },
                                    itemID: 1,
                                    expectedResponse: {
                                        'id': 1,
                                        'item_name': 'Update Inventory Item Test',
                                        'quantity': 25,
                                        'category_id': 2,
                                        'user_id': 1
                                    },
                                    expectedStatus: 200,
                                },
                                {
                                    requestType: 'Bad',
                                    description: 'returns an error for a nonexistent item',
                                    requestBody: {
                                        'item_name': 'Update Inventory Item Test',
                                        'quantity': 25,
                                        'category_id': 2,
                                    },
                                    itemID: 11,
                                    expectedError: nonExistentItemError,
                                    expectedStatus: 400,
                                },
                            ] 
                        },
                        {
                            name: 'Checklist',
                            route: '/checklist',
                            testCases: [
                                {
                                    requestType: 'Good',
                                    description: 'Correctly returns an updated unpurchased checklist item',
                                    requestBody: {
                                        'item_name': 'Update Checklist Item Test',
                                        'quantity': 13,
                                        'category_id': 1,
                                    },
                                    itemID: 1,
                                    expectedResponse: {
                                        'id': 1,
                                        'item_name': 'Update Checklist Item Test',
                                        'quantity': 13,
                                        'category_id': 1,
                                        'purchased': false,
                                        'user_id': 1
                                    },
                                    expectedStatus: 200,
                                },
                                {
                                    requestType: 'Bad',
                                    description: 'returns an error for a nonexistent item',
                                    requestBody: {
                                        'item_name': 'Update Checklist Item Test',
                                        'quantity': 13,
                                        'category_id': 1,
                                    },
                                    itemID: 11,
                                    expectedError: nonExistentItemError,
                                    expectedStatus: 400,
                                },
                                {
                                    requestType: 'Purchased Checklist Item',
                                    description: 'correctly moves a purchased item to the inventory',
                                    requestBody: {
                                        'item_name': 'Update Checklist Item Test',
                                        'quantity': 13,
                                        'category_id': 1,
                                        'purchased': true
                                    },
                                    itemID: 1,
                                    deletedItem: {
                                        'id': 1,
                                        'item_name': 'Update Checklist Item Test',
                                        'quantity': 13,
                                        'category_id': 1,
                                        'purchased': false
                                    },
                                    includedItem: {
                                        'id': 7,
                                        'item_name': 'Update Checklist Item Test',
                                        'quantity': 13,
                                        'category_id': 1,
                                        'user_id': 1
                                    },
                                    expectedStatus: 200,
                                },
                            ] 
                        },

                    ];

                    endpoints.forEach((endpoint) => {
                        describe(`${endpoint.name}`, () => {
                            endpoint.testCases.forEach((testCase) => {
                                const { description, requestBody, expectedStatus, expectedResponse, itemID, requestType, expectedError, deletedItem, includedItem } = testCase;
                                it(description, async() => {
                                    const response = await agent.put(`${endpoint.route}/${itemID}`).set('Authorization', auth_token).send(requestBody); 
                                    assert.equal(response.status, expectedStatus);
    
                                    if (requestType == 'Good') {
                                        assert.deepEqual(response.body, expectedResponse);
                                    } else if (requestType == 'Bad') {
                                        assert.deepEqual(response.error.text, expectedError.message);
                                    } else if (requestType == 'Purchased Checklist Item') {
                                        //assert that the item is no longer in the checklist
                                        assert.notDeepNestedInclude(response.body, deletedItem);
                                        
                                        //assert that the item is now in the inventory
                                        const inventoryArray = await getAllItems(Inventory, 1);
                                        const plainInventoryArray = JSON.parse(JSON.stringify(inventoryArray));
                                        assert.deepNestedInclude(plainInventoryArray, includedItem);
                                    }
                                });
                            });
                        });
                    });
                });
                describe('Delete Item Endpoint Testing', () => {
                    const testCases = [
                        {
                            description: 'Categories - successfully deletes an existing item',
                            endpoint: '/categories',
                            itemID: 4,
                            assertDeletedItem: {
                                id: 4,
                                category_name: 'Post Category Test'
                            },
                            expectedStatus: 200
                        },
                        {
                            description: 'Checklist - successfully deletes an existing item',
                            endpoint: '/checklist',
                            itemID: 4,
                            assertDeletedItem: {
                                id: 4,
                                item_name: 'Post Checklist Test',
                                quantity: 2,
                                category_id: 3,
                                purchased: false
                            },
                            expectedStatus: 200
                        },
                        {
                            description: 'Inventory - successfully deletes an existing item',
                            endpoint: '/inventory',
                            itemID: 1,
                            assertDeletedItem: {
                                id: 1,
                                item_name: 'Update Inventory Item Test',
                                quantity: 25,
                                category_id: 2
                            },
                            expectedStatus: 200
                        }
                    ];
                  
                    testCases.forEach(({ description, endpoint, itemID, assertDeletedItem, expectedStatus }) => {
                        it(description, async () => {
                            const response = await agent.delete(`${endpoint}/${itemID}`).set('Authorization', auth_token);
                            assert.equal(response.status, expectedStatus);
                  
                            if (assertDeletedItem) {
                                assert.notDeepNestedInclude(response.body, assertDeletedItem);
                            }
                        });
                    });
                });
            });
           
        });

    });
});


