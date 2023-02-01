/*
Javascript functions to handle the sqlite database provided by the cordova-sqlite-storage plugin
Exports function used by the application logic
https://github.com/storesafe/cordova-sqlite-storage
Important: the plugin does not allow persistent storage when using the browser as a platform
sadly the sqlite plugin does not use proper promises but classical callback functions, which makes this a mess
luckily all own functions wrap them in a promise, see https://www.freecodecamp.org/news/how-to-make-a-promise-out-of-a-callback-function-in-javascript-d8ec35d1f981/
When the database is ready to accept requests, a custom event feladbready is fired - applications must wait for this event
see: https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
*/

//imports nice utility functions from managescheme
import { createScheme } from "./managescheme.js";
import { populateData } from "./populatedb.js";

// variable "holding" the database
var db = null;
// do not queue operations on unopened database
var opened = false;
// database version our app intends to use
var intendedSchemeVersion = 0;
var intendedDataVersion = 0;

// Open and initialize database after deviceready event has fired
document.addEventListener('deviceready', initializeDatabase);

// dispatching event to indicate that fela database is ready to use
function dispatchReadyEvent() {
    const event = new Event(
        "feladbready", 
        {
            detail: {
                time: new Date()
            },
            bubbles: true,
            cancelable: true
        });
    document.dispatchEvent(event);
}

/* reads the scheme version from the database
tx can be a readTransaction*/
async function readSchemeVersion(tx) {
    
    return new Promise(function(resolve, reject) {

        tx.executeSql('SELECT version FROM Versioning WHERE type = "scheme"', [], function(tx, rs) {
            resolve(rs.rows.item(0).version);         
        }, function(tx, error) {
            reject("Error: Failed opening version table" + JSON.stringify(error));
        });
    });
}

/* reads the data version from the database
tx can be a readTransaction*/
async function readDataVersion(tx) {
    
    return new Promise(function(resolve, reject) {

        tx.executeSql('SELECT version FROM Versioning WHERE type = "data"', [], function(tx, rs) {
            resolve(rs.rows.item(0).version);         
        }, function(tx, error) {
            reject("Error: Failed opening version table" + JSON.stringify(error));
        });
    });
}

/* determines wheter database is empty
tx can be a readTransaction
call with callback(result) where result is true when database is empty*/
async function isDatabaseEmpty(tx) {
    
    return new Promise(function(resolve, reject) {

        tx.executeSql('SELECT count(*) AS tableCount FROM sqlite_master WHERE type = "table"', [], function(tx, rs) {
            // evaluates to true if database is empty
            resolve(rs.rows.item(0).tableCount == 0);
        }, function(tx, error) {
            reject("Error: Error reading sqlite_master table " + JSON.stringify(error));
        });
    });
}

/* returns all categories in database
categories are returned in an array as an object consisting of id, name and ranking*/
export async function getCategories() {

    return new Promise(function(resolve, reject) {
        
        db.readTransaction(function(tx) {
            tx.executeSql('SELECT category_id, name, ranking FROM Categories', [], function(tx, rs) {
                let result = [];
                for (let i = 0; i < rs.rows.length; i++) {
                    result.push(rs.rows.item(i));
                    resolve(result);
                }
            }, function(tx, error) {
                reject("Error: Error reading categories from database " + JSON.stringify(error));
            })
        });
    })
}

// Initialize dabase, has to be called only after deviceready event has been registered!
async function initializeDatabase() {

    // Manages database scheme - right now only creates schema if there is none
    async function manageDatabaseScheme() {
        
        return new Promise(function(resolve, reject) {
            
            console.log("Managing database scheme");

            // transaction to check for tables in database using sqlite_master internal table - may not work, but works in browser!
            db.readTransaction(async function(tx) {

                    if (await isDatabaseEmpty(tx)) {
                        console.log("Database is empty! - creating database scheme version " + intendedSchemeVersion + " from scratch");
                        createScheme(db, intendedSchemeVersion, -1).then(
                            function(msg) {
                                console.log(msg);
                                resolve("Done managing scheme version");
                            }, function(error) {
                                reject(error);
                            }
                        );
                    }
                    else {
                        console.log("Intended scheme version is " + intendedSchemeVersion);
                        // transaction to read scheme version from Versioning table which hopefully exists
                        db.readTransaction(async function(tx) {
                            let fromversion = await readSchemeVersion(tx);
                            if (fromversion == intendedSchemeVersion) {
                                resolve("Current scheme version " + fromversion + " is intended version. Nothing to do!");
                            }
                            else {
                                reject("Error: Current and intented scheme version do not match :( - only fix for now is to delete all application data");
                            }
                        });
                    }
            }, function(error) {
                reject(error);
            });
        });
        
    }

    // Populates Database if its empty
    async function populateDatabase() {
        
        return new Promise(function(resolve, reject) {
            
            console.log("Populating database with data version " + intendedDataVersion);

            // transaction to check current database version
            db.readTransaction(async function(tx) {
                let fromversion = await readDataVersion(tx);
                if (fromversion > intendedDataVersion) {
                    reject("Error: current data version " + fromversion + " is higher than intended data version");
                }
                else if (fromversion == intendedDataVersion) {
                    resolve("Current data version " + fromversion + " is intended version. Nothing to do!");
                }
                else {
                    populateData(db, intendedDataVersion, fromversion).then(
                        function(msg) {
                            console.log(msg);
                            resolve("Done populating database");
                        }, function(error) {
                            reject(error);
                        }
                    );
                }
            });
        });
    }

    // opens and initializes database with a nice try and catch block
    try {
        db = window.sqlitePlugin.openDatabase({
            name:'fela.db',
            location:'default',
        }, async function(db) {
            opened = true;
            manageDatabaseScheme().then(
                function(msg) {
                    console.log(msg);
                    populateDatabase().then(
                        async function(msg) {
                            console.log(msg);
                            dispatchReadyEvent();
                            console.log(await getCategories());
                        }, function(error) {
                            throw error;
                        }
                    );
                }, function(error) {
                    throw error;
                }
            );
        },
        function(err) {
            throw "Open database Error: " + JSON.stringify(err);
        });
    } catch (error) {
        console.log(JSON.stringify(error));
        //TODO indicate to user that program is useless piece of shit - maybe with own event?
    }
}