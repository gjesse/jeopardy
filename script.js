/*!
 * 
 * Google Sheets To HTML v0.9a
 * 
 * To use, simply replace the "tq?key=" value in the
 * URL below with your own unique Google document ID
 * 
 * The Google document's sharing must be set to public
 * 
 */

players = ['Mia', 'Gabby', 'Carter', 'Sarah']
scores = {}
players.forEach(function(p) {
    scores[p] = 0;
}, this);

google.load('visualization', '1', {
    packages: ['table']
});
var visualization;
var sheetId = '1_tPHJtHXFOisVWk5H3WKrg1wsy30SHy_5XDQ35bHmgo';
var round = 1;

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
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
    scores[player] += score
    displayScores()
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

function drawVisualization() {
    var query = new google.visualization.Query('https://spreadsheets.google.com/tq?key=' + sheetId + '&sheet='+ getSheet() + '&output=html&usp=sharing');
    query.setQuery('SELECT A, B, C label A "Topic", B "Question", C "Answer"');
    query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
    if (response.isError()) {
        alert('There was a problem with your query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }
    displayScores();
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
           // console.log(question, answer, topic)
            var answers = tQuestions[topic]
            if (!answers) {
                tQuestions[topic] = [{"q": question, "a": answer}]
            } else {
                tQuestions[topic].push({"q": question, "a": answer})
            }

        }
    }

    var table = $("#table")
    var topicHtml = '<div class="row">';
    for(id in topics) {
        var topic = topics[id];
        if (topic != null) {
            topicHtml += '<div class="col-1 blue">' + topics[id] + '</div>';
        }
    }
    table.append(topicHtml);


    for (i = 0; i < 5; i++) {
        var score = (i + 1) * 100 * round;
        var rowHtml = '<div class="row">';
        for (t in topics) {
            var topic = topics[t];
            if (topic == null) {
                continue;
            }
            //console.log(topic);
            qna = tQuestions[topic][i];
            if (qna) {
                //console.log(qna);
                var xIt = '<div class="control">' + topic + ' : ' + score + '<button  id="' + t + '_' + i + '_cancel">cancel</button>'
                xIt += '<button  id="' + t + '_' + i + '_no-answer">No answer</button></div>'

                var scoreIt = '<br/><br/><br/><div class="ok">Ok ->';
                players.forEach(function(player) {
                    scoreIt += '<button onClick=\'scoreIt(\"' + player + '\",' + score + ')\' id="' + t + '_' + i + '_' + player + '_ok">' + player + '</button>' 
                }, this);
                scoreIt += "</div>"

                scoreIt += '<div class="not-ok">Not ok ->';
                players.forEach(function(player) {
                    scoreIt += '<button onClick=\'scoreIt(\"' + player + '\",-' + score + ')\' id="' + t + '_' + i + '_' + player + '_not-ok">' + player + '</button>' 
                }, this);
                scoreIt += "</div>"
                questionDiv = '<div id="' + t + '_' + i + '_question" class="question">' + qna.q + scoreIt + xIt + '</div>'
                rowHtml += '<div id="' + t + '_' + i + '" class="col-1 blue score">' + score + '</div>' + questionDiv;
            }
        }
        table.append(rowHtml);
    }

    $(".question").hide();
    $(".score").click(function() {
        var rootId = this.id;
        var rootElement = $("#" + this.id);
        var question = $("#" + rootId + "_question");
        
        question.show();
        //$("#" + this.id).text("")
        //var sel = "#" + this.id + " .ok"
        //console.log(sel)
        $("#" + rootId + "_question .ok").click(function(e) {
            rootElement.addClass("clicked")
            question.hide();
            if ($("#table .clicked").length == 25 && round == 1) {
                $("#next-round").show();
            }
        })

        $("#" + rootId + "_cancel").click(function(e) {
            question.hide();
        });

        $("#" + rootId + "_no-answer").click(function(e) {
            rootElement.addClass("clicked")
            question.hide();
            if ($("#table .clicked").length == 30 && round == 1) {
                $("#next-round").show();
            }
        });
    })
    $("#next-round").hide();
    if (round == 2) {
        $("#next-round").text("")
    } else {
        $("#next-round").click(function (e) {
            round+=1;
            $("#table").text("")
            drawVisualization();
        })
    }
}
google.setOnLoadCallback(drawVisualization);