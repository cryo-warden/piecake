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

parjser._EOF.first = {};
parjser._EOF.first[parjser._EOF.type] = [0];

var TopDownParser = parjser.TopDownParser,
    TopDownParserPrototype = TopDownParser.prototype
;

parjser.TopDownParserWithLookahead = function(grammar){
    grammar.parserClass = parjser.TopDownParserWithLookahead;
    TopDownParser.call(this, grammar);
};

parjser.TopDownParserWithLookahead.prototype = {
    initTokenBuffer: TopDownParserPrototype.initTokenBuffer,
    nextToken: TopDownParserPrototype.nextToken,
    throwSyntaxErrorException: TopDownParserPrototype.throwSyntaxErrorException,
    parse: TopDownParserPrototype.parse,
    parseEOF: TopDownParserPrototype.parseEOF,
    parseEmpty: TopDownParserPrototype.parseEmpty,
    nextToken: TopDownParserPrototype.nextToken,
    parseToken: function(rule, node){
        var lookaheadToken = this.lookaheadToken;
        if (lookaheadToken.type === rule.token){
            node.token = lookaheadToken;
            this.lookaheadToken = this.nextToken();
            return true;
        }
        else {
            return false;
        }
    },
    initParse: function(text, symbol){
        var rule = TopDownParserPrototype.initParse.call(
            this, text, symbol
        );
        rule.func = this.parseSequence;
        rule.first = {};
        var property;
        for (property in rule.ruleParts[0].first) {
            rule.first[property] = [0];
        }
        this.lookaheadToken = this.nextToken();
        return rule;
    },
    parseRule: function(rule, parentNode){
        var lookaheadToken,
            first = rule.first[this.lookaheadToken.type],
            node, prune, i=0, func, maxOccurs, tokenBufferPointer,
            children
        ;
        if (first){
        
            prune = this.prune;
            func = rule.func;
            maxOccurs = rule.maxOccurs;
            
            for (; i<maxOccurs ; i++) {
                tokenBufferPointer = this.tokenBufferPointer;
                lookaheadToken = this.lookaheadToken;
                node = {children: []};
                if (func.call(this, rule, node, first)){
                    node.offset = this.tokenizer.offset;
                    node.tokenBufferPointer = tokenBufferPointer;
                    node.type = rule;
                    node.parentNode = parentNode;
                    if (prune){
                        children = node.children;
                        if (children.length===1){
                            node = children[0];
                        }
                    }
                    parentNode.children.push(node);
                }
                else {
                    this.tokenBufferPointer = tokenBufferPointer;
                    this.lookaheadToken = lookaheadToken;
                    node.children = null;
                    node.parentNode = null;
                    node.type = null;
                    break;
                }
            }
        }
        return i>=rule.minOccurs;
    },
    parseChoice: function(rule, node, first) {
        var index,
            ruleParts = rule.ruleParts,
            j, numIndexes = first.length;
        for (j=0; j<numIndexes; j++){
            if (this.parseRule(ruleParts[first[j]], node)) {
                return true;
            }
        }
        return false;
    },
    parseSequence: function(rule, node, first){
        var index, i,
            ruleParts = rule.ruleParts,
            numRuleParts = ruleParts.length,
            j, numIndexes = first.length;
        for (j=0; j<numIndexes; j++){
            for (i = first[j]; i<numRuleParts; i++){
                if (!this.parseRule(ruleParts[i], node)) {
                    return false;
                }
            }
            return true;
        }
    }    
}

}());
