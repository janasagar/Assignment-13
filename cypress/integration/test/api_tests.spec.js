///<reference types="cypress"/>

const neatCsv = require("neat-csv");//import neat-csv

describe('Simple-books API-testsuite', () => {
    const burl = "https://simple-books-api.glitch.me";
    const randomEmail = Math.random().toString(5).substring(2);
    let token;
    let orderId;
    let adata;
    let odata;
    before("data",() => {
        cy.fixture("clients.csv")
            .then(neatCsv)
            .then((response)=>{
                adata = response;

            });
        
        cy.fixture("orders.csv")
            .then(neatCsv)
            .then((response)=>{
                odata = response;
            })      
    });

    // Make an API request for authentication
    it('Auth', () => {
        adata.forEach((element) => {
            cy.request({
                method: "POST",
                url: burl + "/api-clients/",
                headers: {
                    accept: "application/jeson"
                },
                body: {
                    clientName: element.clientName,
                    clientEmail: randomEmail + element.clientEmail
                    
                }
            }).then((response) => {
                expect(response.status).to.equal(201);
                const res = response.body;
                token = res.accessToken;// store the accesstoken for future request
                cy.log(token);
            });
            
        });
        
    });
    // Make an API request to list all books
    it('List Books', () => {
        cy.request({
            method: "GET",
            url: burl + "/books",
            headers: {
                accept: "application/json"
            }
        }).then((response)=>{
            expect(response.status).to.equal(200);
            cy.log(JSON.stringify(response.body));
        })
        
    });

    // Make an API request to Fetch Specific Book Details
    it('Fetch Specific Book Details', () => {
        let bookid = 1;
        cy.request({
            method: "GET",
            url: burl + "/books/" + bookid,
            headers: {
                accept: "application/json"
            }
        }).then((response)=>{
            expect(response.status).to.equal(200);
            const res = response.body;
            let id = res.id
            expect(id).to.equal(bookid);
            cy.log(JSON.stringify(response.body));
        })

        
    });
    // Make an API request to Submit an order
    it('Submit an order', () => {
        odata.forEach(element => {
            cy.request({
                method: "POST",
                url: burl + "/orders",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: {
                    bookId: element.bookId,
                    customerName: element.customerName
                }
            }).then((response) => {
                expect(response.status).to.equal(201);
                const res = response.body;
                let status = res.created;
                expect(status).to.equal(true);
                cy.log(JSON.stringify(response.body));
            });
            
        });
        
        
    });
    // Make an API request to Get all orders
    it('Get all orders', () => {
        cy.request({
            method: "GET",
            url: burl + "/orders",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            },
        }).then((response) => {
            expect(response.status).to.equal(200);
            cy.log(JSON.stringify(response.body));

            
            const res = response.body;
            if (res.length > 0) {
                orderId = res[0].id; 
                cy.log(`Fetched order ID: ${orderId}`);
            } else {
                throw new Error('No orders found');
            }
        });
        
    });
    // Make an API request to Get an order
    it('Get an order', () => {
        cy.request({
            method: "GET",
            url: burl + "/orders/" + orderId,
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            const res = response.body;
            let id = res.id;
            expect(id).to.equal(orderId);
            cy.log(JSON.stringify(response.body));
        });
        
    });
    // Make an API request to Update an order
    it('Update an order', () => {
        cy.request({
            method: "PATCH",
            url: burl + "/orders/" + orderId,
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            },
            body: {
                customerName: "Jana"
            }
        }).then((response) => {
            expect(response.status).to.equal(204);
            cy.request({
                method: "GET",
                url: burl + "/orders/" + orderId,
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`
                }
            }).then((response) => {
                expect(response.status).to.equal(200);
                const res = response.body;
                let customerName = res.customerName;
                expect(customerName).to.equal("Jana");
                cy.log("Order is updated")
                cy.log(JSON.stringify(response.body));
            });
            
        });  
    });
    // Make an API request Delete an order
    it('Delete an order', () => {
        cy.request({
            method: "DELETE",
            url: burl + "/orders/" + orderId,
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            },
        }).then((response) => {
            expect(response.status).to.equal(204);
            cy.request({
                method: "GET",
                url: burl + "/orders/" + orderId,
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(404);
                cy.log("Order is successfully deleted")
                
            });
            
        });
    });
    
});