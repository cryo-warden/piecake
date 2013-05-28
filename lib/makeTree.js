define(['piecake/external/lodash.min'], function (_) {
	'use strict';
	
	var grammar = {
		startSymbol: 'program',
		ignoreTokens: { whitespace:true },
		tokens:  {
			whitespace: /\s+|\/\/[^\n]*(\n|$)|\/\*([^*]|\*(?!\/))*\*\//,

			keywordIf: /if/, keywordElse: /else/,
			keywordFor: /for/,
			keywordReturn: /return/,
			keywordModule: /module/,
			keywordInclude: /include/,
			keywordImport: /import/,
			keywordEnd: /end/,

			identifier: /[a-zA-Z]+/,
			numericLit: /\d*\.?\d+([eE][\-+]?\d+)?/,
			stringLit1: /'(?:[^'\\]|\\'|\\\\)*'/, stringLit2: /"(?:[^"\\]|\\"|\\\\)*"/,

			parenL: /\(/, parenR: /\)/,
			brackL: /\[/, brackR: /\]/,
			braceL: /\{/, braceR: /\}/,

			bindOp: /:=/,
			incDecOp: /\+\+|\-\-/,
			assignOp: /\=|\+=|\-=|\*=|\/=|%=|\^=|\|\|=|&&=/,

			powOp: /\^/,
			addSubOp: /\+|\-/,
			compareOp: /\==|!=|<=|>=|<|>/,
			logicOp: /\|\||&&/,

			comma: /,/,
			dot: /\./,
			semicolon: /;/,
			colon: /:/,
			at: /@/,
			hash: /#/,
			backslash: /\\/,
			tilde: /~/,
			bang: /!/,
			asterisk: /\*/,
			slash: /\//,
			percent: /%/
		}, // still needs full assignment rules, including @identifier handling
		rules:  {
			mulDivOp: ['|', 'asterisk', 'slash', 'percent'],
			unOp: ['|', 'addSubOp', 'tilde', 'bang'],
			memberOp: ['|', ['dot', 'identifier'], ['brackL', 'expr', 'brackR']],
			callOp: ['parenL', ['expr', ['comma', 'expr'], '*', 'optionalComma'], '?', 'parenR'],

			block: ['braceL', 'statement', '*', 'braceR'],
			optionalComma: ['comma', '?'],

			stringLit: ['|', 'stringLit1', 'stringLit2'],
			objectField: [['|', 'identifier', 'stringLit'], 'colon', 'expr'],
			objectLit: ['braceL', ['objectField', ['comma', 'objectField'], '*', 'optionalComma'], '?', 'braceR'],
			arrayLit: ['brackL', ['expr', ['comma', 'expr'], '*', 'optionalComma'], '?', 'brackR'],

			paramList: [['identifier', ['comma', 'identifier'], '*', 'optionalComma'], '?'],
			funcLit: ['backslash', 'paramList', ['|', 'block', 'atom']],
			includeLit: ['keywordInclude', 'stringLit'],
			importLit: ['keywordImport', 'stringLit'],

			literal: ['|', 'numericLit', 'stringLit', 'objectLit', 'arrayLit', 'funcLit', 'importLit', 'includeLit'],

			lvalue: ['|', 'memberCallExpr', ['at', '?', 'identifier']],
			atom: ['|', ['at', '?', 'identifier'], 'at', 'literal', ['parenL', 'expr', 'parenR']],

			memberCallExpr: ['atom', ['|', 'callOp', 'memberOp'], '+'],
			unExpr: ['unOp', '*', ['|', 'memberCallExpr', 'atom']],
			powExpr: ['unExpr', ['powOp', 'unExpr'], '*'],
			mulDivExpr: ['powExpr', ['mulDivOp', 'powExpr'], '*'],
			addSubExpr: ['mulDivExpr', ['addSubOp', 'mulDivExpr'], '*'],
			compareExpr: ['addSubExpr', ['compareOp', 'addSubExpr'], '*'],
			logicExpr: ['compareExpr', ['logicOp', 'compareExpr'], '*'],
			assignExpr: ['|', ['lvalue', ['|', ['assignOp', 'expr'], 'incDecOp']], ['incDecOp', 'lvalue']],
			expr: [['|', 'assignExpr', 'logicExpr'], '+'],

			elseClause: ['keywordElse', ['|', 'block', 'ifStatement']],
			ifStatement: ['keywordIf', 'expr', 'block', 'elseClause', '?'],
			forStatement: ['keywordFor', 'expr', '?', 'block'],
			returnStatement: ['keywordReturn', ['expr', '?'], 'semicolon'],
			bindStatement: ['identifier', 'bindOp', 'expr', 'semicolon'],
			exprStatement: ['expr', 'semicolon'],
			statement: ['|', 'ifStatement', 'forStatement', 'returnStatement', 'bindStatement', 'exprStatement'],

			moduleBeginStatement: ['keywordModule', 'identifier', '?', 'semicolon'],
			moduleEndStatement: ['keywordEnd', 'keywordModule', 'expr', '?', 'semicolon'],
			module: ['moduleBeginStatement', 'statement', '*', 'moduleEndStatement'],
			program: ['module', '*']
		}
	};

	var makeParser = function () { return new parjser.TopDownParser(grammar); };

	var makeParjserTree = function (code) {
		try {
			var tree = makeParser().parse(code);
		} catch (err) {
			console.error(err);
			return null;
		}
		return tree;
	};
	
	var makeNode = function (oldNode) {
		var symbol = oldNode.type.symbol;
		var token = oldNode.type.token;
		if (token) {
			return {
				type: token,
				text: oldNode.token.text
			};
		} else {
			return {
				type: symbol || 'choice',
				children: _.map(oldNode.children, makeNode)
			};
		}
	};
	
	var makeTree = function (code) {
		var oldTree = makeParjserTree(code);
		var tree = makeNode(oldTree);
		return tree;
	};
	
	return makeTree;
});