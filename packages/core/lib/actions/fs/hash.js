// Generated by CoffeeScript 2.7.0
// # `nikita.fs.hash`

// Retrieve the hash of a file or a directory in hexadecimal 
// form.

// If the target is a directory, the returned hash 
// is the sum of all the hashs of the files it recursively 
// contains. The default algorithm to compute the hash is md5.

// If the target is a link, the returned hash is of the linked file.

// It is possible to use to action to assert the target file by passing a `hash`
// used for comparaison.

// ## Returned output

// * `hash`   
//   The hash of the file or directory identified by the "target" option.

// ## Schema definitions
var crypto, definitions, errors, handler, utils;

definitions = {
  config: {
    type: 'object',
    properties: {
      'algo': {
        type: 'string',
        default: 'md5',
        description: `Any algorythm supported by \`openssl\` such as "md5", "sha1" and
"sha256".`
      },
      'hash': {
        type: 'string',
        description: `Assert that the targeted content match a provided hash.`
      },
      'stats': {
        typeof: 'object',
        description: `Stat object of the target file. Short-circuit to avoid fetching the
stat object associated with the target if one is already available.`
      },
      'target': {
        type: 'string',
        description: `The file or directory to compute the hash from.`
      }
    },
    required: ['target']
  }
};

// ## Handler
handler = async function({config}) {
  var err, files, hash, hashs, stats, stdout;
  ({stats} = config.stats ? config.stats : (await this.fs.base.stat(config.target)));
  if (!(utils.stats.isFile(stats.mode) || utils.stats.isDirectory(stats.mode))) {
    throw errors.NIKITA_FS_HASH_FILETYPE_UNSUPPORTED({
      config: config,
      stats: stats
    });
  }
  hash = null;
  try {
    // Target is a directory
    if (utils.stats.isDirectory(stats.mode)) {
      ({files} = (await this.fs.glob(`${config.target}/**`, {
        dot: true
      })));
      ({stdout} = (await this.execute({
        command: [
          'command -v openssl >/dev/null || exit 2',
          ...files.map(function(file) {
            return `[ -f ${file} ] && openssl dgst -${config.algo} ${file} | sed 's/^.* \\([a-z0-9]*\\)$/\\1/g'`;
          }),
          'exit 0'
        ].join('\n'),
        trim: true
      })));
      hashs = utils.string.lines(stdout).filter(function(line) {
        return /\w+/.test(line);
      }).sort();
      hash = hashs.length === 0 ? crypto.createHash(config.algo).update('').digest('hex') : hashs.length === 1 ? hashs[0] : crypto.createHash(config.algo).update(hashs.join('')).digest('hex');
    // Target is a file
    } else if (utils.stats.isFile(stats.mode)) {
      ({stdout} = (await this.execute({
        command: `command -v openssl >/dev/null || exit 2
openssl dgst -${config.algo} ${config.target} | sed 's/^.* \\([a-z0-9]*\\)$/\\1/g'`,
        trim: true
      })));
      hash = stdout;
    }
  } catch (error) {
    err = error;
    if (err.exit_code === 2) {
      throw errors.NIKITA_FS_HASH_MISSING_OPENSSL();
    }
    if (err) {
      throw err;
    }
  }
  if (config.hash && config.hash !== hash) {
    throw errors.NIKITA_FS_HASH_HASH_NOT_EQUAL({
      config: config,
      hash: hash
    });
  }
  return {
    hash: hash
  };
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_to_config: 'target',
    shy: true,
    definitions: definitions
  }
};

// ## Errors
errors = {
  NIKITA_FS_HASH_FILETYPE_UNSUPPORTED: function({config, stats}) {
    return utils.error('NIKITA_FS_HASH_FILETYPE_UNSUPPORTED', ['only "File" and "Directory" types are supported,', `got ${JSON.stringify(utils.stats.type(stats.mode))},`, `location is ${JSON.stringify(config.target)}`], {
      target: config.target
    });
  },
  NIKITA_FS_HASH_MISSING_OPENSSL: function() {
    return utils.error('NIKITA_FS_HASH_MISSING_OPENSSL', ['the `openssl` command must be present on your system,', "please install it before pursuing"]);
  },
  NIKITA_FS_HASH_HASH_NOT_EQUAL: function({config, hash}) {
    return utils.error('NIKITA_FS_HASH_HASH_NOT_EQUAL', ['the target hash does not equal the execpted value,', `got ${JSON.stringify(hash)},`, `expected ${JSON.stringify(config.hash)}`], {
      target: config.target
    });
  }
};


// ## Dependencies
crypto = require('crypto');

utils = require('../../utils');
