describe("model", function () {
  var model   = require('../')
    , assert  = require('assert')
    , levelup = require('levelup')

  describe('model(name, schema)', function () {
    it("Should create a new named model constructor based on a provided schema", function () {
      var User = model('User', { name:String, email:String });
      assert.ok(typeof User === 'function');
      var user = new User( {name: 'werle', email: 'joseph@werle.io', property: 'value' });
      assert.ok(user.name === 'werle');
      assert.ok(user.email === 'joseph@werle.io');
      assert.ok(user.property === undefined);
    });
  });
});