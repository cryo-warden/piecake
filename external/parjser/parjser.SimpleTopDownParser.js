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

(function () {

parjser.SimpleTopDownParser = function(conf) {
    this.init(conf);
    this.prune = conf.prune;
    return this;
}

parjser.SimpleTopDownParser.prototype = {
    init: function(conf){
        this.tokens = conf.tokens ? conf.tokens : {};
        this.tokenizer = conf.tokenizer ? conf.tokenizer
                                        : new parjser.RegexTokenizer(conf);
        this.rules = conf.rules ? conf.rules : {};
        this.startSymbol = conf.startSymbol;
        this.tokenBuffer = null;
        this.tokenBufferPointer = null;
    },
    isToken: function(symbol){
        return symbol in this.tokens;
    },
    getRule: function(symbol){
        var r = this.rules[symbol];
        if (!r){
            throw "No rule found for symbol \""+symbol+"\"";
        }
        return r;
    },
    initTokenBuffer: function(){
        this.tokenBuffer = [];
        this.tokenBufferPointer = -1;
    },
    nextToken: function(){
        var token,
            tokenBufferPointer = ++this.tokenBufferPointer,
            tokenBuffer = this.tokenBuffer
        ;
            
        if (tokenBufferPointer < tokenBuffer.length) {
            token = tokenBuffer[tokenBufferPointer];
        }
        else {
            token = this.tokenizer.nextToken();
            tokenBuffer.push(token);
        }
        return token;
    },
    parseRule: function(rule, parentNode, rulePartIndex, recurrenceIndex){
        var isEOF, success, node = {
            offset: this.tokenizer.offset,
            tokenBufferPointer: this.tokenBufferPointer
        };
        if (rule instanceof Array) {
            if (rule.length===0){
                success = this.parseEmpty();
            }
            else
            if (rule[0]==="|"){
                success = this.parseChoice(rule, node);
            }
            else {
                success = this.parseSequence(rule, node);
            }
        }
        else
        if (typeof(rule)==="string") {
            if (rule.length===0){
                success = this.parseEmpty();
            }
            else {
                success = this.parseSymbol(rule, node)
            }                
        }
        else
        if (rule === null) {
            success = this.parseEmpty();
        }
        else
        if (rule===parjser._EOF){
            if (this.nextToken()===parjser._EOF){
                success = true;
                isEOF = true;
            }
            else {
                success = false;
            }
        }
        else
        if (rule === parjser._DEBUGGER){
            success = true;
            debugger;
        }
        else {
            debugger;
            throw   "Invalid rule: " + JSON.stringify(rule);
        }
        if (success) {
            node.type = rule;
            node.rulePartIndex = rulePartIndex;
            node.recurrenceIndex = recurrenceIndex;
            if(parentNode && (isEOF !== true)) {
                if (!parentNode.children) {
                    parentNode.children = [];
                }
                node.parentNode = parentNode;
                parentNode.children.push(node);
            }
        }
        else {
            this.tokenBufferPointer = node.tokenBufferPointer;
        }
        return success;
    },
    parseToken: function(symbol, node){
        var token = this.nextToken(), success;
        if (token.type === symbol){
            success = true;
            node.token = token;
        }
        else {
            success = false;
        }
        return success;
    },
    parseEmpty: function(){
        return true;
    },
    parseSequence: function(array, node){
        var numElements = array.length,
            i, element, success,
            j, cardinality, minCardinality, maxCardinality;
        for (i=0; i<numElements; i++){
            element = array[i];
            if (i+1 < numElements) {
                cardinality = array[i+1];
                switch(cardinality) {
                    case "?":
                        minCardinality = 0;
                        maxCardinality = 1;
                        break;
                    case "*":
                        minCardinality = 0;
                        maxCardinality = Number.POSITIVE_INFINITY;
                        break;
                    case "+":
                        minCardinality = 1;
                        maxCardinality = Number.POSITIVE_INFINITY;
                        break;
                    default:
                        var match;
                        match = /\{(\d+)(,(\d+))?\}/.exec(
                            cardinality
                        ); 
                        if (match && match[0]===cardinality){
                            if (match[1]) {
                                minCardinality = parseInt(match[1],10);
                            }
                            else {
                                minCardinality = 1;
                            }
                            if (match[3]) {
                                maxCardinality = parseInt(match[3],10);
                            }
                            else {
                                maxCardinality = 1;
                            }
                        }
                        else {
                            cardinality = null;
                            minCardinality = 1;
                            maxCardinality = 1;
                        }
                }
            }
            else {
                cardinality = null;
                minCardinality = 1;
                maxCardinality = 1;
            }
            for (j=0; j<minCardinality; j++) {
                if (!this.parseRule(element, node, i, j)){
                    return false;
                }
            }
            for (; j<maxCardinality; j++) {
                if (!this.parseRule(element, node, i, j)){
                    break;
                }
            }
            if (cardinality!==null){
                i++;
            }
        }
        return true;
    },
    parseChoice: function(array, node){
        var i, numElements = array.length, element;
        for (i=1; i<numElements; i++){
            element = array[i];
            if (this.parseRule(element, node, i)){
                return true;
            }
        }
        return false;
    },
    parseSymbol: function(symbol, node) {
        var success, rule;
        if (this.isToken(symbol)) {
            success = this.parseToken(symbol, node);
        }
        else {
            if (this.tokenBufferPointer === this.tokenBuffer.length-1) {
                this.lastSymbol = symbol;
            }
            rule = this.getRule(symbol);
            success = this.parseRule(rule, node);
        }
        return success;
    },
    parse: function(text, symbol) {
        if(!symbol){
            if (this.startSymbol) {
                symbol = this.startSymbol;
            }
            else {
                throw "No symbol specified or implied";
            }
        }
        var rule = [symbol, parjser._EOF];
        this.tokenizer.setText(text);
        this.initTokenBuffer();
        this.tree = {};
        this.lastSymbol = null;
        if (!this.parseRule(rule, this.tree)){
            this.throwSyntaxErrorException();
        }
        return this.tree.children[0].children[0];
    },
    throwSyntaxErrorException: function(){
        var tokenBuffer = this.tokenBuffer,
            tokenBufferLength = tokenBuffer.length,
            exception = new parjser.SyntaxErrorException(
                this.tokenizer,
                tokenBufferLength ? tokenBuffer[tokenBufferLength-1] : null,
                this.lastSymbol ? this.lastSymbol : this.currentSymbol
            );
        throw exception;
    }
};

}());
