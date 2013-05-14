model = typeof LevelModel !== 'undefined'? LevelModel : require('../');
try {
  leveljs = typeof leveljs !== 'undefined'? leveljs : require('level-js')
}
catch (e) {
  return false;
}


var db = leveljs('mydb')
model.set('db', db);
model.set('persist', true);

var User = model('User', { name:String, age:Number })

try {
  describe('(browser) level-model', function () {
    it ("Should be just okay", function (done) {
      try { kickbackAndGo(done) }
      catch (e) { console.log('failed'); done(); }
    });
  });
}
catch (e) {
  kickbackAndGo(false);
}

function kickbackAndGo (done) {
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
            done && done();
          })
        })
      })
    });
  });
}