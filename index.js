'use strict';
var api = require('./gapi');
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
            console.log('webhook_event:', webhook_event);

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

    // let GTOKEN = 'EAAHZAzZAClqvUBAGzfwhpyLQWNR0MXOKuprayKDlhU69AxAZBeSGiU7FzvR4QXboZCl6UboST81Fh8mA7HAKA93bZBvxPcwnr7QW7eK1no2UurdjCtc96KbpFPtKU4g13UjmeZBy06MBjrPvNcMYiIYHgHiY1j3oEq0JECmbMZCkeZBfctx4A3xXfZAZAyyndeGccZD';
    let GTOKEN = 'EAAHZAzZAClqvUBAGzfwhpyLQWNR0MXOKuprayKDlhU69AxAZBeSGiU7FzvR4QXboZCl6UboST81Fh8mA7HAKA93bZBvxPcwnr7QW7eK1no2UurdjCtc96KbpFPtKU4g13UjmeZBy06MBjrPvNcMYiIYHgHi';

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

