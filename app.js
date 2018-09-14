let express = require("express");
let http = require("http");
let https = require("https");
let fs = require("fs");
var bodyParser = require('body-parser');
var api = require('./gapi');
var api2 = require('./gapi2');

global.garrGame = null;

// Configuare https
const httpsOption = {
    key : fs.readFileSync("./1.key"),
    cert: fs.readFileSync("./1.pem")
}
// Create service
let app = express();

// 允许所有的请求形式 
app.use(function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// 添加json解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// get获取
app.get('/', function (req, res) {
    let strDate = api.getStrDay();
    res.send('one get: 2018-09-13 to ' + strDate);
    console.log('[',strDate,'] http get success');

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
    }else{
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
      body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        console.log('webhook_event:',webhook_event);
      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
});


// 投篮
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
    }else{
        res.status(200).send('DUNKSHOT webhook get...');
    }
});

app.post('/DUNKSHOT', (req, res) => {  
     let body = req.body;
    // console.log('DUNKSHOT webhook post:', req.query, req.body);
    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            let event = entry.messaging[0];
            console.log('webhook_event:', event);
            if (event.game_play) {
                var senderId = event.sender.id; // Messenger sender id
                var playerId = event.game_play.player_id; // Instant Games player id
                var contextId = event.game_play.context_id; 
                var payload = event.game_play.payload;
                var playerWon = payload['playerWon'];
                if (playerWon) {
                    sendMessage(
                    senderId, 
                    contextId, 
                    'Congratulations on your victory!', 
                    'Play Again'
                    );
                } else {
                    sendMessage(
                    senderId, 
                    contextId, 
                    'Better luck next time!', 
                    'Rematch!'
                    );
                }
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
  
});


http.createServer(app).listen(80);
var server = https.createServer(httpsOption, app).listen(443);
