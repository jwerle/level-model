describe("model", function () {
  var model   = require('../')
    , assert  = require('assert')
    , levelup = require('levelup')

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

    describe('#save', function () {
      it("Should be able to save to a model collection", function (done) {
        var User = model('User', { name:String });
        User.use('db', levelup('./tmp/db'));
        var user = new User({ name: 'werle' });
        user.save(function (err) {
          if (err) throw err;
          User.find({ name: 'werle'}, function (err, users) {
            if (err) throw err;
            assert.ok(typeof users[0] === 'object');
            assert.ok(users[0].name === user.name);
            user.db.close(done);
          });
        });
      });
    });

    describe('#remove', function () {
      it("Should be able to remove the instance item from its collection", function (done) {
        var User = model('User', { name:String })
        User.use('db', levelup('./tmp/db'))
        var user = new User({ name: 'werle2' })
        user.save(function (err) {
          if (err) throw err;
          user.remove(function (err, affected) {
            if (err) throw err;
            assert.ok(affected === 1);
            user.db.close(done);
          });
        });
      });
    });
  });

  describe('.save', function () {
    it("Should save one or more items who are instances of a given model to the model's collection", function (done) {
      var Thing = model('Thing', { name:String })
      Thing.use('db', levelup('./tmp/db'))
      var thing1 = new Thing({ name: 'thing1' })
      var thing2 = new Thing({ name: 'thing2' })
      var thing3 = new Thing({ name: 'thing3' })
      var thing4 = new Thing({ name: 'thing4' })
      var thing5 = new Thing({ name: 'thing5' })
      var thing6 = new Thing({ name: 'thing6' })
      var array = [thing1, thing2, thing3, thing4, thing5, thing6]
      Thing.save(array, function (err, things) {
        if (err) throw err;
        assert.ok(array.length === things.length);
        Thing.db().close(done);
      });
    });
  });

  describe('.remove', function () {
    it("Should remove an item in a model collection based on a given query", function (done) {
      var Post = model('Post', { content:String, created:Date, updated:Date })
      Post.use('db', levelup('./tmp/db'))
      var post = new Post({ content: "I am a post", created: new Date, updated: new Date })

      post.save(function (err) {
        if (err) throw err;
        Post.remove(post, function (err) {
          if (err) throw err;
          Post.db().close(done);
        })
      })
    });
  });

  describe('.find', function () {
    it("Should return an array of found items based on a query", function (done) {
      var User = model('User', { name:String })
      User.use('db', levelup('./tmp/db'))
      User.find({ name: 'werle' }, function (err, results) {
        if (err) throw err;
        assert.ok(results.length);
        User.db().close(done);
      });
    });
  });

  describe('.findOne', function () {
    it("Should return a single item found in a collection based on a query", function (done) {
      var User = model('User', { name:String })
      User.use('db', levelup('./tmp/db'))
      User.findOne({ name: 'werle' }, function (err, result) {
        if (err) throw err;
        assert.ok(result);
        assert.ok(result.name === 'werle' );
        User.db().close(done);
      });
    });
  });

  describe('.use(type, instance)', function () {
    it("Should accept an instance of a levelup database", function (done) {
      var User = model('User', { name:String });
      User.use('db', levelup('./tmp/db'));
      assert.ok(typeof User.prototype.db === 'object');
      User.prototype.db.close(done);
    });
  });

  after(function (done) {
    levelup.destroy('./tmp/db', done);
  });
});