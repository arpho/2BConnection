var test = require('tap').test;
//var account = require('../../lib/models/account');
var user =  require('../../lib/models/neo4j').user;
var User = new user();
test('it works',function(t){
    t.equal(true,true);
    t.end();
});
test('look user by email',function(t){
    var error = false;
    //neo.db.
    User.methods.findByEmail("arpho@iol.it",function(err,user){
        if( err)
            error = true;
        else
        console.log(user);
    });
    t.equal(false,error);
    t.end();
})
test('looking for bruno',function(t){
    User.methods.findByEmail('bruno',function(err,user){
        t.end();
        console.log("end test");
        console.log(user);
    })
})