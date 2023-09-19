/* istanbul ignore next */
export const isArray =
  Array.isArray ||
  function(value) {
    return value && typeof value === 'object'
      ? toString.call(value) === '[object Array]'
      : false;
  };

const SourceNode = function(line, column, srcFile, chunks) {
  this.src = '';
  if (chunks) {
    this.add(chunks);
  }
};

/* istanbul ignore next */
SourceNode.prototype = {
  add: function(chunks) {
    if (isArray(chunks)) {
      chunks = chunks.join('');
    }
    this.src += chunks;
  },
  prepend: function(chunks) {
    if (isArray(chunks)) {
      chunks = chunks.join('');
    }
    this.src = chunks + this.src;
  },
  toStringWithSourceMap: function() {
    return { code: this.toString() };
  },
  toString: function() {
    return this.src;
  }
};

export { SourceNode };
