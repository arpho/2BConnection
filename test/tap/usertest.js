/**
 * Created by arpho on 28/06/14.
 */
'use strict';
var test = require('tap').test;
//var account = require('../../lib/models/account');
var user =  require('../../lib/models/neo4j').user;
var User = new user("me",'me');
var noUser = new user("me","notme");
/*
test('no authorization',function(t){
    //console.log("test started")
    console.log("testing no user")
    noUser.isAuthorized(function(err,user){
        t.equal(false,user.authorized,"utente  non autorizzato");
        t.end();


    });


});*/

test('authorization',function(t){
    User.isAuthorized(function(err,user){
        //console.log("test callback ");
        //console.log(user.authorized==true);
        var esito = user.authorized==true;
        console.log("esito è: "+esito);
        t.equal(true,user.authorized,"utente autorizzato")
        t.end();
    });


});






