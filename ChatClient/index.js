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

//Serves login page - can use without authentication
app.get("/login", function (req,res,next) {
    res.status(200);
    res.sendFile("/public/login.html", { "root": __dirname });
})

//Sends back the username if they are authenticated otherwise redirects to login - can use without authentication
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

//creates a new user - can use without authentication
app.post("/api/createUser", function (req, res) {
    //check to see if user already exists - if not add, if so send message to front end
    db.collection("users").findOne({
        username: req.body.username
    }, function (err, user) {
        if (err) {
            return console.log(err);
        }
        //if user is null, they do not exist and should be added
        if (!user) {
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
            //send message that user already exists if database returns a result
            res.status(200);
            res.send("User already exists. Please try a different username")
        }
    })
})

//Login a user
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
        //if the user credentials match a user in db, store user information (minus pw) in session
        if (data) {
            //log in session
            req.session.user = {
                _id: data._id,
                username: data.username
            }
            
            res.status(200);
            res.send("success");
        } else {
            //if there is no match in db send message to front end
            res.status(200);
            res.send("Username or password is invalid");
        }
    })
});

//Serve up any content in the public folder - requires authentication
app.use(isUserAuthenticated, express.static("public"));

//Accept chat from frontend and save to db - requires authentication
app.post("/api/sendChat", isUserAuthenticated, function (req, res) {
    var newChat = req.body.chat;

    var chat = {
        username: req.session.user.username,
        content: req.body.chat,
        timeStamp: Date()
    };
    //save chat to db
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

//Gets all chats - requires authentication
app.get("/api/getAllChats", isUserAuthenticated, function (req, res) {
    db.collection("chats").find({}).toArray(function (err,data) {
        if (err) {
            console.log(err);
        }
        res.status(200);
        res.send(data);
    });
})

//404 route
app.use(function (req, res, next) {
    console.log(`404 page not found for ${req}`);
    res.status = 404;
    res.send("404 Error - resource not found");
})

//500 route
app.use(function (err, req, res, next) {
    console.log(err);
    res.status = 500;
    res.send("500 Internal Server Error ");
});

//Start server listening on port
function startListening() {
    app.listen(PORT, function () {
        console.log(`Server running on port ${PORT}`);
    });
}

//Check to see if user is authenticated - if not redirect to login page
 function isUserAuthenticated(req, res, next) {
    console.log("Authentication Check");

    if (!req.session || !req.session.user) {
        console.log("User is not authenticated");
        res.redirect("/login");
    } else {
        next();
    }

}
