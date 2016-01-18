/*global define */
define(['dialog'], function (dialog) {
    "use strict";
    return function displayScore(score) {
        var i,
            text = 'Highscores for ' + score.x + 'x' + score.y + 'x' + score.z + ', ' + score.mines + ' mines:\n',
            leaderBoard = score.leaderBoard,
            l = leaderBoard.length;
        if (!l) {
            dialog.alert('No results for this settings yet');
        } else {
            for (i = 0; i < l; i += 1) {
                text += leaderBoard[i].position + ')' + ' ' + leaderBoard[i].name + ' - ' + leaderBoard[i].time + '\n';
            }
            dialog.alert(text);
        }
    };
});