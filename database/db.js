const sqlite3 = require('sqlite3').verbose();
const uuidv4 = require('uuid/v4');

const salt = "Secret-salt";

class Database {

    constructor(loc = null) {
        loc = (loc == null) ? ':memory:' : loc;

        this.db = new sqlite3.Database(loc, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the database.');
        });

        this.createTables()

    }


    createTables() {
        let table = `CREATE TABLE IF NOT EXISTS users(
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            pass TEXT NOT NULL,
            acc_type INTEGER NOT NULL
        );`

        let table2 = `CREATE TABLE IF NOT EXISTS spreadsheets(
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            created_on INTEGER NOT NULL,
            is_shared INTEGER NOT NULL,
            author TEXT NOT NULL,
            user_name TEXT NOT NULL
        );`

        this.db.run(table, (err, rows) => {
            if (err) {
                throw err;
            }
            // callback(err, rows);
        });

        this.db.run(table2, (err, rows) => {
            if (err) {
                throw err;
            }
            // callback(err, rows);
        });

    }

    insertIntoDatabaseUser(name, email, pass, acc_type, callback) {
        let id = uuidv4();
        let data = [id, name, email, pass, acc_type]
        let sql = `INSERT INTO users(id, name, email, pass, acc_type)
        VALUES (?,?,?,?,?);`;

        this.db.run(sql, data, function (err) {
            let success = false;
            if (err) {
                console.log(err.message);
            } else {
                console.log(`A row has been inserted with rowid ${id}`);
                success = true;
            }
            // get the last insert id
            callback({ err, success, id, name, email, acc_type });
        });
    }

    readFromDatabaseUser(callback) {
        let sql = `SELECT * FROM users `;

        this.db.all(sql, function (err, rows) {
            let success = true;
            if (err) {
                success = false;
                console.error(err.message);
            }
            // get the last insert id
            console.log(rows);
            callback({ err, rows, success });
        });
    }

    updateIntoDatabaseUser(id, data, callback) {
        let sql = `UPDATE users`;
        sql += (data.email != null) ? ` SET email="${data.email}"` : ""
        sql += (data.pass != null) ? ` SET pass="${data.pass}"` : ""
        sql += (data.acc_type != null) ? ` SET acc_type="${data.acc_type}"` : ""

        sql += ` WHERE id="${id}";`
        console.log({ id, sql })
        this.db.run(sql, function (err) {
            let success = true;
            if (err) {
                console.error(err);
                err = err.message;
                success = false;
            }
            console.log({ err, success })
            callback({ err, success });
        });
    }

    deleteFromDatabaseUser(id, callback) {
        let sql = `
        DELETE FROM users WHERE  id="${id}";`;

        this.db.run(sql, function (err, rows) {
            let success = true;
            if (err) {
                success = false;
                err = err.message;
                console.error(err.message);
            }
            // get the last insert id
            console.log(rows);
            callback({ err, rows, success });
        });
    }

    loginUsingEmailAndPassword(email, pass, callback) {
        console.log({ email, pass })
        // email=""
        let sql = `
        SELECT * FROM users
        WHERE email="${email}" AND pass="${pass}"`;

        this.db.all(sql, function (err, rows) {
            let success = false;
            let id, acc_type;
            if (err) {
                success = false;
                console.error(err.message);
            } else if (typeof (rows) == 'undefined') {
                success = false;
            } else {
                if (rows.length == 1) {
                    success = (rows[0].email == email && rows[0].pass == pass) ? true : false
                    id = rows[0].id;
                    acc_type = rows[0].acc_type;
                }
            }

            // get the last insert id
            console.log(rows);
            callback({ err, rows, success, email, id, acc_type });
        });
    }

    insertIntoDatabaseSpreadsheet(data_args, callback) {
        let id = uuidv4();
        let { name, content, created_on, is_shared, author, user_name } = data_args

        if (created_on == null || created_on == undefined) {
            created_on = Date.now()
        }

        if (is_shared == null || is_shared == undefined) {
            is_shared = 0
        }
        let data = [id, name, content, created_on, is_shared, author, user_name]
        let sql = `INSERT INTO spreadsheets(id, name, content, created_on, is_shared, author, user_name)
        VALUES (?,?,?,?,?,?,?);`;

        this.db.run(sql, data, function (err) {
            let success = false;
            if (err) {
                console.log(err.message);
            } else {
                console.log(`A row has been inserted with rowid ${id}`);
                success = true;
            }
            // get the last insert id
            callback({ err, success, id, name, created_on });
        });
    }

    readFromDatabaseSpreadsheet(callback) {
        let sql = `SELECT * FROM spreadsheets `;

        this.db.all(sql, function (err, rows) {
            let success = true;
            if (err) {
                success = false;
                console.error(err.message);
            }
            // get the last insert id
            console.log(rows);
            callback({ err, rows, success });
        });
    }

    getAllUsersSpreadsheets(id, callback) {
        let sql = `SELECT * FROM spreadsheets WHERE author="${id}";`;

        this.db.all(sql, function (err, rows) {
            let success = true;
            if (err) {
                success = false;
                console.error(err.message);
            }
            // get the last insert id
            console.log(rows);
            callback({ err, rows, success });
        });
    }

    getAllSharedSpreadsheetsThatDontBelongToUser(id, callback) {
        let sql = `SELECT * FROM spreadsheets WHERE author!="${id}";`;

        this.db.all(sql, function (err, rows) {
            let success = true;
            if (err) {
                success = false;
                console.error(err.message);
            }
            // get the last insert id
            console.log(rows);
            callback({ err, rows, success });
        });
    }


    getSpreadsheetUsingId(id, callback) {
        let sql = `SELECT * FROM spreadsheets WHERE  id="${id}";`;

        this.db.all(sql, function (err, rows) {
            let success = true;
            if (err) {
                success = false;
                console.error(err.message);
            }
            // get the last insert id
            console.log(rows);
            callback({ err, rows, success });
        });
    }

    updateIntoDatabaseSpreadsheet(id, data, callback) {
        let sql = `UPDATE spreadsheets SET`;
        console.log(data)
        sql += (data.name != null) ? ` name="${data.name}"${(data.only_name == true)?'':","}` : ""
        sql += (data.content != null) ? ` content=\'${data.content}\',` : ""
        sql += (data.is_shared != null) ? ` is_shared="${data.is_shared}" ` : ""
        sql += (data.author != null) ? `  author="${data.author}", ` : ""
        sql += (data.user_name != null) ? ` user_name="${data.user_name}"` : ""

        sql += ` WHERE id="${id}";`

        console.log(sql)
        console.log({ id, sql })
        this.db.run(sql, function (err) {
            let success = true;
            if (err) {
                console.error(err);
                err = err.message;
                success = false;
            }
            console.log({ err, success })
            callback({ err, success });
        });
    }

    deleteFromDatabaseSpreadsheet(id, callback) {
        let sql = `
        DELETE FROM spreadsheets WHERE  id="${id}";`;

        this.db.run(sql, function (err, rows) {
            let success = true;
            if (err) {
                success = false;
                err = err.message;
                console.error(err.message);
            }
            // get the last insert id
            console.log(rows);
            callback({ err, rows, success });
        });
    }

    closeDatabase() {
        this.db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Closed the database connection.');
        });
    }
}


module.exports = Database;