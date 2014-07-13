/**
 * Created by arpho on 13/07/14.
 */
'use strict';
var test = require('tap').test;
//var account = require('../../lib/models/account');
var user =  require('../../lib/models/neo4j').user;
var noUser = new user("me","notme");

test('authorization',function(t){
    noUser.isAuthorized(function(err,user){
        //console.log("test callback ");
        //console.log(user.authorized==true);
        var esito = user.authorized==true;
        console.log("esito è: "+esito);
        t.equal(false,user.authorized,"utente non  autorizzato")
        t.end();
    });


});