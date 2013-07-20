token = localStorage.getItem('token')
if (! token) {
  token = prompt('token')
  localStorage.setItem('token', token)
}

// init an instance of the API connection
var api = new AndBang();

// then log in
api.validateToken(token, function (err, yourUser) {
    window.me = yourUser;
});

// 'ready' is triggered when you're successfully logged in
api.on('ready', function () {
        console.log('ready!')
    // once 'ready' has been triggered
    // all your normal API functions are available
    // as function calls.

    // for example, we can just fetch our teams
    // and pass it a callback.

    api.getMyTeams(function (err, teams) {
        console.log('teams loaded', teams)
        if (err) { return console.log(err); }

        $(document.body).append( ich.header( teams[0] ) )

        api.getMembers(teams[0].id, function(err, buddies) {
          console.log('buddies loaded', buddies)
          if (err) { return console.log(err); }


          $(document.body).append( ich.buddies({buddies: buddies}) )

          api.getTeamShippedTasks(teams[0].id, function(err, tasks) {
            console.log('shipped tasks loaded', tasks)
            if (err) { return console.log(err); }

            var buddiesMap = {}, lastShippedAt, lastWeekNo;
            buddies.forEach( function(buddy) {
              buddiesMap[buddy.id] = buddy;
            });

            tasks.forEach( function(task) {
              task.buddy = buddiesMap[task.authorId]

              var date = (new Date(parseInt(task.shippedAt)))
              var weekNo = getWeekNumber(date);
              task.shippedAt = date.toISOString().substr(0, 10)
              if (task.shippedAt === lastShippedAt) {
                task.shippedAt = ''
              } else {
                lastShippedAt = task.shippedAt;
              }

              if (lastWeekNo !== weekNo) {
                lastWeekNo = weekNo;
                task.isNewWeek = 1;
              }
            })
            $(document.body).append( ich.shippedTasks({tasks: tasks}) )
          })
        })
    });
});


// http://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(d);
    d.setHours(0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
    // Return array of year and week number
    return weekNo;
}