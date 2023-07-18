const check_auth = (req, res, next) => {
    console.log(req.session)
    if (req.session.logged == true) {
        res.redirect('/dashboard')
    } else {
        next()
    }
}

const check_auth2 = (req, res, next) => {
    if (req.session.logged == false || req.session.logged == null) {
        req.session.logged = false;
        res.redirect('/login')
    } else {
        next()
    }
}

const check_if_admin = (req, res, next) => {
    if (req.session.accType == 1) {
        // is admin
        next()
    } else {
        // is not admin
        res.redirect('/dashboard')
    }
}
module.exports = { check_auth, check_auth2, check_if_admin }