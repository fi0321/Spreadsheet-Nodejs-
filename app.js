const express = require('express');
const Database = require('./database/db');
let path = require('path');
let bodyParser = require('body-parser');
let session = require('express-session');
const ejs = require('ejs');
let { check_auth, check_auth2, check_if_admin } = require('./middleware/auth')
const app = express();
const port = 5000;
let db = new Database('./database/data.db');

// db.createTable();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('home', { r: req.session });
    // res.redirect('/login');
});

app.get('/login', check_auth, (req, res) => {
    res.render('login.ejs');
});

app.get('/register', check_auth, (req, res) => {
    res.render('register');
});

app.get('/dashboard', check_auth2, (req, res) => {
    db.getAllUsersSpreadsheets(req.session.uid, function (doc) {


        if (doc.success) {
            db.getAllSharedSpreadsheetsThatDontBelongToUser(req.session.uid, function (doc2) {
                if (doc2.success) {
                    res.render('dashboard', { r: req.session, sheets: doc.rows, shared: doc2.rows });
                }
            })
        }

    })
});


app.get('/shared_sheets_dashboard', check_auth2, (req, res) => {
    db.getAllUsersSpreadsheets(req.session.uid, function (doc) {


        if (doc.success) {
            db.getAllSharedSpreadsheetsThatDontBelongToUser(req.session.uid, function (doc2) {
                if (doc2.success) {
                    res.render('shared_sheet', { r: req.session, sheets: doc.rows, shared: doc2.rows });
                }
            })
        }

    })
});

// app.get('/new-sheet', (req, res) => {
//     res.render('spreadsheet', { r: req.session });
// });

app.get('/new-sheet', (req, res) => {
    res.render('spreadsheet_web_component', { r: req.session });
});

// check_auth2
app.get('/sheet/:id',check_auth2, (req, res) => {
// app.get('/sheet/:id', (req, res) => {
    let id = req.params.id;
    db.getSpreadsheetUsingId(id, function (doc) {
        console.log({ doc, r: doc.rows })
        if (doc.success && doc.rows.length > 0) {
            res.render('edit_spreadsheet', { r: req.session, rows: doc.rows });
        } else {
            res.render("404")
        }
    })
});

app.get('/settings', check_auth2, (req, res) => {
    res.render('settings', { r: req.session });
});

app.get('/changePassword', check_auth2, (req, res) => {

    res.render('changePassword', { email: req.session.email })
})

app.post('/changeUserPassword', check_auth2, check_if_admin, (req, res) => {
    let email, id;
    if (req.session.accType == 1) {
        if (req.body.email != null && req.body.uid != null) {
            email = req.body.email;
            uid = req.body.uid;
        } else {
            email = req.session.email
            uid = req.session.uid
        }
    }
    res.render('changePassword', { email, uid })
})

app.get('/admin', check_auth2, check_if_admin, (req, res) => {
    db.readFromDatabaseSpreadsheet(function (s) {
        if (s.success) {
            db.readFromDatabaseUser((doc) => {
                if (doc.success) {
                    res.render('admin', { r: req.session, rs: doc.rows, sheets: s.rows });
                } else {
                    res.render('admin', { e: doc.err });
                }
            })
        } else {
            res.render('admin', { e: s.err });
        }
    });
});

app.post('/login', (req, res) => {
    db.loginUsingEmailAndPassword(req.body.email, req.body.password,
        function (doc) {
            // res.send({'success':true});
            if (doc.success) {
                req.session.logged = true;
                req.session.uid = doc.id;
                req.session.email = doc.email;
                req.session.accType = doc.acc_type;
                req.session.user_name = doc.name;
                console.log(req.session)
                res.redirect('/dashboard');
            } else {
                console.log(doc.error)
                res.render("login", { e: "Invalid credentials" })
            }

        }
    )

    // res.send(req.body)
})

app.post('/register', (req, res) => {


    // res.send(req.body)
    let isAdmin = 0
    db.readFromDatabaseUser(function (data) {

        let no_admin = 1;

        if (data.rows.length == 0) {
            isAdmin = 1
        } else {
            data.rows.forEach(function (e) {
                if (e.acc_type == 1) {
                    no_admin = 0;
                }
            })

            if (no_admin == 1) {
                isAdmin = 1;
            }
        }

        db.insertIntoDatabaseUser(
            req.body.name,
            req.body.email,
            req.body.password,
            isAdmin,
            function (doc) {
                // res.send({'success':true});
                if (doc.success) {
                    req.session.logged = true;
                    req.session.uid = doc.id;
                    req.session.email = doc.email;
                    req.session.accType = doc.acc_type
                    req.session.user_name = doc.name;
                    console.log(req.session)
                    res.redirect('/dashboard');
                } else {
                    console.log(doc.error)
                    res.render("register", { e: "Invalid/Duplicate credentials" })
                }

            }
        )
    })

    // console.log({isAdmin})

})

app.get('/logout', check_auth2, (req, res) => {
    req.session.destroy(function (err) {
        console.log("Logged out")
    })
    res.redirect('/');
});

app.post('/logout', check_auth2, (req, res) => {
    req.session.destroy(function (err) {
        console.log("Logged out")
    });
    res.redirect('/login')
});

app.get('/read', (req, res) => {
    db.readFromDatabaseUser((e, r) => {
        res.send({ e, r, 'success': true })
    })
})
app.post('/changePassword', (req, res) => {

    console.log(req.body);
    let id = req.session.uid;
    let feasible = ((req.body.uid != null || req.body.uid != "") && req.body.uid != req.session.uid);

    if (req.session.accType == 1) {
        if (feasible) {
            id = req.body.uid;
        }
    }
    db.updateIntoDatabaseUser(id, { pass: req.body.password }, (doc) => {
        if (doc.success) {
            if (req.session.accType == 1) {
                if (feasible) {
                    res.redirect('/admin')
                } else {
                    res.redirect('/settings')
                }
            } else {
                res.redirect('/settings')
            }
        } else {
            if (req.session.accType == 1) {
                if (feasible) {
                    res.render('changePassword', { e: doc.err, uid: req.body.uid, email: req.body.email })
                } else {
                    res.render('changePassword', { e: doc.err, uid: req.body.uid, email: req.body.email })
                }
            } else {
                res.render('changePassword', { e: doc.err, email: req.session.email })
            }

        }
    })
    // res.send(req.body);
})
app.post('/deleteAccount', check_auth2, (req, res) => {
    // console.log(req.body);
    let id = (req.session.accType == 1) ? ((req.body.uid != null) ? (req.body.uid) : (req.session.uid)) : (req.session.uid);
    db.deleteFromDatabaseUser(id, (doc) => {
        if (doc.success) {
            if (req.session.accType == 1 && id != req.session.uid) {
                res.redirect('/admin')
            } else {
                res.redirect('/logout')
            }
        } else {
            if (req.session.accType == 1 && id != req.session.uid) {
                res.render('admin', { e: doc.err });
            } else {
                if (req.session.accType == 0 || id == req.session.uid) {
                    res.render('settings', { e: doc.err });
                }
            }
        }
    })
})


//spreadsheet API

app.post("/create_sheet", check_auth2, function (req, res) {
// app.post("/create_sheet", function (req, res) {
    let { name, content, created_on, is_shared } = req.body;
    let author = (req.session.uid == null) ? "test-author" : req.session.uid;
    // console.log({content})
    let data = {
        name,
        content: JSON.stringify(content),
        created_on: (created_on != "" || created_on != null) ? parseInt(created_on) : Date.now(),
        is_shared: parseInt(is_shared),
        author,
        user_name: (req.session.user_name != null) ? req.session.user_name : 'test-user'
    }

    db.insertIntoDatabaseSpreadsheet(data, function (doc) {
        if (doc.success) {
            res.send({ success: true, id: doc.id, name: doc.name });
        } else {
            res.status(400).send({ success: false, err: doc.err });
        }
    })

})

// app.post("/update_sheet", function (req, res) {
app.post("/update_sheet", check_auth2, function (req, res) {
    let { name, content, is_shared, id } = req.body;
    let author = req.session.uid;
    // console.log({content})
    let data = {
        name,
        content: JSON.stringify(content),
        is_shared: parseInt(is_shared),
    }

    db.updateIntoDatabaseSpreadsheet(id, data, function (doc) {
        if (doc.success) {
            res.send({ success: true, id: doc.id, name: doc.name });
        } else {
            res.status(400).send({ success: false, err: doc.err });
        }
    })

})

app.post("/update_sheet_share", check_auth2, function (req, res) {
    // app.post("/update_sheet_share", function (req, res) {
    let { is_shared, id, redirect } = req.body;
    let author = req.session.uid;
    // console.log({content})
    let data = {
        is_shared: parseInt(is_shared)
    }

    db.updateIntoDatabaseSpreadsheet(id, data, function (doc) {
        if (doc.success) {
            if (redirect) {
                res.redirect(redirect)
            } else {
                res.send({ success: true });
            }
        } else {
            res.status(400).send({ success: false, err: doc.err });
        }
    })

})

app.post("/update_sheet_name", check_auth2, function (req, res) {
    // app.post("/update_sheet_share", function (req, res) {
    let { name, id, redirect } = req.body;
    let author = req.session.uid;
    // console.log({content})
    let data = {
        name,
        only_name: true
    }

    db.updateIntoDatabaseSpreadsheet(id, data, function (doc) {
        if (doc.success) {
            if (redirect) {
                res.redirect(redirect)
            } else {
                res.send({ success: true });
            }
        } else {
            res.status(400).send({ success: false, err: doc.err });
        }
    })

})

app.post("/copy_sheet", check_auth2, function (req, res) {
    // app.post("/update_sheet_share", function (req, res) {
    let { id, redirect } = req.body;
    let author = (req.session.uid == null) ? "test-author" : req.session.uid;


    db.getSpreadsheetUsingId(id, function (doc) {
        if (doc.success) {

            // let { name, content, created_on, is_shared } = doc;

            // console.log({content})
            let data = {
                name: doc.rows[0].name,
                content: doc.rows[0].content,
                created_on: doc.rows[0].created_on,
                is_shared: 0,
                author,
                user_name: (req.session.user_name != null) ? req.session.user_name : 'test-user'
            }

            console.log({ data_405: data, doc })
            db.insertIntoDatabaseSpreadsheet(data, function (doc2) {
                if (doc2.success) {
                    if (redirect) {
                        res.redirect(redirect)
                    } else {
                        res.send({ success: true });
                    }
                } else {
                    res.status(400).send({ success: false, err: doc.err });
                }
            })



        } else {
            res.status(400).send({ success: false, err: doc.err });
        }
    })

})

app.post("/delete_sheet", check_auth2, function (req, res) {
    // app.post("/delete_sheet", function (req, res) {
    let { id } = req.body;
    let author = req.session.uid;
    let redirect = req.body.redirect;

    db.deleteFromDatabaseSpreadsheet(id, function (doc) {
        if (doc.success) {
            if (redirect) {
                res.redirect(redirect)
            } else {
                res.send({ success: true });
            }
        } else {
            res.status(400).send({ success: false, err: doc.err });
        }
    })

})


app.get("*", (req, res) => {
    res.render('404')
})
app.listen(port, () => console.log(`App listening on port ${port}!`));