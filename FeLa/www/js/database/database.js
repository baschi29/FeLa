/*
Javascript functions to handle the sqlite database provided by the cordova-sqlite-storage plugin
https://github.com/storesafe/cordova-sqlite-storage
Important: the plugin does not allow persistent storage when using the browser as a platform
*/

//imports nice utility functions from managescheme
import {createVersion0} from "./managescheme.js";

// variable "holding" the database
export var db = null;
// database scheme version our app intends to use
var intendedSchemeVersion = 0;

// Open database after deviceready event has fired (initialize database)
document.addEventListener('deviceready', initializeDatabase);

// Initialize dabase, has to be called only after deviceready event has been registered!
function initializeDatabase() {

    // Manages database schema - right now only creates schema if there is none
    function manageDatabaseScheme() {
        db.readTransaction(function(tx) {
            tx.executeSql('SELECT version FROM VersionTable WHERE type = "scheme"', [], function(tx, rs) {
                currentSchemeVersion = rs.rows.item(0).version;
                console.log("There is a version table an version is: " + currentSchemeVersion);
            }, function(tx, error) {
                console.log("There is no version table! - creating database scheme from scratch");
                switch (intendedSchemeVersion) {
                    case 0: createVersion0();
                    break;

                    default: throw "Unknown intended db scheme: " + intendedSchemeVersion;
                }
            });
        });
    }

    // Populates Database if its empty
    function populateDatabase() {
        //TODO
    }

    // opens database
    try {
        db = window.sqlitePlugin.openDatabase({
            name:'fela.db',
            location:'default',
        }, function(db) {
            console.log("Opened database");
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