/**
 * Module Dependencies
 */
var draft   = require('draft')
  , isArray = Array.isArray

/**
 * Exports
 */
module.exports = model;

/**
 * CHecks whether a given input is in an array
 *
 * @api private
 * @param {Array} array
 * @param {Mixed} needle
 */
function inArray (array, needle) {
  return !!~array.indexOf(needle);
}

/**
 * 
 */
function find (query, callback) {
  var db = this.prototype.db
    , name = this.modelName.toLowerCase()
    , Model = this.prototype.Model
  

  db.get(name, function (err, collection) {
    if (err) return callback(err);
    collection = JSON.parse(collection);
    var found = collection.filter(function (item) {
      var matched = true
      if (typeof item === 'object') {
        for (var prop in query) {
          if (item[prop] !== query[prop]) {
            matched = false;
          }
        }
      }

      return matched
    }).map(function (item) {
      return new Model(item);
    });

    callback(null, found, collection, db);
  });
}

function findOne (query, callback) {
  this.find(query, function (err, results) {
    callback(err, results[0]);
  });
}

function save (items, callback) {
  var i = 0
    , length = items.length
    , valid = true
    , Model = this.prototype.Model
    , done = []

  items = (isArray(items)) ? items.slice(0) : [items];
  for (; i < length; i++) {
    valid = (function (item, i) {
      if (! (item instanceof Model)) {
        setTimeout(function () { 
          callback(new Error("Item at index '"+ i +"' in items array is not a valid model instance")); 
        }, 0);
        return false;
      }

      return true;
    })(items[i], i);
    // if not valid break and return from the loop
    if (!valid) return false;
  }
  
  !function saveAll (err) {
    if (!items.length) return callback(null, (done.length === 1)? done[0] : done);
    if (err) return callback(err);
    var item = items.shift()
    done.push(item);
    item.save(saveAll);
  }();
}

function remove (query, callback) {
  var name = this.modelName.toLowerCase()
  this.find(query, function (err, results, collection, db) {
    var ids = results.map(function (item) { return item._id; });
    collection = collection.filter(function (item) {
      return !inArray(ids, item._id);
    });

    db.put(name, JSON.stringify(collection), function (err) {
      if (err) return callback(err);
      callback(null, ids.length);
    });
  });
}

/**
 * Creates a named model
 * 
 * @param {String} name
 * @param {Object} schema
 * @param {Object} options
 */
function model (name, schema, options) {
  var Model
  schema = new draft.Schema(schema, options);
  // instance _id place holdr
  schema.add('_id', Number);
  // place holder for the modelName attribute
  schema.add('modelName', { static: true, value: name, type: String });
  // place holder for the modelName attribute
  schema.add('db', { static: true, type: Function, value: function () { 
    return this.prototype.db; 
  }});

  /**
   * use plugin function
   */
  schema.add('use', { static: true, type: Function,  value: function (type, instance) {
    switch (type) {
      case 'db':
        Model.db = Model.prototype.db = instance;
      break;
    }
  }});

  /**
   * find() function
   */
  schema.add('find', { static: true, type: Function, value: find});

  /**
   * findOne() function
   */
  schema.add('findOne', { static: true, type: Function, value: findOne});

  /**
   * save() function
   */
  schema.add('save', { static: true, type: Function, value: save});

  /**
   * remove() function
   */
  schema.add('remove', { static: true, type: Function, value: remove});
    
  // create the model constructor instance
  Model = schema.createModel(null, proto);
  // set the name so it exists since we defined it as a schema static property
  Model.modelName = Model.prototype.modelName = name;
  Model.prototype.Model = Model;
  return Model;
}

/**
 * Model prototype
 */
var proto = {};

/**
 * Save operation
 * 
 */
proto.save = function (callback) {
  var self  = this
    , name  = this.modelName.toLowerCase()
    , clean = this.toObject()
    , _id

  if (typeof this.db !== 'object') 
    throw new Error("Missing db handle");


  function addToCollection () {
    self.db.get(name, function (err, collection) {
      if (err) return callback(err);
      collection = JSON.parse(collection);
      clean._id = collection.length;
      collection.push(clean);
      self.db.put(name, JSON.stringify(collection), function (err) {
        if (err) return callback(err);
        self._id = _id;
        callback(null, clean, collection);
      });
    });
  }

  this.db.get(name, function (err, collection) {
    if (err !== null && err.name.toLowerCase() === 'notfounderror') {
      self.createCollection(function (err) {
        if (err) return callback(err);
        else addToCollection();
      });
    }
    else {
      addToCollection();
    }
  });
};


/**
 *
 */
proto.createCollection = function (callback) {
  var name = this.modelName.toLowerCase();
  if (typeof this.db !== 'object') throw new Error("Missing db handle");
  this.db.put(name, JSON.stringify([]), function (err) {
    return callback(err);
  });
};

proto.removeCollection = function (callback) {

};

proto.remove = function (callback) {
  var name = this.modelName.toLowerCase()
  if (typeof this.db !== 'object') throw new Error("Missing db handle");
  this.Model.remove({ _id: this._id }, callback);
};