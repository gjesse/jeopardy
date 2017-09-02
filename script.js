players = []
scores = {}
var sheetId = '1_tPHJtHXFOisVWk5H3WKrg1wsy30SHy_5XDQ35bHmgo';
var round = 1;    
var visualization;    
google.load('visualization', '1', {
    packages: ['table']
});

function init() {
    $("#board").hide();
    $("#next-round").hide();
    handleSetup(function() {
        loadData();
    });
}

function handleSetup(callback) {
    // todo validate stuff
    $("#start").click(function (e) {
        // assigns inputs to global vars cause idgaf
        var setup = $("#setup");
        setup.find("#player-setup input").each(function(e) {
            players.push($(this).val());
        });
        players.forEach(function(p) {
            scores[p] = 0;
        }, this);

        var re = /spreadsheets\/d\/([^\/]+)/        
        var sheetUrl = setup.find("#sheet").val();
        sheetId = re.exec(sheetUrl)[1];
        $('#setup').hide();
        callback();
    });
}

function displayScores() {
    var scoreDiv = $("#scores")
    scoreDiv.text("")

    var newText = "";
    for (var key in scores) {
        newText += '<div class="blue score" id="' + key + '_score">' + key + " = " + scores[key] + "</div>";
    }
    scoreDiv.append(newText)
}

function scoreIt(player, score) {
    scores[player] += score;
    displayScores();
    maybeShowNextRound();
}

function maybeShowNextRound(board) {
    board = board || $("#board");
    if (board.find(".clicked").length == 30 && round == 1) {
        $("#next-round").show();
    }
}
function getRound() {
    return round;
}

function getSheet() {
    if (getRound() == 1) {
        return "Round 1"
    } else {
        return "Round 2"
    }
}

function loadData() {
    var query = new google.visualization.Query('https://spreadsheets.google.com/tq?key=' + sheetId + '&sheet='+ getSheet() + '&output=html&usp=sharing');
    query.setQuery('SELECT A, B, C label A "Topic", B "Question", C "Answer"');
    query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
    console.log("handle response")    
    
    if (response.isError()) {
        alert('There was a problem with your query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }
    var data = response.getDataTable();
    var topics = data.getDistinctValues("Topic")
    var tQuestions = {};

    for (var i = 0; i < data.getNumberOfRows(); i++) {
        var question = data.getValue(i, 1) ;
        var answer = data.getValue(i, 2);
        var currentTopic = data.getValue(i, 0);
    
        if (question != null) {
            if (currentTopic)   {
                topic = currentTopic;
            }      
            var answers = tQuestions[topic]
            if (!answers) {
                tQuestions[topic] = [{"q": question, "a": answer}]
            } else {
                tQuestions[topic].push({"q": question, "a": answer})
            }

        }
    }

    var board = $("#board")
    board.text("");
    var topicHtml = '<div class="row">';
    for(id in topics) {
        var topic = topics[id];
        if (topic != null) {
            topicHtml += '<div class="col-1 blue">' + topics[id] + '</div>';
        }
    }
    board.append(topicHtml);

    for (i = 0; i < 5; i++) {
        var score = (i + 1) * 100 * round;
        var rowHtml = '<div class="row">';
        for (t in topics) {
            var topic = topics[t];
            if (topic == null) {
                continue;
            }
            qna = tQuestions[topic][i];
            if (qna) {
                var xIt = '<div class="control"><button  id="' + t + '_' + i + '_cancel">Return</button>'
                xIt += '<button  id="' + t + '_' + i + '_no-answer">No answer</button></div>'

                var scoreIt = '<br/><br/><br/><div class="ok">Correct! ->';
                players.forEach(function(player) {
                    scoreIt += '<button onClick=\'scoreIt(\"' + player + '\",' + score + ')\' id="' + t + '_' + i + '_' + player + '_ok">' + player + '</button>' 
                }, this);
                scoreIt += "</div>"

                scoreIt += '<div class="not-ok">Wrong! ->';
                players.forEach(function(player) {
                    scoreIt += '<button onClick=\'scoreIt(\"' + player + '\",-' + score + ')\' id="' + t + '_' + i + '_' + player + '_not-ok">' + player + '</button>' 
                }, this);
                scoreIt += "</div>"
                questionDiv = '<div id="' + t + '_' + i + '_question" class="question">' + qna.q + scoreIt + xIt + '</div>'
                rowHtml += '<div id="' + t + '_' + i + '" class="col-1 blue score">' + score + '</div>' + questionDiv;
            }
        }
        board.append(rowHtml);
    }
    
    $(".question").hide();
    $(".score").click(function() {
        var rootId = this.id;
        var rootElement = $("#" + this.id);
        var question = $("#" + rootId + "_question");
        
        question.show();
        $("#" + rootId + "_question .ok").click(function(e) {
            rootElement.addClass("clicked")
            question.hide();
            maybeShowNextRound(board);            
        })

        $("#" + rootId + "_cancel").click(function(e) {
            question.hide();
        });

        $("#" + rootId + "_no-answer").click(function(e) {
            rootElement.addClass("clicked")
            question.hide();
            maybeShowNextRound(board);
        });
    })
    $("#next-round").hide();
    if (round == 2) {
        $("#next-round").text("")
    } else {
        $("#next-round").click(function (e) {
            round+=1;
            $("#table").text("")
            loadData();
        })
    }

    board.show();
    displayScores();
}