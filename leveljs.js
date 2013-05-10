!function () {
	window.leveljs = require('level-js')

	/**
	 * PATCH for empty arrays
	 * @see https://github.com/maxogden/level.js/blob/master/index.js#L39
	 */
	var get = leveljs.prototype.get
	leveljs.prototype.get = function (key, options, callback) {
		callback = (typeof callback === 'function')? callback : options;
		options = (typeof options === 'object')? options : { asBuffer: false }
		return get.call(this, key, options, callback)
	};
}();