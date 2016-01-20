// Description:
//   Stack Overflow Questions
//
// Dependencies:
//   stackexchange
//   html-entities
//
// Configuration:
//   STACK_OVERFLOW_KEY
//
// Commands:
//   overflow <query> - searches Stack Overflow for <query>
//
// Author:
//   jdanlewis
module.exports = function(robot) {

    var Entities = require('html-entities').AllHtmlEntities,
        StackExchange = require('stackexchange'),
        re = new RegExp('^(' + robot.name + '\\s+)?overflow\\s+(.*)', 'i');

    function bestAnswerId(question) {
        var answers = question.answers,
            best;
        if (answers.length) {
            answers.forEach(function(answer) {
                if (!best ||
                    (best.score < answer.score) ||
                    // accepted answers win a tie
                    (best.score === answer.score && question.accepted_answer_id === answer.answer_id)
                ) {
                    best = answer;
                }
            });
            return best.answer_id;
        }
    }

    function quoteMarkdown(md) {
        var entities = new Entities(),
            str = entities.decode(decodeURIComponent(md)),
            quoted = '> ' + str.split('\n').join('\n> ');
        return quoted;
    }

    function randElement(a) {
        return a[Math.floor(Math.random() * a.length)];
    }

    function questionEmote() {
        return randElement([
            ':thinking_face:',
            ':8ball:',
            ':mag:',
            ':question:',
            ':confused:',
            ':raised_hand:'
        ]);
    }

    function answerEmote() {
        return randElement([
            ':+1:',,
            ':clap:',
            ':100:',
            ':bulb:',
            ':smirk:',
            ':ok_hand:',
            ':sunglasses:',
            ':point_right:',
            ':heavy_check_mark:'
        ]);
    }

    function noAnswerEmote() {
        return randElement([
            ':fearful:',
            ':skull:',
            ':poop:',
            ':scream:',
            ':cold_sweat:'
        ]);
    }

    function respond(msg, questions, answer) {
        var best = questions[0],
            str;
        // format best question
        str = questionEmote();
        str += ' *' + best.title + '*';
        str += '\n\n';
        str += quoteMarkdown(best.body_markdown);
        str += '\n\n';
        // format best answer, if available
        if (answer) {
            str += answerEmote();
            str += ' *Top Answer*';
            str += '\n\n';
            str += quoteMarkdown(answer);
            str += '\n\n';
        }
        // add a header for multiple questions
        if (questions.length > 1) {
            str += '*Top Questions*';
            str += '\n\n';
        }
        // add a list of links to top questions
        questions.forEach(function(question) {
            if (question.is_answered) {
                str += ':white_check_mark: ';
            } else {
                str += ':x: ';
            }
            str += question.title;
            str += ' (' + question.link + ')';
            str += '\n';
        });
        // respond
        msg.send(str);
    }

    robot.hear(re, function(msg) {
        var answerCriteria,
            key,
            q,
            questionCriteria,
            so;
        // get the query
        q = msg.match[2] && msg.match[2].trim();
        if (!q) {
            return;
        }
        // get the key
        key = process.env.STACK_OVERFLOW_KEY;
        if (!key) {
            msg.send('Missing environment variable: process.env.STACK_OVERFLOW_KEY');
            return;
        }
        // insantiate Stack Overflow API wrapper
        so = new StackExchange({
            version: 2.2
        });
        questionCriteria = {
            key: key,
            pagesize: 10,
            sort: 'votes',
            order: 'desc',
            filter: '!-*f(6rkvFk5w',
            intitle: q
        };
        answerCriteria = {
            key: key,
            filter: '!.UE7HKkNlV2rixu6'
        };

        // search Stack Overflow
        so.search.search(questionCriteria, function(err, res) {
            var answerId,
                questions;

            if (err) {
                msg.send(noAnswerEmote() + ' An error occurred connecting to Stack Overflow: ' + JSON.stringify(err));
                return;
            }

            questions = res.items;
            if (!questions.length) {
                msg.send('No results on Stack Overflow ' + noAnswerEmote());
                return;
            }

            answerId = bestAnswerId(questions[0]);
            if (answerId) {
                so.answers.answers(answerCriteria, function(err, res) {
                    var answer;
                    if (err) {
                        respond(msg, questions);
                    } else {
                        answer = res.items[0].body_markdown;
                        respond(msg, questions, answer);
                    }
                }, [answerId]);
            } else {
                // no answer --
                // just send the top questions
                respond(msg, questions);
            }
        });
    });
};
/* vim: set tabstop=4:softtabstop=4:shiftwidth=4:expandtab */
