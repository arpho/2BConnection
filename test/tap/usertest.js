/**
 * Created by arpho on 28/06/14.
 */
'use strict';
var test = require('tap').test;
//var account = require('../../lib/models/account');
var user =  require('../../lib/models/neo4j').user;
var User = new user("me",'me');
test('it works',function(t){
    t.equal('me',User.email);
    t.equal('me',User.password);
    User.isAuthorized(function(user){
        console.log("test callback");
        console.log(user.authorized==true);
        var esito = user.authorized==true;
        console.log(esito);
        t.equal(esito,true,"l'utente dovrebbe essere autorizzato");
        t.end();
    });

});