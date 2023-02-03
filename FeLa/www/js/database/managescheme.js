// inserts scheme version field into versioning table and sets it to <version>
function insertSchemeVersion(tx, version) {

    tx.executeSql('INSERT INTO Versioning (type, version) VALUES (?, ?)', ['scheme', 0], function(tx, resultSet) {
        console.log('Set scheme version successfully to ' + version);
    }, function(tx, error) {
        throw error;
    });
}

// inserts data version field into versioning table and sets it to -1
function insertDataVersion(tx) {

    tx.executeSql('INSERT INTO Versioning (type, version) VALUES (?, ?)', ['data', -1], function(tx, resultSet) {
        console.log('Set data version successfully to -1');
    }, function(tx, error) {
        throw error;
    });
}

// creates specified scheme version, updates from current version
export async function createScheme(db, version, fromversion) {
    
    return new Promise(async function(resolve, reject) {
        //switch to check varios cases of given fromversion (version to update from)
        switch(fromversion) {
            // if version == fromversion it makes no sense to perform upgrade
            case version: reject("Error: scheme version "  + version + " to be created is scheme version to update from");
            
            // if fromversion is -1 create intended version from scratch
            case -1: switch(version) {
                case 0: createVersion0(db).then(
                    function(msg) {
                        resolve(msg);
                    }, function(error) {
                        reject(error);
                    }
                );
                break;
    
                default: reject("Error: intended scheme version " + version + " unknown");
            }
            break;
    
            default: reject("Error: scheme version " + fromversion + " to update from unknown");
        }
    });
}

/* create scheme version 0 from scratch
ables created with https://ozh.github.io/ascii-tables/
USES INTEGER type to store timestamps in sqlite https://www.sqlitetutorial.net/sqlite-date/
TODO: better logging, selftest */
async function createVersion0(db) {
    
    return new Promise(function(resolve, reject) {
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
            tx.executeSql('CREATE TABLE Categories (category_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, ranking REAL)');
            /* creates Compounds table for storing chemical compounds       
            +-----------+--------------+------------+--------------+--------------------+
            | name TEXT | formula TEXT | split TEXT | ranking REAL | difficulty INTEGER |
            +-----------+--------------+------------+--------------+--------------------+
            |           |              |            |              |                    |
            +-----------+--------------+------------+--------------+--------------------+ */
            tx.executeSql('CREATE TABLE Compounds (compound_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, formula TEXT NOT NULL, split TEXT NOT NULL, ranking REAL, difficulty INTEGER NOT NULL)');
            /* creates CCMapping for mapping compounds and categories
            +---------------------------------+---------------------------------+
            | category_id INTEGER FOREIGN KEY | compound_id INTEGER FOREIGN KEY |
            +---------------------------------+---------------------------------+
            |                                 |                                 |
            +---------------------------------+---------------------------------+*/
            tx.executeSql('CREATE TABLE CCMapping (ccmapping_id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER NOT NULL, compound_id INTEGER NOT NULL, FOREIGN KEY(category_id) REFERENCES Categories(category_id), FOREIGN KEY(compound_id) REFERENCES Compounds(compound_id))');
            /* creates Rounds table for storing information over attempted question rounds
            +-----------+-------------------+--------------+
            | type TEXT | timestamp INTEGER | ranking REAL |
            +-----------+-------------------+--------------+
            |           |                   |              |
            +-----------+-------------------+--------------+ */
            tx.executeSql('CREATE TABLE Rounds (round_id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, timestamp INTEGER NOT NULL, ranking REAL)');
            /*creates Questions table for storing what compounds where asked in which round
            +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
            | type TEXT | timestamp INTEGER | result INTEGER | difficulty REAL | round_id INTEGER FOREIGN KEY  | compound_id INTEGER FOREIGN KEY |
            +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
            |           |                   |                |                 |                               |                                 |
            +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
            */
            tx.executeSql('CREATE TABLE Questions (question_id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, timestamp INTEGER, result INTEGER, difficulty REAL, round_id INTEGER NOT NULL, compound_id INTEGER NOT NULL, FOREIGN KEY(round_id) REFERENCES Rounds(round_id), FOREIGN KEY(compound_id) REFERENCES Compounds(compound_id))');
            insertSchemeVersion(tx, 0);
            insertDataVersion(tx);
          }, function(error) {
              reject(error);
          }, function() {
              //console.log('Transaction successfull: create database scheme version 0');
              resolve('Transaction successfull: create database scheme version 0');
          });
    });
}