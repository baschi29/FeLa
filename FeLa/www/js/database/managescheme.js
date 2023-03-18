// inserts scheme version field into versioning table and sets it to <version>
function insertSchemeVersion(tx, version) {

    tx.executeSql('INSERT INTO Versioning (type, version) \
        VALUES (?, ?)', ['scheme', 0], 
    function(tx, resultSet) {
        console.log('Set scheme version successfully to ' + version);
    }, function(tx, error) {
        throw error;
    });
}

// inserts data version field into versioning table and sets it to -1
function insertDataVersion(tx) {

    tx.executeSql('INSERT INTO Versioning (type, version) \
        VALUES (?, ?)', ['data', -1], 
    function(tx, resultSet) {
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
            // --- Table Creation ---

            /* creates Versioning table for storing scheme and data version information
            +-----------+-----------------+
            | type TEXT | version INTEGER |
            +-----------+-----------------+
            | scheme    |               0 |
            | data      |              -1 |
            +-----------+-----------------+ */
            tx.executeSql('CREATE TABLE Versioning (\
                version_id INTEGER PRIMARY KEY AUTOINCREMENT, \
                type TEXT NOT NULL UNIQUE, \
                version INTEGER NOT NULL)');
            /* creates Categories table for storing categories
            ranking is the mean of all compound rankings of the category
            +-----------+--------------+
            | name TEXT | ranking REAL |
            +-----------+--------------+
            |           |              |
            +-----------+--------------+ */
            tx.executeSql('CREATE TABLE Categories (\
                category_id INTEGER PRIMARY KEY AUTOINCREMENT, \
                name TEXT NOT NULL UNIQUE, \
                ranking REAL)');
            /* creates Compounds table for storing chemical compounds
            ranking represents how good the questions was answered in the recent future
            ranking starts at 0, result 0 represents false answer, result 1 true answer
            formula: ranking = (1-a)*ranking + a*result (Exponential Weighted Moving Average, a=0.125)
            +-----------+--------------+------------+--------------+--------------------+
            | name TEXT | formula TEXT | split TEXT | ranking REAL | difficulty INTEGER |
            +-----------+--------------+------------+--------------+--------------------+
            |           |              |            |              |                    |
            +-----------+--------------+------------+--------------+--------------------+ */
            tx.executeSql('CREATE TABLE Compounds (\
                compound_id INTEGER PRIMARY KEY AUTOINCREMENT, \
                name TEXT NOT NULL, \
                formula TEXT NOT NULL, \
                split TEXT NOT NULL, \
                ranking REAL, \
                difficulty INTEGER NOT NULL)');
            /* creates CCMapping for mapping compounds and categories
            +---------------------------------+---------------------------------+
            | category_id INTEGER FOREIGN KEY | compound_id INTEGER FOREIGN KEY |
            +---------------------------------+---------------------------------+
            |                                 |                                 |
            +---------------------------------+---------------------------------+*/
            tx.executeSql('CREATE TABLE CCMapping (\
                ccmapping_id INTEGER PRIMARY KEY AUTOINCREMENT, \
                category_id INTEGER NOT NULL, \
                compound_id INTEGER NOT NULL, \
                FOREIGN KEY(category_id) REFERENCES Categories(category_id), \
                FOREIGN KEY(compound_id) REFERENCES Compounds(compound_id))');
            /* creates Rounds table for storing information over attempted question rounds
            result is currently only used to indicate wheter round is finished
            +-----------+-------------------+--------------+
            | type TEXT | timestamp INTEGER | result  REAL |
            +-----------+-------------------+--------------+
            |           |                   |              |
            +-----------+-------------------+--------------+ */
            tx.executeSql('CREATE TABLE Rounds (\
                round_id INTEGER PRIMARY KEY AUTOINCREMENT, \
                type TEXT NOT NULL, \
                timestamp INTEGER NOT NULL, \
                result REAL)');
            /*creates Questions table for storing what compounds where asked in which round
            +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
            | type TEXT | timestamp INTEGER | result INTEGER | difficulty REAL | round_id INTEGER FOREIGN KEY  | compound_id INTEGER FOREIGN KEY |
            +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
            |           |                   |                |                 |                               |                                 |
            +-----------+-------------------+----------------+-----------------+-------------------------------+---------------------------------+
            */
            tx.executeSql('CREATE TABLE Questions (\
                question_id INTEGER PRIMARY KEY AUTOINCREMENT, \
                type TEXT, \
                timestamp INTEGER, \
                result INTEGER, \
                difficulty REAL, \
                round_id INTEGER NOT NULL, \
                compound_id INTEGER NOT NULL, \
                FOREIGN KEY(round_id) REFERENCES Rounds(round_id), \
                FOREIGN KEY(compound_id) REFERENCES Compounds(compound_id))');
            
            // --- Trigger creation ---

            /* Trigger to update compound ranking after question result update
            compound formula: ranking = (1-a)*ranking + a*result, a=0.125
            */
            tx.executeSql('CREATE TRIGGER compound_ranking_update \
                AFTER UPDATE ON Questions \
                WHEN (old.result <> new.result) \
                    OR (old.result IS NULL AND new.result IS NOT NULL) \
                BEGIN \
                    UPDATE Compounds \
                        SET ranking = (((1-0.125) * ranking) + (0.125 * new.result)) \
                        WHERE \
                            new.compound_id = compound_id; \
                END');

            /* Trigger to update category ranking after compound ranking update
            category formula: mean of all rankings in category
            */
            tx.executeSql('CREATE TRIGGER category_ranking_update \
                AFTER UPDATE ON Compounds \
                WHEN old.ranking <> new.ranking \
                BEGIN \
                    UPDATE Categories \
                        SET ranking = (SELECT AVG(ranking) \
                            FROM Compounds AS co, CCMapping AS ccm \
                            WHERE co.compound_id = ccm.compound_id \
                                AND ccm.category_id = category_id \
                            GROUP BY category_id) \
                        WHERE category_id IN (SELECT category_id AS id \
                            FROM Compounds AS co, CCMapping AS ccm \
                            WHERE co.compound_id = ccm.compound_id \
                                AND ccm.compound_id = new.compound_id); \
                END');

            // --- creating views ---
            
            /* view for statistics for categories
            */
            tx.executeSql('CREATE VIEW statistics_merge \
                AS \
                SELECT \
                    Categories.category_id AS category_id, \
                    Categories.name AS categories_name, \
                    Categories.ranking AS categories_ranking, \
                    Questions.result AS result, \
                    Questions.timestamp AS question_timestamp, \
                    Questions.type AS question_type, \
                    Questions.question_id AS question_id, \
                    Rounds.round_id AS round_id, \
                    Rounds.type AS round_type, \
                    Rounds.timestamp AS round_timestamp, \
                    Rounds.result AS round_result \
                FROM Categories, CCMapping, Questions, Rounds \
                WHERE Categories.category_id = CCMapping.category_id \
                    AND CCMapping.compound_id = Questions.compound_id \
                    AND Questions.round_id = Rounds.round_id');
            
            // --- writing version information into database ---

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