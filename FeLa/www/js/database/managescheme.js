/* create scheme version 0 from scratch
ables created with https://ozh.github.io/ascii-tables/
USES INTEGER type to store UNIX timestamps in sqlite https://www.sqlitetutorial.net/sqlite-date/
TODO: better logging, selftest */
export function createVersion0(db, callback) {
    db.transaction(function(tx) {
        /* creates Versioning table for storing scheme and data version information
        +-----------+-----------------+
        | type TEXT | version INTEGER |
        +-----------+-----------------+
        | scheme    |               0 |
        | data      |              -1 |
        +-----------+-----------------+ */
        tx.executeSql('CREATE TABLE Versioning (version_id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL UNIQUE, version INTEGER NOT NULL)');
        /* creates Categories table for storing categories 
        +-----------+--------------+
        | name TEXT | ranking REAL |
        +-----------+--------------+
        |           |              |
        +-----------+--------------+ */
        tx.executeSql('CREATE TABLE Categories (category_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, ranking REAL)');
        /* creates Compounds table for storing chemical compounds
        +-----------+--------------+------------------------------+--------------+
        | name TEXT | formula TEXT | category_id INTEGER FOREIGN KEY | ranking REAL |
        +-----------+--------------+------------------------------+--------------+
        |           |              |                              |              |
        +-----------+--------------+------------------------------+--------------+ */
        tx.executeSql('CREATE TABLE Compounds (compound_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, formula TEXT NOT NULL, category_id INTEGER NOT NULL, ranking REAL, FOREIGN KEY(category_id) REFERENCES Categories(category_id))');
        /* creates Rounds table for storing information over attempted question rounds
        +-----------+-------------------+--------------+
        | type TEXT | timestamp INTEGER | ranking REAL |
        +-----------+-------------------+--------------+
        |           |                   |              |
        +-----------+-------------------+--------------+ */
        tx.executeSql('CREATE TABLE Rounds (round_id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, timestamp INTEGER NOT NULL, ranking REAL)');
        /* TODO: creates Questions table for storing what compounds where asked in which round
        +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
        | type TEXT | timestamp INTEGER | result INTEGER | difficulty REAL | round_id INTEGER FOREIGN KEY  | compound_id INTEGER FOREIGN KEY |
        +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
        |           |                   |                |                 |                               |                                 |
        +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
        */
        tx.executeSql('CREATE TABLE Questions (question_id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, timestamp INTEGER NOT NULL, result INTEGER NOT NULL, difficulty REAL, round_id INTEGER NOT NULL, compound_id INTEGER NOT NULL, FOREIGN KEY(round_id) REFERENCES Rounds(round_id), FOREIGN KEY(compound_id) REFERENCES Compounds(compound_id))');
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