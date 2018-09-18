let express = require("express");
let http = require("http");
let https = require("https");
let fs = require("fs");
var bodyParser = require('body-parser');
var request = require('request');
var api = require('./gapi');
var api2 = require('./gapi2');

var schedule = require('node-schedule');
var redis = require("redis");
var client = redis.createClient();
client.on("error", function (err) {
    console.log("Redis Error:" , err);
});
client.on('connect', function(){
    console.log('Redis连接成功.');
});


global.garrGame = null;

// Configuare https
const httpsOption = {
    key: fs.readFileSync("./1.key"),
    cert: fs.readFileSync("./1.pem")
}
// Create service
let app = express();

// 允许所有的请求形式 
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// 添加json解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// get获取
app.get('/', function (req, res) {
    let strDate = api.getStrDay();
    res.send('one get: 2018-09-13 to ' + strDate);
    console.log('[', strDate, '] http get success');

});

// post获取
app.post('/', function (req, res) {
    console.log('res post:', req.body);

    res.send('post:' + api.getStrDay());
});

app.post('/wh', function (req, res) {
    console.log('wh post 000', req.query, req.body);

    res.send('wh post:' + api.getStrDay());
});


// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    // let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
    let VERIFY_TOKEN = api2.getToken2();

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            // res.sendStatus(403);
            res.status(200).send('webhook get...');
        }
    } else {
        res.status(200).send('webhook get...');
    }
});


// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

    let body = req.body;
    console.log('webhook post 000', req.query, req.body);

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log('webhook_event:', webhook_event);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

//test game
app.get('/DUNKSHOT', (req, res) => {
    let VERIFY_TOKEN = 'DUNKSHOT';
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            // res.sendStatus(403);
            res.status(200).send('DUNKSHOT webhook get...');
        }
    } else {
        res.status(200).send('DUNKSHOT webhook get...');
    }
});

app.post('/DUNKSHOT', (req, res) => {
    let body = req.body;
    // console.log('DUNKSHOT webhook post:', req.query, req.body);
    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            // console.log('webhook_event:', webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender ID000: ' + sender_psid);
            if (webhook_event.message) {
                console.log('Sender ID111: ' + sender_psid);
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                console.log('Sender ID222: ' + sender_psid);
                handlePostback(sender_psid, webhook_event.postback);
            } else if (webhook_event.game_play) {
                console.log('Sender ID333: ' + sender_psid);
                // handleBackPlay(sender_psid, webhook_event.game_play);
                let nowTime = Math.floor( (new Date().getTime())/1000 );
                addToOneRedis(webhook_event.game_play.player_id, sender_psid, nowTime);
            }

        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }

});


// 投篮
app.get('/FlappyBasketabll', (req, res) => {
    let VERIFY_TOKEN = 'FlappyBasketabll';
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            // res.sendStatus(403);
            res.status(200).send('DUNKSHOT webhook get...');
        }
    } else {
        res.status(200).send('DUNKSHOT webhook get...');
    }
});

app.post('/FlappyBasketabll', (req, res) => {
    let body = req.body;
    // console.log('DUNKSHOT webhook post:', req.query, req.body);
    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            // console.log('webhook_event:', webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender ID000: ' + sender_psid);
            if (webhook_event.message) {
                console.log('Sender ID111: ' + sender_psid);
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                console.log('Sender ID222: ' + sender_psid);
                handlePostback(sender_psid, webhook_event.postback);
            } else if (webhook_event.game_play) {
                console.log('Sender ID333: ' + sender_psid);
                handleBackPlay(sender_psid, webhook_event.game_play);
            }

        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }

});




function handleMessage(sender_psid, received_message) {
    let response;

    // Checks if the message contains text
    if (received_message.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        //test2
        response = {
            //"text": `You sent the message: "${received_message.text}". Now send me an attachment!`
            "text": "Fun basketball game."
        }
    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [{
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    // Send the response message
    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    console.log('ok')
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = {
            "text": "Thanks!"
        }
    } else if (payload === 'no') {
        response = {
            "text": "Oops, try sending another image."
        }
    }
    //test2
    response = {
        "text": "Fun basketball game."
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

function handleBackPlay(sender_psid, response_gameplay) {
    let attachment_url = 'https://raw.githubusercontent.com/cocgo/fbme/master/share.png';

    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "We are Missing you!",
                    "subtitle": "Supass yourself",
                    "image_url": "https://raw.githubusercontent.com/cocgo/fbme/master/share.png",
                    "buttons": [{
                        "type": "game_play",
                        "title": "Play",
                    }]
                }]
            }
        }
    }

    
    // let response = {
    //   "attachment": {
    //     "type": "template",
    //     "payload": {
    //       "template_type": "generic",
    //       "elements": [{
    //         "title": "Is this the right picture?",
    //         "subtitle": "Tap a button to answer.",
    //         "image_url": attachment_url,
    //         "buttons": [
    //           {
    //             "type": "postback",
    //             "title": "Yes!",
    //             "payload": "yes",
    //           },
    //           {
    //             "type": "postback",
    //             "title": "No!",
    //             "payload": "no",
    //           }
    //         ],
    //       }]
    //     }
    //   }
    // }
    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    //test2
    let GTOKEN = 'EAAX2CtZAZCOLIBADZA3PLIMPpNMk3bl3T7bmAo8ZBeo0dkCGbGzTxgZAv1OajLvPJ79tt2Oz75WBCZBmCwJq5Gbfn8VtR8H72AGxZAOZBBqkSJ4M8mLIGA1wT8AI9m059Na3EDzMyyZChS6wP1OOruTLHXZC0GSi7h77XZA3PsnL3jEDDedJJMZAN3Am';
    // let GTOKEN = 'EAAHZAzZAClqvUBABRc27bzE51L8RAsuQkvZBcX3j19f3pYjY9wIj1QT41VIooTfRE0hFZC34Jp21XDAZBbEr7CURWi7H9UAICMXMJ6QZCrHZCUCgMOfjfgTB64dWCU2ZCeVl5JaC8efhV9IZBDYThOJEnpWwFBZCWX9nWbEbIJuD5wQuMtnehYvAZBOy7Ej5Ql8VoQZD';

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/me/messages",
        "qs": {
            "access_token": GTOKEN
        },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });

}

function addToOneRedis(userid, sid, stime){
    
    let saved = {
        lastPlay: stime,
        sid: sid
    }
    client.hset("FlappyBb", userid, JSON.stringify(saved));
}

function checkAllPlayer(){
    let nowTime = Math.floor( (new Date().getTime())/1000 );
    let dtime = nowTime - 72*60*60;
    console.log('checkAllPlayer', nowTime);
    
    client.hgetall('FlappyBb', function(e, v){
        if(e) {
            console.log('err1',e);
        } else {
            console.log('v',v);
            if(v == null || v == ''){
                return;
            }
            // let oneData = JSON.parse(v);
            // if(dtime > oneData.lastPlay && oneData.lastPlay>0){
            //     handleBackPlay(oneData.sid);
            // }
        }
    });
}

// 定时器，72小时后发送消息
var j = schedule.scheduleJob('30 * * * * *', function(){
    console.log('every minute check');
    checkAllPlayer();
});


http.createServer(app).listen(80);
var server = https.createServer(httpsOption, app).listen(443);