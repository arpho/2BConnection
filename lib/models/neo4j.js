'use strict';
var bcrypt   = require('bcrypt-nodejs');
var neo = require('neo4j');
module.exports.user = function user(email,password){
    var self = this;
    var db = require('../db/neo').db;
    this.db = db;
    this.email = email;
    this.password = password;
    this.local = {};
    this.local.password = null;
    this.Linkedin = {};
    this.methods = {};
    this.id = null;
    this.user = {};
    this.user.local = {};
    this.get = function(){return self.id}
    this.getEmail = function(){return self.email}
    this.setEmail = function(e){
        self.email = e
    };
    this.setPassword = function(p){
      self.password = p;
    };
    this.methods.findOne = function(par){
        /*
        cerca l'utente  che possiede un nodo lms_auth di tipo, campo  e valore corrispondenti ai parametri
        @param: {type:<'Facebook','Google','local'>,field:<'email','id'>}
        @return: lms_user id
        */
    }
    this.methods.hashify = function(p){
        return bcrypt.hashSync(p);
    };
    this.methods.findById = function(id,next){
    var query =["start n = node({id})",
               " match (n)-[r:lms_logs_with]-(o) return n,r,o"].join('\n'),
    params = {id:id};
    db.query(query,params,function(err,user){
        if (err) {next(err);
                 throw err;}
        else{
            this.id = id;
            this.local = user[0].n // in generale il risultato è una lista, avrò un user per ogni modalità di accesso registrata
            for (var i=0;i<user.length;i++){
                self.user[user[i].o.data.type] = user[i].o.data;
                
            }
            next(err,self.user);
            
        }
    })
};

    this.methods.findByEmail = function(email,cb){
        var query =["match (n:tbc:user)",
                    " where n.email = {email} return n,id(n) as id"
        ].join('\n'),
        params = {email:email};
        //console.log("neo4j is looking for: "+email);
        db.query(query,params,function(err,user){
            if(err){
                cb(err);
                throw err;
            }
            else {
                //console.log("findByEMail found:" + user.length + " utenti");
                cb(err, user);
            }

    });
    }
    this.isAuthorized = function(cb){
        self.authorized = false;
        //console.log("isauth")
        self.methods.findByEmail(self.email,function(err,userList){

           /* console.log("callback findbyemail")
            console.log("found user:" + userList[0].n._data.data.email);
            console.log("enabled user:" + userList[0].n._data.data.enabled);
            console.log("is authorized error: "+err)*/

            if (userList.length>0) {
                /*console.log("userList");
            console.log(userList)
                console.log("user password: "+self.password)
                console.log("password match: "+userList[0].n._data.data.password.localeCompare(self.password)!=-1)
                console.log("user enabled: "+userList[0].n._data.data.enabled)*/
                self.authorized = false;
                if (userList[0].n._data.data.password.localeCompare(self.password)!=-1 && userList[0].n._data.data.enabled) {
                    self.id = userList[0].id;
                    //console.log("utente autenticato")
                    cb(null,self);
                }
                cb(null,self);
            }
            else {
                console.log("userList short")
                cb(null,self);
             }

        })
    }
    this.findByUsername = this.methods.findByEmail;
    this.createUser = function(email,password,cb){
        var query = ["create (n:tbc:user {email:{email},password:{password}})",
        "return n"].join('\n'),
        params = {email:email,password:password};
        db.query(query,params,function(err,user){
            if(err){
                cb(err);
                throw err;
            }
            cb(err,user);
        });

    };
    this.methods.validPassword = function(password) {
        //console.log('received password');
        //console.log(password);
        //console.log(self.user.local.password);
        //console.log(self);
        //console.log(self);
    return bcrypt.compareSync(password, self.user.local.password);
};
     // generating a hash
    this.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        // checking if password is valid
    
   
    
   
        
};

    
    

}