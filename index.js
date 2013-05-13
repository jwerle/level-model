/**
 * Module Dependencies
 */
var draft   = require('draft')
  , isArray = Array.isArray

/**
 * Global database instance
 */
var DB = null;

/**
 * Global options
 */
var OPTS = {};

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
 * Merges two or objects together. Also performs deep merging
 *
 * @api private
 * @param {Object} object 
 * @param {Object} objectN
 */
function merge(target, source) {
  for (var property in source) {
    try {
      target[property] = (typeof source[property] !== 'object')? source[property]
                          : merge(target[property], source[property]);
    } 
    catch(e) {
      target[property] = source[property];
    }
  }

  return target;
}

/**
 * Basic validation of a proper interface for a model to work with
 *
 * @api private
 * @param {Object} database
 */
function hasLevelUpDatabaseInterface (database) {
  var pass = true;
  
  if (database === null || database === undefined || typeof database !== 'object')
    return false;

  pass = ['get', 'put', 'del', 'open', 'close'].every(function (method) {
    return (typeof database[method] === 'function');
  });

  return pass;
}

/**
 * Performs a transaction on a database LevelUp interface database
 *
 * @api private
 * @param {Object} scope
 * @param {Object} db
 * @param {String} op
 * @param {Array} args
 * @param {Function} callback
 */
function transaction(scope, db, op, args, callback) {
  function exec (cb) {
    db[op].apply(db, args.concat(cb));
  }


  function trans () {
    exec(function (err) {
      var a = arguments
      if (err) return callback(err);
      if (OPTS.persist === true) {
        callback.apply(scope, a);
      }
      else {
        db.close(function (err) {
          if (err) return callback(err);
          else return callback.apply(scope, a);
        });
      }
    });
  }

  if (typeof db.isOpen === 'function' && !db.isOpen()) db.open(trans);
  else trans();
}

/**
 * Creates a named model
 * 
 * @api public
 * @param {String} name
 * @param {Object} schema
 * @param {Object} options
 */
function model (name, schema, options) {
  var Model
  schema = new draft.Schema(schema, options);
  // place holder for the modelName attribute
  schema.add('modelName', { static: true, value: name, type: String });
  // place holder for the modelName attribute
  schema.add('db', { static: true, type: Function, value: function () {
    return db;
  }});

  /**
   * use plugin function
   */
  var db
  schema.add('use', { static: true, type: Function,  value: function (type, thing) {
    switch (type) {
      case 'db':
        db = thing;
      break;
    }

    if (!thing) Model.prototype[type] = thing;
  }});

  /**
   * internal data table
   */
  var internal = {};

  /**
   * Internals operation function
   *
   * @api private
   * @function Internals
   * @param {String} table
   * @param {String} key
   * @param {Mixed} value - optional
   */
  function Internals (table, key, value) {
    // set
    if (value !== undefined) {
      if (typeof internal[table] !== 'object')
        internal[table] = {};

      if (isArray(value) && !internal[table][key]) {
        internal[table][key] = value;
      }
      else if (isArray(internal[table[key]])) {
        internal[table][key].push(value);
      }
      else {
        internal[table][key] = value;
      }
    }
    // get
    else if (table && key) {
      value = (internal[table])? (internal[table][key] || internal[table][key +':link']) : null;
      value = (typeof value === 'function')? value() : value;
      return value;
    }
  }
    
  // create the model constructor instance
  Model = schema.createModel(null, LevelModel.prototype);
  // set the name so it exists since we defined it as a schema static property
  Model.modelName = Model.prototype.modelName = name;
  Model.prototype.Model = Model;

  /**
   * Private implementation of save
   * 
   * @see LevelModel#save
   */
  Model.prototype.save = function (callback) {
    db = db || DB;
    if (!db || (db && !hasLevelUpDatabaseInterface(db)))
      throw new TypeError("Invalid database used with model. Must at least support .open(), .close(), .get(), .put(), and .del()");

    if (typeof Internals('saved', 'name') !== 'string') 
      throw new TypeError("Please use .saveAs() first to set name");
    
    transaction(this, db, 'put', [Internals('saved', 'name'), this], callback);
  };

  /**
   * Private implementation of saveAs
   * 
   * @see LevelModel#saveAs
   */
  Model.prototype.saveAs = function (name, callback) {
    Internals('saved', 'name', name);
    if (typeof callback === 'function') this.save(callback);
    return this;
  };

  /**
   * Private implementation of read
   * 
   * @see LevelModel#read
   */
  Model.prototype.read = function (callback) {
    if (typeof Internals('saved', 'name') !== 'string') 
      throw new TypeError("Please use .saveAs() first or .readAs()");
    return this.readAs(Internals('saved', 'name'), callback);
  };

  /**
   * Private implementation of readAs
   * 
   * @see LevelModel#readAs
   */
  Model.prototype.readAs = function (name, callback) {
    db = db || DB;
    if (!db || (db && !hasLevelUpDatabaseInterface(db)))
      throw new TypeError("Invalid database used with model. Must at least support .open(), .close(), .get(), .put(), and .del()");

    var self = this
    transaction(this, db, 'get', [name], function (err, data) {
      if (err) return callback(err);
      return callback(null, self.unserialize(data))
    });
  };

  /**
   * Private implementation of remove
   * 
   * @see LevelModel#remove
   */
  Model.prototype.remove = function (callback) {
    if (typeof Internals('saved', 'name') !== 'string') 
      throw new TypeError("Please use .saveAs() first or .removeAs()");
    return this.removeAs(Internals('saved', 'name'), callback);
  };

  /**
   * Private implementation of removeAs
   * 
   * @see LevelModel#removeAs
   */
  Model.prototype.removeAs = function (name, callback) {
    db = db || DB;
    if (!db || (db && !hasLevelUpDatabaseInterface(db)))
      throw new TypeError("Invalid database used with model. Must at least support .open(), .close(), .get(), .put(), and .del()");

    transaction(this, db, 'del', [name], callback);
  };

  /**
   * Private implementation of toString
   *
   * @see LevelModel#toString
   */
  Model.prototype.toString = function () {
    return this.serialize();
  };

  // set DB is defined
  if (hasLevelUpDatabaseInterface(DB))
    Model.use('db', DB);

  return Model;
}

/**
 * Sets an options for all model instances
 *
 * @api public
 * @function model.set
 * @param {String} key
 * @param {String} value
 */
model.set = function (key, value) {
  switch (key) {
    case 'persist' :
      OPTS.persist = value;
      return true;
    break;
    case 'db':
    case 'database':
      if (hasLevelUpDatabaseInterface(value)) {
        OPTS.db = DB = value;
        return true;
      }
    break;

    default:
      OPTS[key] = value;
    break;
  }
  return false;
};

/**
 * gets an options for all model instances
 *
 * @api public
 * @function model.get
 * @param {String} key
 */
model.get = function (key) {
  return OPTS[key];
};

/**
 * Generic LevelModel constructor
 *
 * @api public
 * @constructor LevelModel
 */
function LevelModel () {}

/**
 * Serializes a model into a JSON string
 *
 * @api public
 * @function LevelModel#Serializes
 */
LevelModel.prototype.serialize = function () {
  return JSON.stringify(this.toObject());
};

/**
 * Unserializes data into a LevelModel instance
 *
 * @api public
 * @function LevelModel#unserialize
 * @param {Object} data
 */
LevelModel.prototype.unserialize = function (data) {
  data = (typeof data === 'string')? JSON.parse(data) : data;
  return merge(this, data);
};

/**
 * Save a model to a database
 *
 * @note A name must be saved otherwise an error will be thrown
 * @api public
 * @function LevelModel#save
 * @param {Function} callback
 */
LevelModel.prototype.save = function (callback) {};

/**
 * Save a model by name
 *
 * @note If a callback is omitted then a save is not performed, but the name is stored.
 * @api public
 * @function LevelModel#saveAs
 * @param {String} name
 * @param {Function} callback - optional
 */
LevelModel.prototype.saveAs = function (name, callback) {};

/**
 * Read a models data from the database
 *
 * @note Will throw a NotFound error if not found in database
 * @api public
 * @function LevelModel#read
 * @param {Function} callback
 */
LevelModel.prototype.read = function (callback) {};

/**
 * Read a models data from the database by a given name
 *
 * @note Will throw a NotFound error if not found in database
 * @api public
 * @function LevelModel#readAs
 * @param {String} name
 * @param {Function} callback
 */
LevelModel.prototype.readAs = function (name, callback) {};

/**
 * Removes a model from the database
 *
 * @note Will throw a NotFound error if not found in database
 * @api public
 * @function LevelModel#read
 * @param {Function} callback
 */
LevelModel.prototype.remove = function (callback) {};

/**
 * Removes a model from the database by a given name
 *
 * @note Will throw a NotFound error if not found in database
 * @api public
 * @function LevelModel#removeAs
 * @param {String} name
 * @param {Function} callback
 */
LevelModel.prototype.removeAs = function (name, callback) {};

/**
 * String representation of a LevelModel which is a 
 * JSON serialized object
 *
 * @api public
 * @function LevelModel#toString
 */
LevelModel.prototype.toString = function () {};