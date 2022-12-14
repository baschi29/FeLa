/*
Javascript functions to handle the sqlite database provided by the cordova-sqlite-storage plugin
Exports function used by the application logic
https://github.com/storesafe/cordova-sqlite-storage
Important: the plugin does not allow persistent storage when using the browser as a platform
sadly the sqlite plugin does not use proper promises but classical callback functions, which makes this a mess
*/

//imports nice utility functions from managescheme
import {createVersion0} from "./managescheme.js";
import { populateVersion0 } from "./populatedb.js";

// variable "holding" the database
var db = null;
// do not queue operations on unopened database
var opened = false;
// database version our app intends to use
var intendedSchemeVersion = 0;
var intendedDataVersion = 0;

// Open and initialize database after deviceready event has fired
document.addEventListener('deviceready', initializeDatabase);

// return database only (to modules) when it was opened succesfully
export function getDatabase() {
    
    if (opened && db != null) {
        return db;
    }
    else {
        throw "Error: tried to get database that wasn't successfully opened (yet?)"
    }
}

/* reads the scheme version from the database
tx can be a readTransaction*/
export function readSchemeVersion(tx, callback) {
    
    if (opened && db != null) {
        //TODO
    }
    else {
        throw "Error: tried to get scheme version from database that wasn't successfully opened (yet?)"
    }
}

/* reads the data version from the database
tx can be a readTransaction*/
export function readDataVersion(tx, callback) {
    
    if (opened && db != null) {
        //TODO
    }
    else {
        throw "Error: tried to get data version from database that wasn't successfully opened (yet?)"
    }
}

/* determines wheter database is empty
tx can be a readTransaction
call with callback(result) where result is true when database is empty*/
function isDatabaseEmpty(tx, callback) {
    
    if (opened && db != null) {
        tx.executeSql('SELECT count(*) AS tableCount FROM sqlite_master WHERE type = "table"', [], function(tx, rs) {
            if (rs.rows.item(0).tableCount == 0) {
                callback(true);
            }
            else {
                callback(false);
            }
        }, function(tx, error) {
            throw "Error: Error reading sqlite_master table" + JSON.stringify(error);
        });
    }
    else {
        throw "Error: tried to get emptiness information from database that wasn't successfully opened (yet?)"
    }
}

// Initialize dabase, has to be called only after deviceready event has been registered!
function initializeDatabase() {

    // Manages database scheme - right now only creates schema if there is none
    function manageDatabaseScheme(callback) {
        console.log("Managing database scheme");

        // transaction to check for tables in database using sqlite_master internal table - may not work, but works in browser!
        db.readTransaction(function(tx) {
            isDatabaseEmpty(tx, function(empty) {
                if (empty) {
                    console.log("Database is empty! - creating database scheme from scratch");
                    switch (intendedSchemeVersion) {
                        case 0: createVersion0(db, callback);
                        break;

                        default: throw "Error: bad developer: unknown intended db scheme: " + intendedSchemeVersion;
                    }  
                }
                else {
                    // transaction to read scheme version from Versioning table which hopefully exists
                    db.readTransaction(function(tx) {
                        tx.executeSql('SELECT version FROM Versioning WHERE type = "scheme"', [], function(tx, rs) {
                            if (rs.rows.item(0).version == intendedSchemeVersion) {
                                console.log("Current scheme version " + rs.rows.item(0).version + " is intended version. Nothing to do!");
                                callback();
                            }
                            else {
                                throw "Error: Current and intented scheme version do not match :( - only fix for now is to delete all application data";
                            }                            
                        }, function(tx, error) {
                            throw "Error: Failed opening version table" + JSON.stringify(error);
                        });
                    });
                }
            });
        }, function(error) {
            throw error;
        });
    }

    // Populates Database if its empty
    function populateDatabase() {
        console.log("Populating database");
        populateVersion0(db);
    }

    // opens and initializes database with a nice try and catch block
    try {
        db = window.sqlitePlugin.openDatabase({
            name:'fela.db',
            location:'default',
        }, function(db) {
            opened = true;
            manageDatabaseScheme(populateDatabase);
        },
        function(err) {
            throw "Open database Error: " + JSON.stringify(err);
        });
    } catch (error) {
        console.log(JSON.stringify(error));
        //TODO indicate to user that program is useless piece of shit
    }
}