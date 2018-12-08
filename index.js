'use strict';
var api = require('./gapi');
var schedule = require('node-schedule');
var redis = require("redis");
var client = redis.createClient();
client.on("error", function (err) {
    console.log("Redis Error:" , err);
});
client.on('connect', function(){
    console.log('Redis连接成功.');
});

// Imports dependencies and set up http server
const
    
    request = require('request'),
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// get获取
app.get('/', function (req, res) {
    let strDate = api.getStrTime();
    res.send('one get: ' + strDate);
    console.log('[', strDate, '] http get success');

});


// 投篮
app.get('/webhook', (req, res) => {
    let VERIFY_TOKEN = 'FlyingBasketabll';
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
            res.status(200).send('webhook get...');
        }
    } else {
        res.status(200).send('webhook get...');
    }
});

app.post('/webhook', (req, res) => {
    let body = req.body;
    // console.log('webhook post:', req.query, req.body);
    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            // console.log('webhook_event:', webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender ID000: ' + sender_psid);
            if (webhook_event.message) {
                // console.log('Sender ID111: ' + sender_psid);
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                // console.log('Sender ID222: ' + sender_psid);
                handlePostback(sender_psid, webhook_event.postback);
            } else if (webhook_event.game_play) {
                // console.log('Sender ID333: ' + sender_psid);
                // handleBackPlay(sender_psid, webhook_event.game_play);
                let nowTime = Math.floor( (new Date().getTime())/1000 );
                checkIsFirstGame(webhook_event.game_play.player_id, sender_psid, nowTime);
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

    let arrTxt = [
        {
          "title": "We are Missing you!",
          "subtitle": "Supass yourself",
        },
        {
          "title": "hey, boy and girl",
          "subtitle": "follow me, Enjoy sports fun",
        },
        {
          "title": "You are cool today",
          "subtitle": "I am Mr. basketball, who are you?",
        },
        {
          "title": "Fight for basketball!",
          "subtitle": "Tonight, we will take up the stadium.",
        },
        {
          "title": "Fun basketball!",
          "subtitle": "Do you miss basketball?",
        },
    ]
    // 5个里随机一个文案
    let sendTxt = arrTxt[api.getOrgR(5)];
    
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": sendTxt.title,
                    "subtitle": sendTxt.subtitle,
                    "image_url": attachment_url,
                    "buttons": [{
                        "type": "game_play",
                        "title": "Play",
                    }]
                }]
            }
        }
    }

    callSendAPI(sender_psid, response);
}

function sendFirstPlay(sender_psid) {
    let attachment_url = 'https://raw.githubusercontent.com/cocgo/fbme/master/share.png';

    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Thank you for the first time play Flappy Basketball.",
                    "subtitle": "Welcome Flappy Basketball",
                    "image_url": attachment_url,
                    "buttons": [{
                        "type": "game_play",
                        "title": "Play",
                    }]
                }]
            }
        }
    }

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
    
    // EAAHZAzZAClqvUBAEOsBI1OynSrra9T0vVMLI6tZATZCPe6REUfWp5HH7MpMAdhig015I6pKZALQLjEmg9f3b6Aw4wGAvJRCMdcvgqQD5CpDv1ZBHDZArww7KQzK50yafPWACDskrDA3jlgPeS3wkkruhxwaqlgj9rpZArmzgprAL0ZAagG3ytzQG7
    // Send the HTTP request to the Messenger Platform
    // 1115:EAAD9YRYAeeEBAGBQLfvmVJ4hnS6uJFvUh2IW5hdgJM00d60TJbncNOKB0ZCFUXQWI85Fe2NqLDfFfQPXXSDEoT8YUFWFbeKNlaZBmlNbocvakEv0KXrjm15OBQSRpPAMt06hbztZAXEDBT7LScL4Givxzw4ZApE21TYDyYZCODty8lZAAsZBIhnPTaZBAYRf5jfDJIaHhZCdWpA8yrkiMsgtj
    // 1206:EAAD9YRYAeeEBAMsY9jJlsB0nsVSZB83fKNZCL9cZBEk5Xt3AfpQGqFyHCReKCFHayidIDZBaMLQfFJdrX39Y71mQqp1MHk67HUZAq2g5HrRbsnZAVTEwYOY2cgoWPZAmHDdb3yhFMNojtkPepd9sWvSsFvEYn929yhzecLDYKFhbslraRq7d8uFEZBZBH1t1dVLPeLqnpeSX2cAZDZD
    request({
        "uri": "https://graph.facebook.com/me/messages",
        "qs": {
            "access_token": "EAAD9YRYAeeEBAGBQLfvmVJ4hnS6uJFvUh2IW5hdgJM00d60TJbncNOKB0ZCFUXQWI85Fe2NqLDfFfQPXXSDEoT8YUFWFbeKNlaZBmlNbocvakEv0KXrjm15OBQSRpPAMt06hbztZAXEDBT7LScL4Givxzw4ZApE21TYDyYZCODty8lZAAsZBIhnPTaZBAYRf5jfDJIaHhZCdWpA8yrkiMsgtj"
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

function checkIsFirstGame(userid, sid, stime){
    var sCount = 0;
    // 1. 第一次直接发送一次消息先
    client.hexists("FlappyBb", userid, function (err, res) {
        if (err) {
            console.log('noredis:',err);
        } else {
          // 1有 0没有玩过
          if(0 == res){
              // 首次发送
              sendFirstPlay(sid);
              sCount = 1;
          }
        }
        console.log('one player:', api.getStrTime(), userid, res);
        // 2. 保存数据，下次发送用 
        addToOneRedis(userid, sid, stime, sCount);
    });

    // 自己账号，立刻发送测试
    if(userid == '2329136660434425'){
        console.log('---send to myself phone.')
        sendFirstPlay(sid);
    }
}

function addToOneRedis(userid, sid, stime, sCount){
    // console.log('addToOneRedis wait send.');
    var saved = {
        lastPlay: stime,
        sendCount: sCount,
        sid: sid
    }
    client.hset("FlappyBb", userid, JSON.stringify(saved));    
}

function checkAllPlayer(){
    let nowTime = Math.floor( (new Date().getTime())/1000 );
    // 48小时
    let dtime = nowTime - 48*60*60;
    // console.log('checkAllPlayer', nowTime);
    
    client.hgetall('FlappyBb', function(e, v){
        if(e) {
            console.log('err1',e);
        } else {
            // console.log('v',v);
            if(v == null || v == '' || v == 'null'){
                console.log('no player');
                return;
            }
            for(var id in v){
                // console.log('---',typeof(id), typeof(v[id]));
                let userid = id;
                let oneData = JSON.parse( v[id] );
                // console.log('---:', userid, oneData);
                // 大于5次不在发送了
                if( (dtime > oneData.lastPlay) && (oneData.lastPlay>0) && (oneData.sendCount < 5) ){
                    handleBackPlay(oneData.sid);
                    addToOneRedis(userid, oneData.sid, nowTime, oneData.sendCount+1);
                }
            }
        }
    });
}

// 定时器，48小时后发送消息
var j = schedule.scheduleJob('30 * * * * *', function(){
    // console.log('every minute check');
    checkAllPlayer();
});
