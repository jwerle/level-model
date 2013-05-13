// for mocha from cli
if (typeof window === 'undefined') return false;

window.model = LevelModel || require('level-model');
var db = leveljs('mydb')
model.set('db', db);
model.set('persist', true);

var User = model('User', { name:String, age:Number })

db.open(function () {
  user = new User({name: 'werleeee'})
  user.saveAs('werleee', function (err) { 
    if (err) throw err;
    user.read(function (err, data) {
      if (err) throw err;
      user.age = 22;
      user.save(function (err) {
        if (err) throw err;
        user.read(function (err, data) {
          if (err) throw err;
          console.log(data.name)
          console.log(data.age)
        })
      })
    })
  });
});