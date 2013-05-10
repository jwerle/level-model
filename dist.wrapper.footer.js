	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = require('level-model');
	} 
	else {
		if (typeof define === "function" && define.amd) {
			define("level-model", [], function () { return require('level-model'); });
		}
		else if ( typeof window === "object" && typeof window.document === "object" ) {
			window.LevelModel = require('level-model');
		}
	}
}();