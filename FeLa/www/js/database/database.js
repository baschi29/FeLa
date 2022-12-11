/*
Javascript functions to handle the sqlite database provided by the cordova-sqlite-storage plugin
https://github.com/storesafe/cordova-sqlite-storage
Important: the plugin does not allow persistent storage when using the browser as a platform
*/

//imports nice utility functions from managescheme
import {createVersion0} from "./managescheme.js";

// variable "holding" the database
var db = null;
var opened = false;
// database scheme version our app intends to use
var intendedSchemeVersion = 0;

// Open and initialize database after deviceready event has fired
document.addEventListener('deviceready', initializeDatabase);

// return database only (to modules) when it was opened succesfully
export function getDatabase() {
    if (opened) {
        return db;
    }
    else {
        throw "Error: tried to get database that wasn't successfully opened (yet?)"
    }
}

// Initialize dabase, has to be called only after deviceready event has been registered!
function initializeDatabase() {

    // Manages database scheme - right now only creates schema if there is none
    function manageDatabaseScheme() {

        // Returns -1 if database has no tables
        // else database should have VersionTable from which the scheme version is returned
        function getSchemeVersion() {
            // transaction to check for tables in database using sqlite_master internal table - may not work!
            db.readTransaction(function(tx) {
                tx.executeSql('SELECT count(*) AS tableCount FROM sqlite_master WHERE type = "table"', [], function(tx, rs) {
                    if (rs.rows.item(0).tableCount == 0) {
                        return -1;
                    }
                    else {
                        // transaction to read scheme version from VersionTable which hopefully exists
                        db.readTransaction(function(tx) {
                            tx.executeSql('SELECT version FROM VersionTable WHERE type = "scheme"', [], function(tx, rs) {
                                return rs.rows.item(0).version;
                            }, function(tx, error) {
                                throw "Error: Failed opening version table" + JSON.stringify(error);
                            });
                        });
                    }
                }, function(tx, error) {
                    throw "Error: Error reading sqlite_master table" + JSON.stringify(error);
                });
            });
        }

        let currentSchemeVersion = getSchemeVersion();
        if (currentSchemeVersion = -1) {
            console.log("Database is empty! - creating database scheme from scratch");
            switch (intendedSchemeVersion) {
                case 0: createVersion0();
                break;

                default: throw "Unknown intended db scheme: " + intendedSchemeVersion;
            }
        }
        else {
            // TODO: scheme upgrades (LATER)
            console.log("Current database scheme version: " + currentSchemeVersion);
        }
    }

    // Populates Database if its empty
    function populateDatabase() {
        //TODO
    }

    // opens and initializes database with a nice try and catch block
    try {
        db = window.sqlitePlugin.openDatabase({
            name:'fela.db',
            location:'default',
        }, function(db) {
            console.log("Opened database");
            opened = true;
            manageDatabaseScheme();
            populateDatabase();
        },
        function(err) {
            throw "Open database Error: " + JSON.stringify(err);
        });
    } catch (error) {
        console.log(JSON.stringify(error));
        //TODO indicate to user that program is useless piece of shit
    }
}