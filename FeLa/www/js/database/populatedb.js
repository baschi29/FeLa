import { getDatabase } from "./database.js";

// adds a category, needs a transaction tx as an argument
function addCategory(tx, cname) {
    
    tx.executeSql('INSERT INTO Categories (name, ranking) VALUES (?, ?)', [cname, 0.0], function(tx, resultSet) {
        console.log('Added category ' + cname);
    }, function(tx, error) {
        throw error;
    });
}

// adds a Compound
function addCompound(db) {
    //TODO
}

/* populates database with data version 0 from scratch
for scheme version 0*/
export function populateVersion0(db) {

    //TODO: version sanity check

    //transaction for actually adding stuff
    db.transaction(function(tx) {
        //TODO: read in and loop through categories
        addCategory(tx, "Test");
    }, function(error) {
        throw error;
    }, function() {
        console.log('Transaction successfull: populate database with data version 0')
    })
}