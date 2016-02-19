/**********************************
 *          Client JS file
 ********************************** */
/**
 * GAME RULES
 * 1. Everyone can play this game
 * 2. The game only start with minimum 2 players
 * 3. The maximum number of player is 10
 * 4. One numbers is showing randomly on screen, the user want to click that number from the number board.
 *      Once the number is clicked correct the game shows next and so on...
 * 5. The maximum time for this game is 30 seconds
 * 6. The WINNER is who have highest point
 *
 */
var socket = io();
var me;
var click = 0;

$(function () {

    /** Define */
    var $userForm = $('#user_form');
    var $gameWrapper = $('#game_wrapper');
    var $gameWaiting = $('#game_waiting');
    var $gameStopped = $('#game_stopped');


    /** Init*/
    $gameWrapper.hide();
    $gameStopped.hide();

    /** ADD USER */
    $userForm.submit(function () {
        me = $(this).find(':text').val();
        $('#add-user-section').remove();
        socket.emit('add_user', me);
        return false;
    });
    /** current users Listing */
    socket.on('current_users', function (data) {
        $('#online-users').html(data.userList.length);
        addNewUser(data);
    });
    /** START GAME */
    socket.on('game_start', function () {
        $gameWaiting.hide();
        $gameWrapper.slideDown();
        drawGameBoard();
    });
    /** STOP GAME*/
    socket.on('game_stop', function () {
        $gameWrapper.slideUp();
        $gameStopped.show();
        socket.emit('game_over', {score: my_score, clicked: click});
    });

    /** View scoRE BOARD */
    socket.on('score_board', function (data) {
        console.log("score_board  " + data);
        scoreBoard(data);
        socket.emit('destroy_session');
    });

});

function scoreBoard(data) {
    var $scoreboard = $('#score_board_list');
    $scoreboard.html('');
    //   console.log(data[0].name);
    $.each(data, function (index, row) {

        var tmpl = '  <li class="media">'
            + '<div class="media-body">'
            + '<div class="media">'
            + '<a class="pull-left player-score" href="#">' + row.score + '</a>'
            + '<div class="media-body">'
            + '<h5>' + row.name + '</h5>'
            + '<small class="text-muted">Scored from ' + row.clicked + ' click</small>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</li>';
        $scoreboard.append(tmpl);
    });
    $scoreboard.hide().fadeIn('slow');
}
function addNewUser(data) {
    $('#user-list').html('');
    console.log(data);
    console.log(me);
    $.each(data.userList, function (index, username) {

        //var img_src = (me == data.me) ? 'assets/img/me.jpeg' : 'assets/img/user.png';
        var img_src = 'assets/img/user.png';

        var tmpl = '  <li class="media">'
            + '<div class="media-body">'
            + '<div class="media">'
            + '<a class="pull-left" href="#">'
            + '<img class="media-object img-circle" style="max-height:40px;"    src="' + img_src + '"/>'
            + '</a>'
            + '<div class="media-body">'
            + '<h5>' + username + '</h5>'
            + '<small class="text-muted">Active From 3 hours</small>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</li>';
        $('#user-list').append(tmpl);
        $('#user-list').last().hide().fadeIn('slow');
    });
}

var number_arr = [];
var number_live;
var my_score = 0;
function drawGameBoard() {
    var start_number = Math.floor((Math.random() * 100) + 1);
    start_number = start_number > 74 ? 74 : start_number;
    var board = '';
    var temp;
    number_arr = [];
    for (i = 0; i < 25; i++) {
        temp = start_number++;
        number_arr.push(temp);
        board += '   <button rel="' + temp + '" type="button" class="btn btn-default touch_me">' + temp + '</button>'
    }
    $('#game_numer_board').hide().html(board).fadeIn('slow');
    nextTrigger();
    startGame();
}

function startGame() {
    $('.touch_me').click(function (event) {
        event.preventDefault();
        if (number_live == parseInt($(this).attr('rel'))) {
            my_score++;
        }
        click++;
        $('#my_score_board').html(my_score);
        drawGameBoard();
    });
}

function nextTrigger() {
    number_live = number_arr[Math.floor(Math.random() * number_arr.length)];
    $('#number_live').hide().html(number_live).fadeIn('slow');
}