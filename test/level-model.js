describe("model", function () {
  var hasWindow = (typeof window !== 'undefined')
      model   = require('../')
    , assert  = require('assert')
    
  var LDB = (!hasWindow) ? require('levelup')('./tmp/db', { json:true }) 
            : require('level-js')('mydb')

  if (hasWindow) {
    before(function (done) {
      LDB.open(done);
    });
  }

  describe('model(name, schema)', function () {
    it("Should create a new named model constructor based on a provided schema", function () {
      var User = model('User', { name:String, email:String });
      assert.ok(typeof User === 'function');
      assert.ok(User.modelName === 'User');
      var user = new User( {name: 'werle', email: 'joseph@werle.io', property: 'value' });

      assert.ok(user.name === 'werle');
      assert.ok(user.email === 'joseph@werle.io');
      assert.ok(user.property === undefined);
    });

    describe('.set', function () {
      it("Should set a global option property", function () {
        model.set('key', 'somevalue');
        assert.ok(model.get('key') === 'somevalue');
      });

      it("Should set the global database for model instances", function () {
        // set global databases
        model.set('db', LDB);
        assert.ok(model.get('db') === LDB);
      });

      it("Should set the persist flag to true", function () {
        // keep connections alive
        model.set('persist', true);
        assert.ok(model.get('persist') === true);
      });
    });

    describe('.get', function () {
      it("Should get a value set from the global options object", function () {
        assert.ok(model.get('persist'))
      });
    });

    describe('#save', function () {
      it("Should be able to save to a model", function (done) {
        var User = model('User', { name:String });
        var user = new User({ name: 'werle' });

        user.saveAs(user.name).save(function (err) {
          if (err) throw err;
          user.read(function (err, data) {
            assert.ok(user.name === data.name);
            user.remove(done);
          });
        });
      });
    });

    describe('#saveAs', function () {
      it("Should save a model by a given name", function (done) {
        var Post = model('Post', { name:String, content:String })
        var post = new Post({
          name: 'test',
          content: "I love to be stored"
        })

        post.saveAs('joes post', function (err) {
          if (err) throw err;
          post.readAs('joes post', function (err, data) {
            if (err) throw err;
            assert.ok(post.name === data.name);
            assert.ok(post.content === data.content)
            post.removeAs('joes post', function (err) {
              if (err) throw err;
              post.name = 'werles';
              post.content = "Modified later";
              post.saveAs('werles', function (err) {
                if (err) throw err;
                post.readAs('werles', function (err, data) {
                  assert.ok(post.name === data.name);
                  assert.ok(post.content === data.content);
                  post.removeAs('werles', done);
                });
              });
            });
          })
        });
      });
    });

    describe('#remove', function () {
      it("Should be able to remove the instance item from the database", function (done) {
        var User = model('User', { name:String })
        var user = new User({ name: 'werle2' })
        joe = new User({name: 'joe'})
        user.saveAs(user.name, function (err) {
          if (err) throw err;
          user.remove(done);
        });
      });
    });

    describe('#removeAs', function () {
      it("Should be able to remove the instance item from the data base by a given name", function (done) {
        var Widget = model('Widget', { type:String, name:String })
        var top = new Widget({type: 'canvas', name: 'top'})
        top.saveAs('top', function (err) {
          if (err) throw err;
          top.removeAs('top', done);
        });
      });
    });

    describe('#read', function () {
      it("Should read a saved object from the database and unserialize its data in to the instance", function (done) {
        var Post = model('Post', { content:String })
        var post = new Post({content: "I am a post"})
        post.saveAs('post', function (err) {
          if (err) throw err;
          post.read(function (err, data) {
            if (err) throw err;
            assert.ok(post.content === data.content);
            done();
          });
        });
      });
    });

    describe('#readAs', function () {
      it("It should read an already saved object by name and unserizlise its data into the instance", function (done) {
        var User = model('User', { name:String })
        var jack = new User({name: 'jack'})
        var jackCopy = new User()
        jack.saveAs('jack', function (err) {
          if (err) throw err;
          jackCopy.readAs('jack', function (err, data) {
            if (err) throw err;
            assert.ok(jack.name === jackCopy.name);
            assert.ok(jackCopy.name === data.name);
            done();
          });
        });
      });
    });


  });

  after(function (done) {
    LDB.close(function () {
      if (!hasWindow) require('levelup').destroy('./tmp/db', done);
      else done();
    });
  });
});