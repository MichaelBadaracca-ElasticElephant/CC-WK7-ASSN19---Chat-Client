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

app.use(express.static("public"));
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

//function isUserAuthenticated(req,res) {
//    if(req.session)
//}

app.post("api/createUser", function (req,res) {
    //create the user's session'
})


//QUESTION: How to prevent cross site scripting?

//initialize express
//use body parser

//set up route to get general files
    //will need this to serve up an index.html
    //will need this to serve up a login page

//set up authentication check

//set up route to send chats to common thread
app.post("/api/sendChat", function (req, res) {
    //add new chat to global chat
    var newChat = req.body.chat;
    //QUESTION: adding the newline character does not create a new line in the html
    globalChat += newChat + "\n";
    res.status(200);
    res.send(globalChat);
});


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
