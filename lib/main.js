define(['piecake/external/lodash.min', './makeTree', './deparse'], function (_, makeTree, deparse) {
	'use strict';

	var piecake = function parse(code) {
		var tree = makeTree(code);
		var jsCode = deparse(tree);
		return jsCode;
	};
	
	piecake.makeTree = makeTree;
	piecake.deparse = deparse;
	
	return piecake;
});