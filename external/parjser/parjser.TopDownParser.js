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

parjser.TopDownParser = function(grammar){
    if (grammar.compiled) {
        this.grammar = grammar;
    }
    else {
        this.grammar = parjser.GrammarCompiler.compile(grammar);
    }
    this.tokenizer = this.grammar.tokenizer;
    this.prune = this.grammar.prune;
    return this;
}

parjser.TopDownParser.prototype = {
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
    parseRule: function(rule, parentNode){
        var node, prune = this.prune, numChildren,
            i=0, func = rule.func,
            maxOccurs = rule.maxOccurs,
            tokenBufferPointer
        ;
        for (; i<maxOccurs ; i++) {
            tokenBufferPointer = this.tokenBufferPointer;
            node = {children: []};
            if (func.call(this, rule, node)){
                node.offset = this.tokenizer.offset;
                node.tokenBufferPointer = tokenBufferPointer;
                node.type = rule;
                node.parentNode = parentNode;
                if (prune){
                    numChildren = node.children.length;
                    if (numChildren===1){
                        node = node.children[0];
                    }
                }
                parentNode.children.push(node);
            }
            else {
                this.tokenBufferPointer = tokenBufferPointer;
                node.children = null;
                node.parentNode = null;
                node.type = null;
                break;
            }
        }
        return i>=rule.minOccurs;
    },
    parseEmpty: function(rule, node){
        return true;
    },
    parseToken: function(rule, node){
        var token = this.nextToken();
        if (token.type === rule.token){
            node.token = token;
            return true;
        }
        else {
            return false;
        }
    },
    parseEOF: function(rule, node){
        return this.nextToken()===parjser._EOF;
    },
    parseChoice: function(rule, node) {
        var i=0,
            ruleParts = rule.ruleParts,
            numRuleParts = ruleParts.length;
        for (; i<numRuleParts; i++){
            if (this.parseRule(ruleParts[i], node)) {
                return true;
            }
        }
        return false;
    },
    parseSequence: function(rule, node){
        var i=0,
            ruleParts = rule.ruleParts,
            numRuleParts = ruleParts.length;
        for (; i<numRuleParts; i++){
            if (!this.parseRule(ruleParts[i], node)) {
                return false;
            }
        }
        return true;
    },
    initParse: function(text, symbol){
        if(!symbol){
            if (!(symbol = this.grammar.startSymbol)) {
                throw "No symbol specified or implied";
            }
        }

        var rule = this.grammar.rules[symbol];
        rule = {
            func: parjser.TopDownParser.prototype.parseSequence,
            ruleParts: [rule, parjser._EOF],
            minOccurs: 1, maxOccurs: 1
        };

        this.tokenizer.setText(text);
        this.initTokenBuffer();
        this.tree = {
            children: []
        };

        return rule;
    },
    parse: function(text, symbol){
        var rule = this.initParse(text,symbol);
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
    
parjser._EOF.func = parjser.TopDownParser.prototype.parseEOF;
parjser._EOF.minOccurs = 1;
parjser._EOF.maxOccurs = 1;

}());
