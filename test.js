// var schedule = require('node-schedule');


// var j = schedule.scheduleJob('30 * * * * *', function(){
//   console.log('every minute');
// });


// var redis = require("redis");
// var client = redis.createClient();
// client.on("error", function (err) {
//   console.log("Redis Error:", err);
// });
// client.on('connect', function () {
//   console.log('Redis连接成功.');

//   // 2243662185705137
//   client.hexists("FlappyBb", "950183778439466", function (err, res) {
//     if (err) {
//       console.log(err);
//     } else {
//       // 1有 0没有
//       console.log('ok1:', res);
//     }
//   });

//   client.hget("FlappyBb","950183778439466",function(err,res){
//     if(err){
//         console.log(err);
//     } else{
//       console.log('ok2:', res);
//       let getOne = JSON.parse(res);
//       if(!getOne.sendCount){
//         getOne.sendCount = 0;
//       }
//       console.log(getOne);
//     }
//   });

//   client.hgetall('FlappyBb', function(e, v){
//     if(e) {
//         console.log('err1',e);
//     } else {
//         // console.log('v',v);
//         if(v == null || v == '' || v == 'null'){
//             console.log('no player');
//             return;
//         }
//         for(var id in v){
//             // console.log('---',typeof(id), typeof(v[id]));
//             let userid = id;
//             let oneData = JSON.parse( v[id] );
            
//         }
//     }
//   });
  
// });
var api = require('./gapi');
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
let sendTxt = arrTxt[api.getOrgR(5)];
let response = {
  "attachment": {
      "type": "template",
      "payload": {
          "template_type": "generic",
          "elements": [{
              "title": sendTxt.title,
              "subtitle": sendTxt.subtitle,
              "image_url": 'attachment_url',
              "buttons": [{
                  "type": "game_play",
                  "title": "Play",
              }]
          }]
      }
  }
}
console.log( JSON.stringify(response) )