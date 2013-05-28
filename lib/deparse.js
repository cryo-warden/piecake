define(['piecake/external/lodash.min'], function (_) {
	'use strict';

	var ret = function (text) { return function () { return text; }; };
	var returnEmptyString = ret('');

	var getTab = ret('    ');
	var indent = function (state) { state.indentLevel++; };
	var dedent = function (state) { state.indentLevel--; };
	var lineFeed = function (state) {
		var tabs = _.map(_.range(state.indentLevel), getTab).join('');
		return '\r\n' + tabs;
	};

	var deparseNodes = function (nodes, state) {
		return _.map(nodes, function (childNode) {
			return deparse(childNode, state);
		}).join('');
	};
	
	var deparseChildren = function (node, state) {
		return deparseNodes(node.children, state);
	};
	
	var lfDeparseChildren = function (node, state) {
		return lineFeed(state) + deparseChildren(node, state);
	};
	
	var deparseToken = function (node, state) {
		return node.text;
	};
	
	var deparseTokenSpace = function (node, state) {
		return node.text + ' ';
	};
	
	var lfDeparseToken = function (node, state) {
		return lineFeed(state) + node.text;
	};
	
	var asBlock = function (createContent, state) {
		var result = '{';
		indent(state);
		result += createContent();
		dedent(state);
		result += lineFeed(state) + '}';
		return result;
	};
	
	var deparsers = {
		keywordIf: deparseTokenSpace, keywordElse: deparseTokenSpace,
		keywordFor: deparseTokenSpace,
		keywordReturn: deparseTokenSpace,
		keywordModule: returnEmptyString,
		keywordInclude: returnEmptyString,
		keywordImport: returnEmptyString,
		keywordEnd: returnEmptyString,

		identifier: deparseToken,
		numericLit: deparseToken,
		stringLit1: deparseToken, stringLit2: deparseToken,

		parenL: deparseToken, parenR: deparseToken,
		brackL: deparseToken, brackR: deparseToken,
		braceL: deparseToken, braceR: deparseToken,

		bindOp: ret('='),
		incDecOp: deparseToken,
		assignOp: deparseToken,

		powOp: deparseToken,
		addSubOp: deparseToken,
		compareOp: deparseToken,
		logicOp: deparseToken,

		comma: deparseTokenSpace,
		dot: deparseToken,
		semicolon: deparseToken,
		colon: deparseTokenSpace,
		at: returnEmptyString,
		hash: returnEmptyString,
		backslash: returnEmptyString,
		tilde: deparseToken,
		bang: deparseToken,
		asterisk: deparseToken,
		slash: deparseToken,
		percent: deparseToken,

		mulDivOp: deparseChildren,
		unOp: deparseChildren,
		memberOp: deparseChildren,
		callOp: deparseChildren,

		block: function (node, state) {
			return asBlock(function () {
				return deparseNodes(node.children.slice(1, -1), state);
			}, state);
		},
		optionalComma: returnEmptyString,

		stringLit: deparseChildren,
		objectField: deparseChildren,
		objectLit: deparseChildren,
		arrayLit: deparseChildren,

		paramList: deparseChildren,
		funcLit: function (node, state) {
			var paramListNode = node.children[1];
			var contentNode = node.children[2].children[0];
			var contentText = (
				contentNode.type === 'block' ?
				deparse(contentNode, state) :
				asBlock(function () {
					return lineFeed(state) + 'return ' + deparse(contentNode, state) + ';';
				}, state)
			);
			return 'function (' + deparse(paramListNode, state) + ') ' + contentText;
		},
		includeLit: returnEmptyString,
		importLit: returnEmptyString,

		literal: deparseChildren,

		lvalue: deparseChildren,
		atom: deparseChildren,

		memberCallExpr: deparseChildren,
		unExpr: deparseChildren,
		powExpr: deparseChildren,
		mulDivExpr: deparseChildren,
		addSubExpr: deparseChildren,
		compareExpr: deparseChildren,
		logicExpr: deparseChildren,
		assignExpr: deparseChildren,
		expr: deparseChildren,

		elseClause: returnEmptyString,
		ifStatement: returnEmptyString,
		forStatement: returnEmptyString,
		returnStatement: deparseChildren,
		bindStatement: function (node, state) {
			return 'var ' + deparse(node.children[0], state) + ' = '
			+ deparse(node.children[2], state) + ';';
		},
		exprStatement: deparseChildren,
		statement: lfDeparseChildren,

		moduleBeginStatement: function (node, state) {
			var nameNode = node.children[1];
			indent(state);
			if (nameNode.type === 'identifier') {
				return 'define("' +
				deparse(nameNode, state) +
				'", ["piecake/lib/core"], function (piecake) {';
			} else {
				return 'define(["piecake/lib/core"], function (piecake) {';
			}
		},
		moduleEndStatement: function (node, state) {
			var resultExprNode = node.children[2];
			var returnStatementText = lineFeed(state) +
			'return ' + deparse(resultExprNode, state) + ';';
			dedent(state);
			if (resultExprNode.type === 'expr') {
				return returnStatementText + lineFeed(state) + '});';
			} else {
				return lineFeed(state) + '});';
			}
		},
		module: deparseChildren,
		program: deparseChildren
	};
	
	var deparse = function (node, state) {
		var deparser = deparsers[node.type] || deparseChildren;
		return deparser(node, state);
	};
	
	return function (tree) {
		return deparse(tree, {
			indentLevel: 0,
			imports: [],
			includes: []
		});
	};
});