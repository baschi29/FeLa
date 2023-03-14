// variable for desired log level, >0 logs a lot
var logLevel = 0;

// adds a category with ranking 0, needs a transaction tx as an argument
function addCategory(tx, catName) {
    
    tx.executeSql('INSERT INTO Categories (name, ranking) \
        VALUES (?, ?)', [catName, 0.0], 
    function(tx, resultSet) {
        if (logLevel > 0) {
            console.log('Added category ' + catName);
        }
    }, function(tx, error) {
        throw error;
    });
}

// adds a Compound with ranking 0, needs a transaction tx as an argument
function addCompound(tx, compName, formula, compSplit, difficulty) {

    tx.executeSql('INSERT INTO Compounds (name, formula, split, ranking, difficulty) \
        VALUES (?, ?, ?, ?, ?)', [compName, formula, compSplit, 0.0, difficulty], 
    function(tx, resultSet) {
        if (logLevel > 0) {
            console.log('Added compound ' + compName);
        }
    }, function(tx, error) {
        throw error;
    });
}

// adds a Category to Compound mapping, both need to exist, needs a transaction tx as an argument
// searches for ids in own subtransaction
function mapCategoryCompound(tx, catName, compName) {

    tx.executeSql('INSERT INTO CCMapping (category_id, compound_id) \
        VALUES (\
        (SELECT category_id \
            FROM Categories \
            WHERE name = ?),\
        (SELECT compound_id \
            FROM Compounds \
            WHERE name = ?))', 
        [catName, compName], 
    function(tx, resultSet) {
        if (logLevel > 0) {
            console.log("Mapped category " + catName + " and compound " + compName);
        }
    }, function(tx, error) {
        throw error;
    });
}

// updates data version to value specified by <version>
function updateDataVersion(tx, version) {
    
    tx.executeSql('UPDATE Versioning \
        SET version = ? \
        WHERE type = "data"', 
        [version], 
    function(tx, resultSet) {
        console.log('Set data version successfully to ' + version);
    }, function(error) {
        throw error;
    }
    );
}

// populates with specified data version, updates from current version
export async function populateData(db, version, fromversion) {

    return new Promise(async function(resolve, reject) {
        //switch to check varios cases of given fromversion (version to update from)
        switch(fromversion) {
            // if version == fromversion it makes no sense to perform upgrade
            case version: reject("Error: data version "  + version + " to be created is data version to update from");
            
            // if fromversion is -1 create intended version from scratch
            case -1: switch(version) {
                case 0: populateVersion0(db).then(
                    function(msg) {
                        resolve(msg);
                    }, function(error) {
                        reject(error);
                    }
                );
                break;
    
                default: reject("Error: intended data version " + version + " unknown");
            }
            break;
    
            default: reject("Error: data version " + fromversion + " to update from unknown");
        }
    });
}

/* populates database with data version 0 from scratch
for scheme version 0*/
async function populateVersion0(db) {
    return new Promise(async function(resolve, reject) {
        // TODO: version sanity check
        // helpful (maybe lol) Links:
        // https://www.geeksforgeeks.org/how-to-remove-a-character-from-string-in-javascript/
        // https://www.javascripttutorial.net/javascript-string-split/
        // https://www.w3schools.blog/like-operator-sqlite
        // https://www.w3schools.com/js/js_json.asp
        // https://www.digitalocean.com/community/tutorials/how-to-work-with-json-in-javascript
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

        // read data json and transform it to an js object
        let js0 = await import("/data/data0.js");
        let data = js0.default;
        //transaction for actually adding stuff
        db.transaction(function(tx) {

            // loop through categories and add them to database
            console.log("Adding categories");
            for (let category of data["categories"]) {
                if (category["act"] == "new") {
                    addCategory(tx, category["name"]);
                }
                else {
                    reject("Unknown action type " + category["act"]);
                }
            }

            // loop through compounds, add them to database and map to category
            console.log("Adding compounds and mapping to categories");
            for (let compound of data["compounds"]) {

                if (compound["act"] == "new") {

                    // remove #s from compound name to save clearly in database
                    let compName = compound["name"].replace(/#/g, "");
                    addCompound(tx, compName, compound["formula"], compound["name"], compound["difficulty"]);

                    // loop through associated categories and map them - they need to exist!
                    for (let catName of compound["categories"]) {
                        mapCategoryCompound(tx, catName, compName);
                    }
                }
                else {
                    reject("Unknown action type " + compound["act"]);
                }
            }

            updateDataVersion(tx, 0);
        }, function(error) {
            reject(error);
        }, function() {
            resolve("Transaction successfull: populate database with data version 0");
        });
    });
}