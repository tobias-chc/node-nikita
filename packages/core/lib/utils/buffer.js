// Generated by CoffeeScript 2.7.0
module.exports = {
  // Treat the buffer as a string and trim whitespace characters.
  // Quick and dirt way to trim, alternative is to loop forward+backwark, 
  // detect all whitespace charactes, get a start and end and finaly resize the buffer.
  trim: function(buf, encoding) {
    return Buffer.from(buf.toString(encoding).trim());
  }
};
