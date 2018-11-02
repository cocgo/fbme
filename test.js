// var schedule = require('node-schedule');


// var j = schedule.scheduleJob('30 * * * * *', function(){
//   console.log('every minute');
// });

var redis = require("redis");
var client = redis.createClient();
client.on("error", function (err) {
  console.log("Redis Error:", err);
});
client.on('connect', function () {
  console.log('Redis连接成功.');

  // 2243662185705137
  let rehs = client.hexists("FlappyBb", '2243662185705137a', function (err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log('ok:', res);
    }
  });
  console.log('is have:', rehs);
});

// 2243662185705137
// let rehs = client.hexists("FlappyBb", '2243662185705137');
// console.log('is have:', rehs);