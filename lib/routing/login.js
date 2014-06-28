'use strict';
module.exports.login =function(req, res,next) {
    console.log("custom login");
    var user = require('../models/neo4j').user;
    var password = req.body.password,email = req.body.username;
    var User = new user(email,password);
    console.log("user: "+email+" pwd: "+password);
    console.log("utente autenticato"+User.isAuthenticated());
    //TODO re.login() to instantiate session
};