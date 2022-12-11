/*
Javascript functions to handle the sqlite database provided by the cordova-sqlite-storage plugin
https://github.com/storesafe/cordova-sqlite-storage
*/

// variable "holding" the database
var db = null;

// Initialize database after deviceready event has fired
document.addEventListener('deviceready', function() {
    db = window.sqlitePlugin.openDatabase({
        name:'fela.db',
        location:'default',
    });
});

