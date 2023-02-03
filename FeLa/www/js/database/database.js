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

// helper function to change db plugin results to array
function convertResultToArray(rs) {
    let result = [];
    for (let i = 0; i < rs.rows.length; i++) {
        result.push(rs.rows.item(i));
    }
    return result;
}

// helper function, returns current datetime in epoch (seconds)
function NowInEpoch() {
    return Math.floor(Date.now() / 1000);
}

// helper function to get Date object from epoch (seconds)
export function epochToDate(epoch) {
    return new Date(epoch * 1000);
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
categories are returned in an array as an object consisting of id, name and ranking - see managescheme comments*/
export async function getCategories() {

    return new Promise(function(resolve, reject) {
        
        db.readTransaction(function(tx) {
            tx.executeSql('SELECT category_id, name, ranking FROM Categories', [], function(tx, rs) {
                resolve(convertResultToArray(rs));
            }, function(tx, error) {
                reject("Error: Error reading categories from database " + JSON.stringify(error));
            })
        });
    })
}

/* creates a question */
function createQuestion(tx, round_id, compound_id) {

    tx.executeSql('INSERT INTO Questions (round_id, compound_id) VALUES (?, ?)', [round_id, compound_id], function(tx, rs) {
        console.log("Added question to round: " + round_id);
    }, function(tx, error) {
        throw error;
    })
}

/* generates Question Set to be used in a round
returns array of compound_ids
https://www.sqlitetutorial.net/sqlite-limit/
*/
function getQuestionSet(round_id, category_list, amount) {
    
    return new Promise(function(resolve, reject) {

        db.transaction(function(tx) {

            // generate query to select compound_ids according given categories, sorted by descending ranking first, then ascending difficulty 
            var select_query = 'SELECT ? as round_id, compound_id FROM (SELECT * FROM Compounds JOIN CCMapping USING (compound_id)';
            
            if (category_list.length > 0) {

                select_query = select_query + ' WHERE (category_id = ' + category_list[0];

                for (let i = 1; i < category_list.length; i++) {
                    select_query = select_query + ' OR category_id = ' + category_list[i];
                }
                select_query = select_query + ")";
            }

            select_query = select_query + ' GROUP BY compound_id ORDER BY RANDOM() LIMIT ?) ORDER BY ranking DESC, difficulty ASC';
            let insert_query = 'INSERT INTO Questions (round_id, compound_id) ' + select_query;
            
            tx.executeSql(insert_query, [round_id, amount], function(tx, rs) {
                tx.executeSql('SELECT compound_id, c.name, c.formula, c.split, c.ranking, c.difficulty FROM Questions as q JOIN Compounds as c USING (compound_id) WHERE round_id = ?', [round_id], function(tx, res) {
                    resolve(convertResultToArray(res));
                }, function(tx, error) {
                    reject(error);
                })
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })
}

/* writes results of a question in question table
type is either mc, free or d&d
result is 0 for false, 1 for true
difficulty can be calculated by app, needs to be integer
*/
export async function writeQuestionResults(question_id, type, result, difficulty) {

    return new Promise(function(resolve, reject) {

        db.transaction(function(tx) {
            tx.executeSql('UPDATE Questions SET type = ?, result = ?, difficulty = ?, timestamp = ? WHERE question_id = ?', [type, result, difficulty, NowInEpoch(), question_id], function(tx, rs) {}, function(tx, error) {
                throw error;
            })
        }, function(error) {
            reject(error);
        }, function() {
            resolve("Write Question Results transaction successful");
        })
    })
}

/* writes a new Round into database round table returns the id of the Round
*/
async function newRound(type) {

    return new Promise(function(resolve, reject) {

        db.transaction(function(tx) {
            let time = NowInEpoch();

            tx.executeSql('INSERT INTO Rounds (type, timestamp, ranking) VALUES (?, ?, ?)', [type , time, 0.0], function(tx, rs) {
                tx.executeSql('SELECT round_id FROM Rounds WHERE timestamp = ?', [time], function(tx, rs) {
                    resolve(rs.rows.item(0).round_id);
                });
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })
}

/* creates a new Round, writes everything to the database
returns nothing
type should  be learning or exam
categoryList should be an array containing one or more category ids or an empty array for all categories
amount should be the desired amount of questions
*/
export async function createRound(type, category_list, amount) {

    return new Promise(async function(resolve, reject) {

        // creates a new round in round table, returns id of round
        let round_id = await newRound(type);

        // creates a question set in the questions table, returns ready to use question set
        let question_set = await getQuestionSet(round_id, category_list, amount);
        console.log(question_set);
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
                            console.log(await createRound("test", [1,2], 10));
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