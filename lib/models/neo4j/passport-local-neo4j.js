var util = require('util');
var crypto = require('crypto');
var Neo4jUser = require('../neo4j').user;
var UserDb = new Neo4jUser();
var LocalStrategy = require('passport-local').Strategy;
var BadRequestError = require('./badrequesterror');

module.exports = function(schema, options) {
    options = options || {};
    options.saltlen = options.saltlen || 32;
    options.iterations = options.iterations || 25000;
    options.keylen = options.keylen || 512;
    options.encoding = options.encoding || 'hex';

    // Populate field names with defaults if not set
    options.usernameField = options.usernameField || 'username';
    
    // option to convert username to lowercase when finding
    options.usernameLowerCase = options.usernameLowerCase || false;
    
    options.hashField = options.hashField || 'hash';
    options.saltField = options.saltField || 'salt';

    options.incorrectPasswordError = options.incorrectPasswordError || 'Incorrect password';
    options.incorrectUsernameError = options.incorrectUsernameError || 'Incorrect username';
    options.missingUsernameError = options.missingUsernameError || 'Field %s is not set';
    options.missingPasswordError = options.missingPasswordError || 'Password argument not set!';
    options.userExistsError = options.userExistsError || 'User already exists with name %s';
    options.noSaltValueStoredError = options.noSaltValueStoredError || 'Authentication not possible. No salt value stored in mongodb collection!';

    var schemaFields = {};
    if (!schema.path(options.usernameField)) {
    	schemaFields[options.usernameField] = String;
    }
    schemaFields[options.hashField] = String;
    schemaFields[options.saltField] = String;

    schema.add(schemaFields);

    schema.pre('save', function(next) {
        // if specified, convert the username to lowercase
        if (options.usernameLowerCase) {
            this[options.usernameField] = this[options.usernameField].toLowerCase();
        }

        next();
    });

    schema.methods.setPassword = function (password, cb) {
        if (!password) {
            return cb(new BadRequestError(options.missingPasswordError));
        }
        
        var self = this;

        crypto.randomBytes(options.saltlen, function(err, buf) {
            if (err) {
                return cb(err);
            }

            var salt = buf.toString(options.encoding);

            crypto.pbkdf2(password, salt, options.iterations, options.keylen, function(err, hashRaw) {
                if (err) {
                    return cb(err);
                }

                self.set(options.hashField, new Buffer(hashRaw, 'binary').toString(options.encoding));
                self.set(options.saltField, salt);

                cb(null, self);
            });
        });
    };

    schema.methods.authenticate = function(password, cb) {
        var self = this;

        if (!this.get(options.saltField)) {
            return cb(null, false, { message: options.noSaltValueStoredError });
        }

        crypto.pbkdf2(password, this.get(options.saltField), options.iterations, options.keylen, function(err, hashRaw) {
            if (err) {
                return cb(err);
            }
            
            var hash = new Buffer(hashRaw, 'binary').toString(options.encoding);

            if (hash === self.get(options.hashField)) {
                return cb(null, self);
            } else {
                return cb(null, false, { message: options.incorrectPasswordError });
            }
        });
    };

    schema.statics.authenticate = function() {
        var self = this;
        console.log("uauthenticatuio");

        return function(username, password, cb) {
            self.findByUsername(username, function(err, user) {
                if (err) { return cb(err); }
                console.log(user);
                if (user) {
                    return user.authenticate(password, cb);
                } else {
                    return cb(null, false, { message: options.incorrectUsernameError })
                }
            });
        }
    };

    schema.statics.serializeUser = function() {
        return function(user, cb) {
            cb(null, user.get(options.usernameField));
        }
    };

    schema.statics.deserializeUser = function() {
        var self = this;

        return function(username, cb) {
            self.findByUsername(username, cb);
        }
    };
    
    schema.statics.register = function(user, password, cb) {
        // Create an instance of this in case user isn't already an instance
        console.log('registering: '+user.get(options.usernameField));
        var email = user.get(options.usernameField);
        //console.log("password: "+password);
        //cerco l'utente e lo creo se non lo trovo
        UserDb.methods.findByEmail(user.get(options.usernameField),function(err,foundUser){
            console.log("cb di findByEmail");
            var user;
            console.log("ci sono "+foundUser.length);
            if (foundUser.length>0){// c'è già un utente con questo username non faccio nulla
                user = foundUser[0]; // username è la mail quindi si suppone sia univoco, trovo un solo elemento nel db
                console.log(" ho trovato almeno un utente. "+user);
            }
            else{
                console.log("devo creare l'utente: "+email+" password "+password);
                UserDb.createUser(email,password,function(err,newUser){
                    console.log("user created");
                    console.log("new user");

                    console.log(newUser.n);
                });
            }

        })
        /*if (!(UserDb.findByUsername())) {
            console.log("creo utente");
            console.log(user);
            user = new this(user);
        }*/

        if (!user.get(options.usernameField)) {
            return cb(new BadRequestError(util.format(options.missingUsernameError, options.usernameField)));
        }

        var self = this;
        //UserDb.findByEmail()
        self.findByUsername = UserDb.findByUsername;
        self.findByUsername(user.get(options.usernameField), function(err, existingUser) {
            console.log("found user cb:"+ existingUser);
            if (err) { return cb(err); }
            
            if (existingUser) {
                return cb(new BadRequestError(util.format(options.userExistsError, user.get(options.usernameField))));
            }
            console.log('password: '+password);
            user.setPassword(password, function(err, user) {
                if (err) {
                    return cb(err);
                }
                if(existingUser.length==0) // nuovo utente
                {
                    console.log(user.get(options.usernameField)+" "+password+" è un nuovo utente");
                }

            });
        });
    };

    schema.statics.findByUsername = function(username, cb) {
        var queryParameters = {};
        
        // if specified, convert the username to lowercase
        if (username !== undefined && options.usernameLowerCase) {
            username = username.toLowerCase();
        }
        
        UserDb.findByUsername(username,cb);
    };

    schema.statics.createStrategy = function() {
        return new LocalStrategy(options, this.authenticate());
    };
};
