'use strict';

var neo4j = require('neo4j');

exports.neo4j = neo4j;

// Configure for possible deployment
var uristring =
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'http://localhost:7474';
// Connect to Database
var db = new neo4j.GraphDatabase(uristring);
module.exports.db = db;




