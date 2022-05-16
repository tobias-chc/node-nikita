// Generated by CoffeeScript 2.7.0
// # `nikita.fs.remove`

// Recursively remove files, directories and links. This is a much more aggressive
// version of `unlink` based on the `rm` command.

// ## Output

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is `true` if files were removed.   

// ## Implementation details

// Files are removed localling using the Unix "rm" utility.

// ## Simple example

// ```js
// const {$status} = await nikita.fs.remove('./some/dir')
// console.info(`Directory was removed: ${$status}`)
// ```

// ## Removing a directory unless a given file exists

// ```js
// const {$status} = await nikita.fs.remove({
//   $unless_exists: './some/file',
//   target: './some/dir'
// })
// console.info(`Directory was removed: ${$status}`)
// ```

// ## Removing multiple files and directories

// ```js
// const {$status} = await nikita.fs.remove([
//   { $unless_exists: './some/file', target: './some/dir' },
//   './some/file'
// ])
// console.info(`Directories was removed: ${$status}`)
// ```

// ## Schema definitions
var definitions, handler, utils;

definitions = {
  config: {
    type: 'object',
    properties: {
      'recursive': {
        type: 'boolean',
        description: `Attempt to remove the file hierarchy rooted in the directory.
Attempting to remove a non-empty directory without the \`recursive\`
config will throw an Error.`
      },
      'target': {
        type: 'string',
        description: `File, directory or glob (pattern matching based on wildcard
characters).`
      }
    },
    required: ['target']
  }
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var err, file, files, i, len, status;
  // Start real work
  ({files} = (await this.fs.glob(config.target)));
  for (i = 0, len = files.length; i < len; i++) {
    file = files[i];
    log({
      message: `Removing file ${file}`,
      level: 'INFO'
    });
    try {
      ({status} = (await this.execute({
        command: [
          'rm',
          '-d', // Attempt to remove directories as well as other types of files.
          config.recursive ? '-r' : void 0,
          file
        // "rm -rf '#{file}'"
        ].join(' ')
      })));
      if (status) {
        log({
          message: `File ${file} removed`,
          level: 'WARN'
        });
      }
    } catch (error) {
      err = error;
      if (utils.string.lines(err.stderr.trim()).length === 1) {
        err.message = ['failed to remove the file, got message', JSON.stringify(err.stderr.trim())].join(' ');
      }
      throw err;
    }
  }
  return {};
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    argument_to_config: 'target',
    definitions: definitions
  }
};

// ## Dependencies
utils = require('../../utils');
