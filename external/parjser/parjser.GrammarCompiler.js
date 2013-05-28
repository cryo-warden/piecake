/*
    Copyright Roland Bouman
    Roland.Bouman@gmail.com
    http://rpbouman.blogspot.com/
 
    This file is part of parjser: http://code.google.com/p/parjser

    parjser is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as
    published by the Free Software Foundation, either version 3
    of the License, or (at your option) any later version.

    parjser is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Lesser Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with parjser.  If not, see <http://www.gnu.org/licenses/>.
 */


(function(){

parjser.GrammarCompiler = function(){
};

parjser.GrammarCompiler.compile = function(conf){
    var symbol, rule, compiledRule, startSymbol,
        tokens,
        rules = conf.rules ? conf.rules : {},
        prune = conf.prune ? true : false,
        tokenizer, 
        compiledRules = {},
        compiledGrammar = {
            tokens: null,
            tokenizer: null,
            rules: null,
            prune: prune
        },
        parserClass = conf.parserClass ? conf.parserClass : parjser.TopDownParser,
        parserClassPrototype = parserClass.prototype,
        parseEmpty = parserClassPrototype.parseEmpty,
        parseChoice = parserClassPrototype.parseChoice,
        parseSequence = parserClassPrototype.parseSequence,
        parseToken = parserClassPrototype.parseToken,
        parseRule = parserClassPrototype.parseRule
    ;

    var initTokens = function(){
        if (conf.tokens){
            tokens = conf.tokens;
        }
        else {
            tokens = {};
            r = {};
            for (rule in rules){
                compiledRule = rules[rule];
                if (compiledRule instanceof RegExp){
                    tokens[rule] = compiledRule;
                }
                else {
                    r[rule] = compiledRule;
                }
            }
            rules = r;
        }
        compiledGrammar.tokens = tokens;
    };

    var initTokenizer = function(){
        if (conf.tokenizer) {
            tokenizer = conf.tokenizer;
        }
        else {
            tokenizer = new parjser.RegexTokenizer({
                tokens: tokens,
                ignoreCase: conf.ignoreCase,
                ignoreTokens: conf.ignoreTokens
            });
        }
        compiledGrammar.tokenizer = tokenizer; 
    };
    
    var initStartSymbol = function() {    
        if (conf.startSymbol) {
            startSymbol = conf.startSymbol;
        }
        else {
            for (startSymbol in rules) {
                break;
            }
        }
        if (!rules[startSymbol]) {
            throw "No rule found for symbol " +  startSymbol;
        }
        compiledGrammar.startSymbol = startSymbol;
    };
    
    var setCardinality = function(compiledRule, array, i){
        var i, arrayLength = array.length, nextElement, cardinality;
        nextElement = i+1;
        if (nextElement < arrayLength){
            cardinality = array[nextElement];
            if (typeof(cardinality)==="string"){
                i = nextElement;
                switch(cardinality) {
                    case "?":
                        compiledRule.minOccurs = 0;
                        compiledRule.maxOccurs = 1;
                        break;
                    case "+":
                        compiledRule.minOccurs = 1;
                        compiledRule.maxOccurs = Number.POSITIVE_INFINITY;
                        break;
                    case "*":
                        compiledRule.minOccurs = 0;
                        compiledRule.maxOccurs = Number.POSITIVE_INFINITY;
                        break;
                    default:
                        match = /^\{(\d+)(,(\d+))?\}$/.exec(cardinality);
                        if (match && match[0]===cardinality){
                            if (match[1]) {
                                compiledRule.minCardinality = parseInt(match[1],10);
                            }
                            else {
                                compiledRule.minCardinality = 1;
                            }
                            if (match[3]) {
                                compiledRule.maxCardinality = parseInt(match[3],10);
                            }
                            else {
                                compiledRule.maxCardinality = 1;
                            }
                        }
                        else {
                            i--;
                        }
                }
            }
        }
        if (typeof(compiledRule.minOccurs)==="undefined"){
            compiledRule.minOccurs = 1;
        }
        if (typeof(compiledRule.maxOccurs)==="undefined"){
            compiledRule.maxOccurs = 1;
        }
        return i;
    };

    var compileRule = function(rule, compiledRule){
        var ruleLength, i, ruleParts, rulePart,
            existingCompiledRule, func, rulePartMinOccurs,
            property, first
            ;
        if (!compiledRule){
            compiledRule = {
                first: {}
            };
        }
        compiledRule.originalRule = rule;
        if (rule instanceof Array){
            ruleLength = rule.length;
            if (ruleLength===0){
                compiledRule.func = parseEmpty;
            }
            else {
                ruleParts = [];
                compiledRule.ruleParts = ruleParts;
                if (rule[0]==="|"){
                    func = parseChoice;
                    i = 1;
                }
                else {
                    func = parseSequence;
                    i = 0;
                }
                compiledRule.func = func;
            }
            rulePartMinOccurs = 0;
            for (; i<ruleLength; i++) {
                rulePart = rule[i];
                if (typeof(rulePart)==="undefined"){
                    throw "Undefined rulepart at index " + i +
                            " in rule " + JSON.stringify(rule);
                }
                rulePart = compileRule(rulePart);
                i = setCardinality(rulePart, rule, i);
                first = rulePart.first;
                if (func===parseChoice ||
                   (func===parseSequence && rulePartMinOccurs===0)
                ){
                    for (property in first) {
                        if (!compiledRule.first[property]){
                            compiledRule.first[property] = {};
                        }
                        compiledRule.first[property][ruleParts.length] = true;
                    }
                }
                rulePartMinOccurs += rulePart.minOccurs;
                compiledRule.ruleParts.push(rulePart);
            }
            if (rulePartMinOccurs===0) {
                compiledRule.minOccurs = 0;
            }
        }
        else
        if (typeof(rule)==="string"){
            if (tokens[rule]){
                compiledRule.token = rule;
                compiledRule.func = parseToken;
                first = {};
                first[rule] = {"0": true};
                compiledRule.first = first;
            }
            else
            if (rules[rule]){
                existingCompiledRule = compiledRules[rule];
                if (!existingCompiledRule) {
                    existingCompiledRule = {
                        symbol: rule,
                        minOccurs: 1,
                        maxOccurs: 1,
                        first: {}
                    };
                    existingCompiledRule.first[rule] = {"0": true};
                    compiledRules[rule] = existingCompiledRule;
                    compileRule(rules[rule], existingCompiledRule);
                }
                for (property in existingCompiledRule){
                    compiledRule[property] = existingCompiledRule[property];
                }
            }
            else {
                throw rule + " is neither a token nor a symbol.";
            }
        }
        else
        if (rule===null){
            compiledRule.func = parseEmpty;
        }
        return compiledRule;
    };

    var fixFirst = function(){
        var ruleName, compiledRule, first, symbol, symbols,
            rule, ruleFirst, token, firstToken, index, indexes;
        for (ruleName in compiledRules){
            compiledRule = compiledRules[ruleName];
            symbols = {};
            first = compiledRule.first;
            //identify all non-terminals in the first set
            for (symbol in first){
                rule = compiledRules[symbol];
                if(rule){
                    symbols[symbol] = rule;
                }
            }
            //replace non-terminals with all terminals in their first set
            for (symbol in symbols) {
                indexes = first[symbol];
                delete first[symbol];
                if (symbol===ruleName){
                    continue;
                }
                rule = symbols[symbol];
                ruleFirst = rule.first;
                for (token in ruleFirst) {
                    if (compiledRules[token]){
                        continue;
                    }
                    firstToken = first[token];
                    if (!firstToken){
                        firstToken = {};
                        first[token] = firstToken;
                    }
                    for (index in indexes) {
                        firstToken[index] = true; 
                    }
                }
            }
        }
    };

    var makeArray = function(rule){
        var first, token, index, array,
            ruleParts, numRuleParts, i, rulePart;
        rule.fixed = true;
        first = rule.first;
        for (token in first){
            indexes = first[token];
            if (indexes instanceof Array) {
                continue;
            }
            array = [];
            for (index in indexes){
                array.push(parseInt(index,10));
            }
            first[token] = array.sort();
        }
        ruleParts = rule.ruleParts;
        if (ruleParts){
            numRuleParts = ruleParts.length;
            for (i=0; i<numRuleParts; i++){
                rulePart = ruleParts[i];
                if (!rulePart.fixed){
                    makeArray(rulePart);
                }
            }
        }
    };

    var makeArrays = function(){
        var ruleName, compiledRule;
        for (ruleName in compiledRules){
            compiledRule = compiledRules[ruleName];
            makeArray(compiledRule);
        }
    };

    initTokens();
    initTokenizer();
    initStartSymbol();
    compileRule(startSymbol);
    fixFirst();
    makeArrays();
    compiledGrammar.rules = compiledRules;
    compiledGrammar.compiled = true;
    return compiledGrammar;    
}

}());
