//App  Dependencies
const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const GameController = require("./GameController");

//App constants
const app = express();
const PORT = 4750;

//Game State
var GameState;

//fixes cross origin resource sharing problems
app.use(cors());

//Configure the app to parse json request bodies
app.use(bodyparser.json());


//Initialize the game state
app.get("/initialize", function(req, res){
    console.log("Initializing New Gamestate");
    GameState = new GameController();
    res.send(GameState.InitMessage());
});

app.post("/node-clicked", function(req, res){
    console.log("Processing Node Clicked");
    res.send(GameState.nodeClicked(req.body));
});

app.post("/error", function(req, res){
    console.log(req.body);
});


app.listen(PORT, function(err){
    if (err){
        console.log(err);
    } else {
        console.log("Listening on port " + PORT);
    }
});