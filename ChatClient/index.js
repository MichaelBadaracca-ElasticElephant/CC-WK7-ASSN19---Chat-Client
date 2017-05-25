//import modules
var express = require("express");
var bodyParser = require("body-parser");
var expressSession = require("express-session");
var appSecrets = require("./secrets.js")
var mongodb = require("mongodb")

//Global Variables
var PORT = 8000;
var app = express();
var globalChat = "";
var db;

// Connect to mongo (make sure mongo is running!)
mongodb.MongoClient.connect('mongodb://localhost', function (err, database) {
    if (err) {
        console.log(err);
        return;
    }
    console.log("Connected to Database");
    db = database;

    // now, start the server.
    startListening();
});

//app.use(bodyParser.json());
//This is important to be able to get the body of a post request
app.use(bodyParser.urlencoded({
    extended: true
}));

//Sets up the app to create a session for each request
app.use(expressSession({
    secret: appSecrets.secrets.sessionSecret,
    resave: false,
    saveUninitialized: true
}));

app.get("/login", function (req,res,next) {
    res.status(200);
    res.sendFile("/public/login.html", { "root": __dirname });
})

app.get("/api/whois", function (req,res) {
    console.log("whois");
    if (!req.session || !req.session.user) {
        console.log("User is not authenticated");
        res.redirect("/login");
    } else {
        console.log(req.session.user.username + " has been authenticated");
        res.status(200);
        res.send(req.session.user.username);
    }
});

app.post("/api/createUser", function (req, res) {
    //see if user exists
    var doesUserAlreadyExist;
    db.collection("users").findOne({
        username: req.body.username
    }, function (err, user) {
        if (err) {
            return console.log(err);
        }
        if (user) {
            doesUserAlreadyExist = true;
        }else {
            doesUserAlreadyExist = false;
        }

        if (!doesUserAlreadyExist) {
            //create the user's session'
            db.collection("users").insertOne({
                username: req.body.username,
                password: req.body.password

            }, function (err,data) {
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.send('error inserting new user');
                    return;
                }
                res.status(200);
                res.send("User account successfully created");
            })
        } else {
            res.status(200);
            res.send("User already exists. Please try a different username")
        }
    })
})

app.post("/api/login", function (req, res) {
    console.log("Hit Login Endpoint");
    //look up user in db and see if information matches
    db.collection("users").findOne({
        username: req.body.username,
        password: req.body.password
    }, function (err, data) {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("500 - Internal Server Error");
        }
        if (data) {
        
            //log in session
            req.session.user = {
                _id: data._id,
                username: data.username
            }
            
            res.status(200);
            res.send("success");
        } else {
            res.status(200);
            res.send("Username or password is invalid");
        }
    })
});

app.use(isUserAuthenticated, express.static("public"));
//app.use(express.static("public"));
//app.use(isUserAuthenticated, express.static("private"));


//QUESTION: How to prevent cross site scripting?

app.post("/api/sendChat", isUserAuthenticated, function (req, res) {
    //add new chat to global chat
    var newChat = req.body.chat;
    //QUESTION: adding the newline character does not create a new line in the html
    //save chat to db
    var chat = {
        username: req.session.user.username,
        content: req.body.chat,
        timeStamp: Date()
    };

    db.collection("chats").insertOne(chat, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("added chat to database")
        }
    })
    res.status(200);
    res.send(chat);
});

app.get("/api/getAllChats", isUserAuthenticated, function (req, res) {
    console.log("got here");
    db.collection("chats").find({}).toArray(function (err,data) {
        if (err) {
            console.log(err);
        }
        res.status(200);
        res.send(data);
    });
})
//set up 404 route

app.use(function (req, res, next) {
    console.log(`404 page not found for ${req}`);
    res.status = 404;
    res.send("404 Error - resource not found");
})

//set up 500 route

app.use(function (err, req, res, next) {
    console.log(err);
    res.status = 500;
    res.send("500 Internal Server Error ");
});

//setup port

function startListening() {
    app.listen(PORT, function () {
        console.log(`Server running on port ${PORT}`);
    });
}

 function isUserAuthenticated(req, res, next) {
    console.log("Authentication Check");

    if (!req.session || !req.session.user) {
        console.log("User is not authenticated");
        res.redirect("/login");
    } else {
        next();
    }

}
