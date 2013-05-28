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
(function() {


/**
 * 
 *  Exception
 * 
 */
parjser.Exception = function(type, tokenizer){
    this.type = type;
    if (tokenizer) {
        this.initFromTokenizer(tokenizer);
    }
    return this;
};

parjser.Exception.prototype = {
    initFromTokenizer: function(tokenizer){
        this.offset = tokenizer.offset;
        this.text = tokenizer.originalText;
        this.initLineAndColumnInfo();
    },
    initLineAndColumnInfo: function(){
        var offset = this.offset,
            textSoFar = this.text.substr(0, offset),
            noNewLines = textSoFar.replace(/\n/g, ""),
            lastLine
        ;
        this.line = 1 + textSoFar.length - noNewLines.length;
        lastLine = textSoFar.lastIndexOf("\n");
        this.column = offset - lastLine;
        this.lastLine = textSoFar.substr(lastLine, this.column);
    },
    toString: function() {
        return this.type +
            " at line " + this.line +
            ", column " + this.column + ": " +
            this.lastLine
            ;
    }
};

/**
 * 
 *  SyntaxErrorException
 * 
 */
parjser.SyntaxErrorException = function(tokenizer, lastToken, lastSymbol){
    this.initFromTokenizer(tokenizer);
    this.lastToken = lastToken;
    this.lastSymbol = lastSymbol;
};

parjser.SyntaxErrorException.prototype = new parjser.Exception("SyntaxErrorException");
parjser.SyntaxErrorException.prototype.toString = function(){
    return parjser.Exception.prototype.toString.call(this) +
    "\nwhile parsing " + this.lastSymbol;
};

}());
