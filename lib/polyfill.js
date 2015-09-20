if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

if (!String.prototype.toCamelCase) {
    String.prototype.toCamelCase = function(isFirstUpper){
        return this.split(/\/|\\|-|_/).map(function(word, index){
            if (isFirstUpper === true || index !== 0 ) {
                return word.slice(0, 1).toUpperCase() + word.slice(1);
            }
            return word;
        }).join('');
    };
}
