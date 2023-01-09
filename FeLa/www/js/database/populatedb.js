// adds a category with ranking 0, needs a transaction tx as an argument
function addCategory(tx, catName) {
    
    tx.executeSql('INSERT INTO Categories (name, ranking) VALUES (?, ?)', [catName, 0.0], function(tx, resultSet) {
        console.log('Added category ' + catName);
    }, function(tx, error) {
        throw error;
    });
}

// adds a Compound with ranking 0, needs a transaction tx as an argument
// searches for id of category by name in own subtransaction
function addCompound(tx, compName, formula, compSplit, catName) {
    tx.executeSql('INSERT INTO Compounds (name, formula, split, category_id, ranking) VALUES (?, ?, ?, (SELECT category_id FROM Categories WHERE name = ?), ?)', [compName, formula, compSplit, catName, 0.0], function(tx, resultSet) {
        console.log('Added compound ' + compName);
    }, function(tx, error) {
        throw error;
    });
}

function setDataVersion(tx, version) {
    
    tx.executeSql('UPDATE Versioning SET version = ? WHERE type = "data"', [version], function(tx, resultSet) {
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
    return new Promise(function(resolve, reject) {
        //TODO: version sanity check

        //transaction for actually adding stuff
        db.transaction(function(tx) {
            //TODO: read in and loop through categories from json file
            addCategory(tx, "Test");
            addCompound(tx, "Juhu", "JH", "Ju-hu", "Test");
            setDataVersion(tx, 0);
        }, function(error) {
            reject(error);
        }, function() {
            resolve("Transaction successfull: populate database with data version 0");
            //console.log('Transaction successfull: populate database with data version 0');
        })
    });
}