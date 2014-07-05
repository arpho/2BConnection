'use strict';
module.exports.login = function(req, res,next) {
    //console.log("custom login");
    var user = require('../models/neo4j').user;
    var password = req.body.password,email = req.body.username;
    var User = new user(email,password);
    //console.log("user: "+email+" pwd: "+password);
        User.isAuthorized(function(u){
            //console.log("si è appena loggato: "+ u.email+" enabled:"+ u.authorized);
        if (u.authorized) {
            req.login(u, function (err) {
                u.username = u.email;
                if (err) next(err);
                res.render('index',{user:u});

            });
        }
    })

    //console.log("utente autenticato");
};