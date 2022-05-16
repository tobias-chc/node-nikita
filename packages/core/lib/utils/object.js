// Generated by CoffeeScript 2.7.0
var array, is_object_literal, regexp, snake_case;

array = require('./array');

regexp = require('./regexp');

({snake_case} = require('./string'));

({is_object_literal} = require('mixme'));

module.exports = {
  clean: function(content, undefinedOnly) {
    var k, v;
    for (k in content) {
      v = content[k];
      if (v && typeof v === 'object') {
        module.exports.clean(v, undefinedOnly);
        continue;
      }
      if (typeof v === 'undefined') {
        delete content[k];
      }
      if (!undefinedOnly && v === null) {
        delete content[k];
      }
    }
    return content;
  },
  copy: function(source, properties) {
    var j, len, obj, property;
    obj = {};
    for (j = 0, len = properties.length; j < len; j++) {
      property = properties[j];
      if (source[property] !== void 0) {
        obj[property] = source[property];
      }
    }
    return obj;
  },
  diff: function(obj1, obj2, keys) {
    var diff, k, keys1, keys2, v;
    if (!keys) {
      keys1 = Object.keys(obj1);
      keys2 = Object.keys(obj2);
      keys = array.merge(keys1, keys2, array.unique(keys1));
    }
    diff = {};
    for (k in obj1) {
      v = obj1[k];
      if (!(keys.indexOf(k) >= 0)) {
        continue;
      }
      if (obj2[k] === v) {
        continue;
      }
      diff[k] = [];
      diff[k][0] = v;
    }
    for (k in obj2) {
      v = obj2[k];
      if (!(keys.indexOf(k) >= 0)) {
        continue;
      }
      if (obj1[k] === v) {
        continue;
      }
      if (diff[k] == null) {
        diff[k] = [];
      }
      diff[k][1] = v;
    }
    return diff;
  },
  // equals: (obj1, obj2, keys) ->
  //   keys1 = Object.keys obj1
  //   keys2 = Object.keys obj2
  //   if keys
  //     keys1 = keys1.filter (k) -> keys.indexOf(k) isnt -1
  //     keys2 = keys2.filter (k) -> keys.indexOf(k) isnt -1
  //   else keys = keys1
  //   return false if keys1.length isnt keys2.length
  //   for k in keys
  //     return false if obj1[k] isnt obj2[k]
  //   return true
  insert: function(source, keys, value) {
    var i, j, key, len;
    for (i = j = 0, len = keys.length; j < len; i = ++j) {
      key = keys[i];
      source = source[key];
      if (source === void 0) {
        source = source[key] = {};
      }
      if (!is_object_literal(source)) {
        throw error('NIKITA_UTILS_INSERT', [`Invalid source at path ${keys.slice(0, i)},`, 'it must be an object or undefined,', `got ${JSON.stringify(source)}`]);
      }
      if (i === keys.length(-1)) {
        source[key] = merge(source[key], value);
        return;
      }
    }
  },
  match: function(source, target) {
    var i, j, k, len, v;
    if (is_object_literal(target)) {
      if (!is_object_literal(source)) {
        return false;
      }
      for (k in target) {
        v = target[k];
        if (!module.exports.match(source[k], v)) {
          return false;
        }
      }
      return true;
    } else if (Array.isArray(target)) {
      if (!Array.isArray(source)) {
        return false;
      }
      if (target.length !== source.length) {
        return false;
      }
      for (i = j = 0, len = target.length; j < len; i = ++j) {
        v = target[i];
        if (!module.exports.match(source[i], v)) {
          return false;
        }
      }
      return true;
    } else if (typeof source === 'string') {
      if (regexp.is(target)) {
        return target.test(source);
      } else if (Buffer.isBuffer(target)) {
        return target.equals(Buffer.from(source));
      } else {
        return source === target;
      }
    } else if (Buffer.isBuffer(source)) {
      if (Buffer.isBuffer(target)) {
        return source.equals(target);
      } else if (typeof target === 'string') {
        return source.equals(Buffer.from(target));
      } else {
        return false;
      }
    } else {
      return source === target;
    }
  },
  filter: function(source, black, white) {
    var j, key, len, obj, ref;
    if (black == null) {
      black = [];
    }
    obj = {};
    ref = (white != null ? white : Object.keys(source));
    // If white list, only use the selected list
    // Otherwise clone it all
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      if (source.hasOwnProperty(key) && !black.includes(key)) {
        // unless part of black list
        obj[key] = source[key];
      }
    }
    return obj;
  },
  snake_case: function(source) {
    var key, obj, value;
    obj = {};
    for (key in source) {
      value = source[key];
      obj[snake_case(key)] = value;
    }
    return obj;
  }
};
