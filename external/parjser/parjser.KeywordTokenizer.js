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

parjser.KeywordTokenizer = function(conf){
    parjser.RegexTokenizer.call(this, conf);
    this.keywords = conf.keywords;
}

parjser.KeywordTokenizer.prototype = {};

var KeywordTokenizerPrototype = parjser.KeywordTokenizer.prototype,
    RegexTokenizerPrototype = parjser.RegexTokenizer.prototype;

var m;
for (m in RegexTokenizerPrototype){
    KeywordTokenizerPrototype[m] = RegexTokenizerPrototype[m];
}

KeywordTokenizerPrototype.nextToken = function(){
    var token, type, kw, txt;
    do {
        token = this.next();
        type = token.type;
    } while(type in this.ignoredTokens);
    
    if (kw = this.keywords[type]){
        txt = token.text;
        if(kw = kw[txt]){
            token.type = kw;
        }
    }
    return token;
}

}())
