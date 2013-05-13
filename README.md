level-model
====

[![level-model](http://www.toonpool.com/user/718/files/model_leans_on_stool_462135.jpg)]()

Models based on [draft](https://github.com/jwerle/draft) for LevelDB and like interfaces

[![Build Status](https://travis-ci.org/jwerle/level-model.png?branch=master)](https://travis-ci.org/jwerle/level-model)
[![browser support](https://ci.testling.com/jwerle/level-model.png)](https://ci.testling.com/jwerle/level-model)

--

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
user.readAs(user.name, function (err) {
  if (err) throw err;
});
```


## api
