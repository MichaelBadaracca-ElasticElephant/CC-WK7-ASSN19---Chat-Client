//import modules
var express = require("express");

//Global Variables
var PORT = 8000;
var app = express();

app.use(express.static("public"));

//initialize express
//use body parser

//set up route to get general files
    //will need this to serve up an index.html
    //will need this to serve up a login page

//set up authentication check

//set up route to send chats to common thread

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

app.listen(PORT, function () {
    console.log(`Server running on port ${PORT}`);
})