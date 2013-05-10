/**
 * Module Dependencies
 */
var draft = require('draft')

/**
 * Exports
 */
module.exports = model

/**
 * Creates a named model
 * 
 * @param {String} name
 * @param {Object} schema
 * @param {Object} options
 */
function model (name, schema, options) {
  schema = new draft.Schema(schema, options);
  schema.add('modelName', { static: true, value: name, type: String });
  schema.add('use', { static: true, type: Function,  value: function (db) {
    Model.db = Model.prototype.db = db;
  }});
  
  var Model = schema.createModel(null, proto);
  
  Model.modelName = Model.prototype.modelName = name;
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
  if (!this.db) throw new Error("Missing db handle");
  this.db.get(this.modelName, function (collection) {
      
  });
};