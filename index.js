/*********************************************
 *              SERVER  VARIABLES               *
 /********************************************* */

var express = require('express');
//var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3002;

/*********************************************
 *              GAME VARIABLES               *
 /********************************************* */
var userList = [];
var userData = [];
var players_count = 2;
/*********************************************
 *             Related to Client               *
 /********************************************* */
app.use(express.static(__dirname + '/front'));
//var bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));


app.get('/home', function (req, res) {
    res.send('<h1>welcome to New Game </h1>');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/front/index.html');
});


io.on('connection', function (socket) {
    console.log('a user connected');
    /** EACH TIME DISCONNECTED */
    socket.on('disconnect', function () {
        userList.pop(socket.username);
        console.log(socket.username + ' user disconnected');
        sendCurrentUsers();
    });

    /** CURRENT USER STATUS AND OTHER USERS */
    var hasUser = false;
    sendCurrentUsers();

    /** SENDING THE USERS LIST*/
    socket.on('current_users', function (data) {
        sendCurrentUsers();
    });

    /** ADD NEW USER */
    socket.on('add_user', function (username) {
        if (hasUser) return;
        // Assign username
        var userid = getUniqueId().toString();
        socket.username = username;
        socket.userid = userid;

        if (userList.indexOf(username) == -1) {
            userList.push(username);
            userData.push(
                {
                    id: socket.userid,
                    name: socket.username,
                    score: 0,
                    clicked: 0,
                });
        }
        hasUser = true;
        sendCurrentUsers();// sending all user details
        startGame();
    });


    /** THE GAME IS OVER*/
    socket.on('game_over', function (data) {

        //console.log(data);
        userData.forEach(function (row) {

            console.log(row);
            if (row.id == socket.userid) {
                row.score = data.score;
                row.clicked = data.clicked;
            }
        });
        console.log('***********************');
        console.log(userData);
        io.emit('score_board', userData);
    });
    /** DESTROY THE CURRENT GAME SECTION */
    socket.on('destroy_session', function () {
        hasUser = false;
        socket.username = '';
        socket.userid = '';
        gameDestroy();
    });

    /*****************************
     *      Common functions for SOCKET    *
     *****************************/

    function sendCurrentUsers() {
        //console.log(userList);
        io.emit('current_users', {userList: userList, me: socket.username});
    }

    /** Start Game */
    function startGame() {
        //console.log(userList + ' start');
        if (players_count == userList.length) {
            console.log('Game starting...');
            io.emit('game_start');
            setTimeout(function () {
                io.emit('game_stop');
            }, 10000)
        } else {
            console.log('waiting for ' + (players_count - userList.length + ' players...'))
        }
    }

});// END of io.on


http.listen(port, function () {
    console.log('listening on *:' + port);
});

// Common function outside
function getUniqueId() {
    return new Date().getTime() + Math.floor((Math.random() * 10000) + 1);
}

/** Destroy current game after show score board */
function gameDestroy() {
    userData = [];
    userList = [];
}