// for mocha from cli
if (typeof window === 'undefined') return false;

window.leveljs = leveljs || require('level-js')
window.model = LevelModel || require('level-model');
var db = leveljs('mydb')
model.set('db', db);
model.set('persist', true);

var User = model('User', { name:String, age:Number })

if (typeof describe === 'function' && typeof it === 'function') {
  describe('(browser) level-model', function () {
    it ("Should be just okay", function (done) {
      kickbackAndGo(done)
    });
  });
}
else {
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