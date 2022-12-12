import { getDatabase } from "./database.js";

// create scheme version 0 from scratch
// TODO: better logging
export function createVersion0(callback) {
    let db = getDatabase();
    db.transaction(function(tx) {
        /* creates Versioning table for storing scheme and data version information
            +-----------+-----------------+
            | type TEXT | version INTEGER |
            +-----------+-----------------+
            | scheme    |               0 |
            | data      |              -1 |
            +-----------+-----------------+
        */
        tx.executeSql('CREATE TABLE Versioning (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL UNIQUE, version INTEGER NOT NULL)');
        /* creates Categories table for storing categories 
            +-----------+--------------+
            | name TEXT | rank INTEGER |
            +-----------+--------------+
            |           |              |
            +-----------+--------------+
        */
        tx.executeSql('CREATE TABLE Categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, rank INTEGER)');
        /* creates Compounds table for storing chemical compounds
            +-----------+--------------+------------------------------+--------------+
            | name TEXT | formula TEXT | category INTEGER FOREIGN KEY | rank INTEGER |
            +-----------+--------------+------------------------------+--------------+
            |           |              |                              |              |
            +-----------+--------------+------------------------------+--------------+
        */
        tx.executeSql('CREATE TABLE Compounds (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, formula TEXT NOT NULL, category INTEGER NOT NULL, rank INTEGER, FOREIGN KEY(category) REFERENCES Categories(id))');
        // sets scheme version to 0
        tx.executeSql('INSERT INTO Versioning (type, version) VALUES (?, ?)', ['scheme', 0], function(tx, resultSet) {
          console.log('resultSet.insertId: ' + resultSet.insertId);
          console.log('resultSet.rowsAffected: ' + resultSet.rowsAffected);
        }, function(tx, error) {
          throw error;
        });
        // sets data version to -1 (no data in database yet)
        tx.executeSql('INSERT INTO Versioning (type, version) VALUES (?, ?)', ['data', -1], function(tx, resultSet) {
          console.log('resultSet.insertId: ' + resultSet.insertId);
          console.log('resultSet.rowsAffected: ' + resultSet.rowsAffected);
        }, function(tx, error) {
          throw error;
        });
        // TODO: add tables from entity-relationship-diagram
      }, function(error) {
        throw error;
      }, function() {
        console.log('Created database scheme version 0');
        callback();
      });
}