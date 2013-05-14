level-model
=====

[![level-model](http://www.toonpool.com/user/718/files/model_leans_on_stool_462135.jpg)]()

Models based on [draft](https://github.com/jwerle/draft) for LevelDB and like interfaces

[![Build Status](https://travis-ci.org/jwerle/level-model.png?branch=master)](https://travis-ci.org/jwerle/level-model)
[![browser support](https://ci.testling.com/jwerle/level-model.png)](https://ci.testling.com/jwerle/level-model)

# level-model

Built with [draft](https://github.com/jwerle/draft) with levelers in mind. Create models that persist in a LevelDB or LevelUP like interface.

## support

Built to work with Nodejs and the browser. Consider using something like [level.js](https://github.com/maxogden/level.js) or [levelup](https://github.com/rvagg/node-levelup) as a database interface.

### level.js

You can use `level-js` as your database interface for all models or for ones of your chosing

```js
var leveljs = require('level-js')
var model = require('level-model')

// set a global database here
model.set('db', leveljs('my-database'));

// or use with a specific model
var MyModel = model('MyModel', {property: String})
MyModel.use('db', leveljs('my-other-database'));
```

**NOTE: Until there is a change, you MUST open the database before using unlike with levelup**

```js
// for global database
model.get('db').open(function () {
  // database is now open so do your stuff
});

// local to a model
MyModel.db().open(function () {
  // database is open so make some magic
});
```

---

### levelup

You can also do the same with `levelup`

```js
var levelup = require('levelup')
var model = require('level-model')

// set global database
model.set('db', levelup('./my-db'));

// or with a model
var MyModel = model('MyModel', {prop: Number})
MyModel.use('db', levelup('./my-db'));
```

---

### other interfaces

You can define your own database interface as well as long as it conforms to the an api who consists of these methods:

* `get(key, callback)` - Asynchronous getter
* `set(key, value, callback)` - Asynchronous setter
* `del(key, callback)` - Asynchronous deleter
* `open(callback)` - Asynchronous openner
* `close(callback)` - Asynchronous closer

You could define a simple interface much like this:

```js
/**
 * Database interface
 */
var Database = function Database(location) {
  this.location = location;
  this.db = new SomeDatabaseStore();
};

/**
 * Asynchronous getter
 */
Database.prototype.get = function (key, callback) {
  var db = this.db
  // do some operation with db
};

/**
 * Asynchronous setter
 */
Database.prototype.set = function (key, value, callback) {
  var db = this.db
  // do some operation with db
};

/**
 * Asynchronous deleter
 */
Database.prototype.del = function (key, callback) {
  var db = this.db
  // do some operation with db
};

/**
 * Asynchronous openner
 */
Database.prototype.open = function (callback) {
  var db = this.db
  // do some operation with db
};

/**
 * Asynchronous closer
 */
Database.prototype.close = function (callback) {
  var db = this.db
  // do some operation with db
};
```

You could then use it like this:

```js
// global
model.set('db', new Database('my-db'));

// local
MyModel.use('db', new Database('my-db'));
```

## install

*nodejs*

```sh
$ npm install level-model --save
```

*component*

```sh
$ component install jwerle/level-model
```

*bower*

```sh
$ bower install level-model
```

## usage

```js
var model = require('model')
```

Creating a model with `level-model` is as simple as creating a model with [draft](https://github.com/jwerle/draft)

```js
var User = model('User', {
  name: String,
  profile: {
    age: Number,
    email: String
  }
});

var user = new User({
  name: 'werle',
  profile: {
    age: 22,
    email: 'joseph@werle.io'
  }
});
```

Model creation is pretty much identical to creating models with `draft`.

You are going to need to connect your models to a database with a LevelUP like api.

```js
model.set('db', require('levelup')('./mydb'));
model.get('db'); // LevelUP database instance
```
Once you set the database you can now make operations with the model instances.

```js
// always use .saveAs when saving for the first time
user.saveAs(user.name, function (err) {
  if (err) throw err;
});
```

You could later read that models data back into its object instance with the `readAs` or `read` methods

```js
// always use .readAs() before .read() if the objects data is being populated with database data instead of argument data to the model constructor as the readAs() function will set the internel savedName property.
user.readAs(user.name, function (err, data) {
  if (err) throw err;
  // do something with data
});
```


## api

### model(name, descriptor, options)

Creates a named model. All models inherit from `LevelModel`

* `name` - Model name
* `descriptor` - An object defining the underlying schema for the model instance. See [draft](https://github.com/jwerle/draft)
* `options` - (optional) Object of options for the defined schema

*example*

```js
var Post = model('Post', {
  title: String,
  content: String,
  created: Date
});

var post = new Post({
  title: "Some title",
  content: "Some content",
  created: new Date()
});

post.saveAs(post.title, function (err) {
  if (err) throw err;
});
```

#### .get(key)

Gets an option value for all model instances

* `key` - Option value to retrieve

*example*

```js
model.get('db')
```

#### .set(key, value)

Sets an option for all model instances

* `key` - A option name or object map of options of key to value
* `value` - Option value

*example*

```js
model.set('key', 'somevalue');
model.get('key'); // somevalue
```

---

### LevelModel(data)

Generic LevelModel constructor. Directly inherits from `draft.Model`
**See [draft.Model](https://github.com/jwerle/draft#modeldata-schema)**

* `data` - An object of data is validated against the schema used to create the Model

*example*

```js
// inherited from LevelModel
var SomeModel = model('SomeModel', {someProperty: String, somethingElse: Number})

// instance inherits from LevelModel's prototype
var thing = new SomeModel({someProperty: "FooBar", somethingElse: 1234})
```

#### .use(name, value)

Allows setting of instance specific properties and extending the prototype

* `name` - A string name representing the property to use
* `value` - A value that is representable by the name argument

*example*

```js
MyModel.use('myPlugin', function () {
  // do something
});

var thing = new MyModel({property: 'something'});

// available on the prototype
thing.myPlugin();
```

#### #serialize()

Serializes instance into a JSON string

*example*

```js
var User = model('User', {name:String})
var werle = new User({name: 'werle'})
console.log(werle.serialize()); // {"name":"werle"}
```

#### #unserialize(data)

Unserializes data into instance

*example*

```js
var User = model('User', {name:String})
var werle = new User()
werle.unserialize('{"name":"werle"}');
console.log(werle.name); // werle
```

#### #save(callback)

Save a model to a database

**Note: A name must be saved otherwise an error will be thrown**

* `callback` - A callback function `fn(err)`

*example*

```js
user.save(function (err) {
  if (err) throw err;
});
```

#### #saveAs(name, callback)

Save a model by name to a database

**Note: If a callback is omitted then a save is not performed, but the name is stored.**

* `name` - Name to save with
* `callback` - A callback function `fn(err)`

*example*

```js
user.saveAs('werle', function (err) {
  if (err) throw err;
});
```

#### #read(callback)

Read a models data from the database

**Note: Will throw a NotFound error if not found in database**

* `callback` - A callback function `fn(err, data)`

*example*

```js
user.read(function (err, data) {
  if (err) throw err;
  console.log(data)
});
```

#### #readAs(name, callback)

**Note: Will throw a NotFound error if not found in database**

Read a models data from the database by a given name

* `name` - Name to save with
* `callback` - A callback function `fn(err, data)`

*example*

```js
user.readAs('werle', function (err, data) {
  if (err) throw err;
  console.log(data)
});
```

#### #remove(callback)

Removes a model from the database

**Note: Will throw a NotFound error if not found in database**

* `callback` - A callback function `fn(err)`

*example*

```js
user.remove(function (err) {
  if (err) throw err;
});
```

#### #removeAs(name, callback)

**Note: Will throw a NotFound error if not found in database**

Read a models data from the database by a given name

* `name` - Name to save with
* `callback` - A callback function `fn(err)`

*example*

```js
user.removeAs('werle', function (err) {
  if (err) throw err;
});
```

---

## configuring a database for specific models

You can configure each model contructor to use its own database interface rather than one set with `model.set('db', db)`.

Every model has a static method `.use(name, value)` which allows setting instance specific properties on the prototype.

You can set the databse this way

```js
MyModel.use('db', db);
```

## todo

* write more tests
* document more

## license

MIT