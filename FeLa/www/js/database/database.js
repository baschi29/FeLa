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


// ---- Event related stuff ----

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


// ---- Helping functions for database contents ----

// helper function to change db plugin results to array
function convertResultToArray(rs) {
    let result = [];
    for (let i = 0; i < rs.rows.length; i++) {
        result.push(rs.rows.item(i));
    }
    return result;
}

// helper function to construct sqlite condidition from given value list
// with custom prefix: AND/WHERE/OR, custom Operator and custom value field
function generateQueryCondition(prefix, logical_operator, value_field, value_list) {
    
    let condition = '';

    if (value_list.length > 0) {
        condition = ' ' + prefix;
        condition = condition + ' (' + value_field + ' = ' + value_list[0];

        for (let i = 1; i < value_list.length; i++) {
            condition = condition + ' ' + logical_operator + ' ' + value_field + ' = ' + value_list[i];
        }

        condition = condition + ")";
    }
    
    return condition;
}

// helper function, returns current datetime in epoch (seconds)
function NowInEpoch() {
    return Math.floor(Date.now() / 1000);
}

// helper function to get Date object from epoch (seconds)
export function epochToDate(epoch) {
    return new Date(epoch * 1000);
}

// helper function to split split information of name in multiple parts
export function splitName(namesplit) {

    const res = namesplit.split('#');
    return res;
}

/* helper function to split formula in multiple parts
fineness 0 splits H_2^3+ into H_2, ^3+ while 1 splits into all parts: H,_2,^3,+*/
export function splitFormula(formula, fineness) {

    var res;

    if (fineness == 1) {
        res = formula.match(/[A-Z][a-z]*|[()]|_\d+|\^\d+|[-\+]/g);
    }
    else if (fineness == 0) {
        res = formula.match(/[A-Z][a-z]*(_\d+)?|\^(\d+)?[-\+]/g);
    }
    
    return res;
}

// helper function to replace everything that is not an Element with %
function likeFormula2(formula) {

    const arr = formula.match(/[A-Z][a-z]+_?|[A-Z]+_?/g);
    var res = '(formula LIKE "%' + arr[0] + '%"';

    for (let i = 1; i < arr.length; i++) {
        res = res + ' OR formula LIKE "%' + arr[i] + '%"';
    }

    res = res + ')'
    return res
}

function likeFormula3(formula) {

    const arr = formula.match(/[A-Z][a-z]+_?|[A-Z]+_?|\^/g);
    var res = '%';

    for (let elem of arr) {
        res = res + elem + '%';
    }

    return res;
}

// --- functions to obtain information about status of database ----

/* reads the scheme version from the database
tx can be a readTransaction*/
async function readSchemeVersion(tx) {
    
    return new Promise(function(resolve, reject) {

        tx.executeSql('SELECT version \
            FROM Versioning \
            WHERE type = "scheme"', [], 
        function(tx, rs) {
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

        tx.executeSql('SELECT version \
            FROM Versioning \
            WHERE type = "data"', [], 
        function(tx, rs) {
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

        tx.executeSql('SELECT count(*) AS tableCount \
            FROM sqlite_master \
            WHERE type = "table"', [], 
        function(tx, rs) {
            // evaluates to true if database is empty
            resolve(rs.rows.item(0).tableCount == 0);
        }, function(tx, error) {
            reject("Error: Error reading sqlite_master table " + JSON.stringify(error));
        });
    });
}


// ---- Categories & Compounds----

/* returns all categories in database
categories are returned in an array as an object consisting of id, name and ranking - see managescheme comments*/
export async function getCategories() {

    return new Promise(function(resolve, reject) {
        
        db.readTransaction(function(tx) {
            tx.executeSql('SELECT category_id, name, ranking \
                FROM Categories', [], 
            function(tx, rs) {
                resolve(convertResultToArray(rs));
            }, function(tx, error) {
                reject("Error: Error reading categories from database " + JSON.stringify(error));
            })
        });
    })
}

// returns a compound entry of the compounds_table by compound_id
async function getCompound(compound_id) {

    return new Promise(function(resolve, reject) {
        db.readTransaction(function(tx) {
            tx.executeSql('SELECT * \
                FROM Compounds \
                WHERE compound_id = ?', [compound_id], 
            function(tx, rs) {
                resolve(convertResultToArray(rs));
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })
}

// returns all categories of compound as an array: usable as category_list!
async function getCategoriesOfCompound(compound_id) {

    return new Promise(function(resolve, reject) {

        db.readTransaction(function(tx) {
            
            tx.executeSql('SELECT category_id \
                FROM Compounds JOIN CCMapping USING (compound_id) \
                WHERE compound_id = ? \
                GROUP BY category_id', [compound_id], 
            function(tx, rs) {
                let result = [];
                for (let i = 0; i < rs.rows.length; i++) {
                    let item = rs.rows.item(i);
                    result.push(item.category_id);
                }
                resolve(result);
            }, function(tx, error) {
                reject(error);
            })
        })
    })
}

/* returns count random compounds that are not the given compound according to sameness
if not enough results are found, the remaining alternatives get selected from the sameness -1
multiple function calls may return identical alternative compounds - possible TODO for future? 
sameness 0 means random alternatives
sameness == 1 means alternatives from same category
sameness == 2 means alternatives which formular contains at least one of the same formula elements with _ from the same category
sameness == 3 means alternatives which formular contains all of the formula elements in their order with _ and ^
Important: May return nothing on sameness level 2 - app needs to check for that!
*/
export async function getAlternatives(root_id, sameness, count) {

    async function getAlternativesHelper(root_id, sameness, count, excluded_ids) {

        return new Promise(async function(resolve, reject) {

            if (sameness < 0) {
                console.log("Sameness < 0 -> resolving with empty array");
                console.log("This might occur, when there are not enough items in databse to fulfill alternatives count");
                resolve([]);
            }

            var query = 'SELECT DISTINCT compound_id, name, formula, split \
                FROM Compounds JOIN CCMapping USING (compound_id)';

            var query_condition =  ' WHERE compound_id != ?' + generateQueryCondition('AND NOT', 'OR', 'compound_id', excluded_ids);

            if (sameness == 1) {
                query_condition = query_condition + generateQueryCondition('AND', 'OR', 'category_id', await(getCategoriesOfCompound(root_id)));
            }
            if (sameness == 2) {
                let compound = await getCompound(root_id);
                let formula = compound[0].formula;
                let formulaLike2 = likeFormula2(formula);

                query_condition = query_condition + ' AND ' + formulaLike2;
            }
            else if (sameness == 3) {
                let compound = await getCompound(root_id);
                let formula = compound[0].formula;
                let formulaLike3 = likeFormula3(formula);

                query_condition = query_condition + ' AND formula LIKE "' + formulaLike3 + '"';

            }

            query = query + query_condition + ' ORDER BY Random() LIMIT ?';
            console.log(query); 

            db.readTransaction(function(tx) {
                
                tx.executeSql(query, [root_id, count], async function(tx, rs) {
                    //convert query result to array
                    let res = convertResultToArray(rs);
                    if (res.length == count) {
                        resolve(res);
                    }
                    else if (res.length < count) {
                        // add all elements of compounds currently in results to excluded_ids to avoid duplicates
                        for (let elem of res) {
                            excluded_ids.push(elem.compound_id);
                        }
                        
                        resolve(res.concat(await getAlternativesHelper(root_id, sameness - 1, count - res.length, excluded_ids)));
                    }
                    else {
                        reject("Error: getAlternatives function is doing weird stuff");
                    }
                }, function(error) {
                    console.log(error);
                    reject(error);
                })
            }, function(error) {
                console.log(error);
                reject(error)
            })
        })
    }

    return new Promise(async function(resolve, reject) {

        getAlternativesHelper(root_id, sameness, count, []).then(
            function(value) {resolve(value)},
            function(error) {reject(error)}
        );
    })
    
}

// returns count of categories in database
export async function getCategoryCount(){

    return new Promise(function(resolve, reject) {

        db.readTransaction(function(tx) {
            tx.executeSql('SELECT count(*) as c \
            FROM CATEGORIES', [], 
        function(tx, rs) {
                resolve(rs.rows.item(0).c);
            })
        }, function(tx, error) {
            reject(error);
        })
    })
}

// returns count of compounds in category_list - if list is empty all categories
export async function getCompoundCount(category_list) {

    return new Promise(function(resolve, reject) {

        db.readTransaction(function(tx) {

            let query = 'SELECT DISTINCT count(*) as c \
                FROM Compounds JOIN CCMapping USING (compound_id)';

            query = query + generateQueryCondition('WHERE', 'OR', 'category_id', category_list);
        
            tx.executeSql(query, [], function(tx, rs) {
                resolve(rs.rows.item(0).c);
            })
        }, function(tx, error) {
            reject(error);
        })
    })
}


// ---- Rounds & Questions ----

/* creates a question
should only be use manually to add questions that are asked again in the same round
returns new object of open questions for round
TODO: refactor based on question_id -> repeat question in round, only return new question*/
export async function addQuestionToRound(round_id, compound_id) {

    return new Promise(function(resolve, reject) {
        
        db.transaction(function(tx) {
            tx.executeSql('INSERT INTO Questions (round_id, compound_id) \
                VALUES (?, ?)', [round_id, compound_id], 
            async function(tx, rs) {
                resolve(await getOpenQuestions(round_id));
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })

}

/* generates Question Set to be used in a round
returns array of compound_ids
https://www.sqlitetutorial.net/sqlite-limit/
*/
function createQuestionSet(round_id, category_list, amount) {
    
    return new Promise(function(resolve, reject) {

        db.transaction(function(tx) {

            // generate query to select compound_ids according given categories, sorted by descending ranking first, then ascending difficulty 
            var select_query = 'SELECT ? as round_id, compound_id \
                FROM (SELECT * FROM Compounds JOIN CCMapping USING (compound_id)';
            
            select_query = select_query + generateQueryCondition('WHERE', 'OR', 'category_id', category_list);

            select_query = select_query + ' GROUP BY compound_id ORDER BY RANDOM() LIMIT ?) ORDER BY ranking DESC, difficulty ASC';
            let insert_query = 'INSERT INTO Questions (round_id, compound_id) ' + select_query;
            
            tx.executeSql(insert_query, [round_id, amount], async function(tx, rs) {
                resolve(await getOpenQuestions(round_id));
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })
}

/* returns {"id": round_id, "questions": question_set} for round_id
*/
export async function getOpenQuestions(round_id) {
    
    return new Promise(function(resolve, reject) {

        db.readTransaction(function(tx) {

            tx.executeSql('SELECT question_id, result, compound_id, c.name, c.formula, c.split, c.ranking, c.difficulty \
                FROM Questions as q JOIN Compounds as c USING (compound_id) \
                WHERE round_id = ?', [round_id], 
            function(tx, rs) {
                resolve({"id": round_id, "questions": convertResultToArray(rs)});
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })
}

/* returns an array of all open rounds
*/
export async function getOpenRounds() {

    return new Promise(function(resolve, reject) {

        db.readTransaction(function(tx) {

            tx.executeSql('SELECT * \
                FROM Rounds \
                WHERE result IS NULL', [], 
            function(tx, rs) {
                resolve(convertResultToArray(rs));
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })
}

/* returns true if there are no open questions left for a given round
*/
export async function isRoundFinished(round_id) {

    return new Promise(function(resolve, reject) {

        db.readTransaction(function(tx) {

            tx.executeSql('SELECT count(*) as c \
                FROM Questions \
                WHERE round_id = ? AND result IS NULL', [round_id], 
            function(tx, rs) {
                let res = rs.rows.item(0).c == 0;
                resolve(res);
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })
}

/* writes results of a question in question table -> closes question in that sense
type is either mc, free or d&d
result is 0 for false, 1 for true
difficulty can be calculated by app, needs to be real # TODO: not used for now
*/
export async function closeQuestion(round_id, question_id, type, result, difficulty) {

    return new Promise(function(resolve, reject) {

        db.transaction(function(tx) {
            tx.executeSql('UPDATE Questions \
                SET type = ?, \
                    result = ?, \
                    difficulty = ?, \
                    timestamp = ? \
                WHERE question_id = ?', 
                [type, result, difficulty, NowInEpoch(), question_id], 
            async function(tx, rs) {
                if (await isRoundFinished(round_id)) {
                    closeRound(round_id);
                }
                resolve();
            }, function(tx, error) {
                reject(error);
            })
        }, function(error) {
            reject(error);
        })
    })
}

/* closes round - round counts as finished if result is set*/
async function closeRound(round_id) {

        return new Promise(function(resolve, reject) {

            db.transaction(function(tx) {

                tx.executeSql('UPDATE Rounds \
                    SET result = ? \
                    WHERE round_id = ?', [0.0 ,round_id], 
                function(tx, rs) {
                    resolve();
                }, function(tx, error) {
                    reject(error);
                })
            }, function(error) {
                reject(error);
            })
        })
}

/* writes a new Round into database round table returns the id of the Round
*/
async function writeRound(type) {

    return new Promise(function(resolve, reject) {

        db.transaction(function(tx) {
            let time = NowInEpoch();

            tx.executeSql('INSERT INTO Rounds (type, timestamp) \
                VALUES (?, ?)', [type , time], 
            function(tx, rs) {
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
returns {"id": round_id, "questions": question_set}
type should  be learn or test
categoryList should be an array containing one or more category ids or an empty array for all categories [id1, id2] or []
amount should be the desired amount of questions
*/
export async function createRound(type, category_list, amount) {

    return new Promise(async function(resolve, reject) {

        // creates a new round in round table, returns id of round
        let round_id = await writeRound(type);

        // creates a question set in the questions table, returns ready to use question set
        let result = await createQuestionSet(round_id, category_list, amount);
        
        resolve(result);
    })
}


// ---- Initialization ----

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
                            window.getAlternatives = getAlternatives;
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