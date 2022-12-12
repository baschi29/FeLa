import { getDatabase } from "./database.js";

// create scheme version 0 from scratch
export function createVersion0(callback) {
    let db = getDatabase();
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE VersionTable (id INTEGER PRIMARY KEY,type TEXT, version INTEGER)');
        tx.executeSql('INSERT INTO VersionTable (type, version) VALUES (?, ?)', ['scheme', 0], function(tx, resultSet) {
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