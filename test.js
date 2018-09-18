var schedule = require('node-schedule');


var j = schedule.scheduleJob('30 * * * * *', function(){
  console.log('every minute');
});