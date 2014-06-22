var mongoose, Schema, passportLocalNeo4j;
mongoose = require('mongoose');
Schema = mongoose.Schema;
passportLocalNeo4j = require('./neo4j/passport-local-neo4j');

var Account = new Schema({
    username: String,
    password: String
});

Account.plugin(passportLocalNeo4j);

module.exports = mongoose.model('Account', Account);