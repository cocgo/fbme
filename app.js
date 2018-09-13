let express = require("express");
let http = require("http");
let https = require("https");
let fs = require("fs");
var bodyParser = require('body-parser');
var api = require('./gapi');

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
    
});

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {
    let body = req.body;
    console.log('webhook post:', req.body);
    // Checks this is an event from a page subscription
    /*
    if (body.object === 'page') {
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
  
            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
        });
        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
    */
});



http.createServer(app).listen(80);
var server = https.createServer(httpsOption, app).listen(443);
