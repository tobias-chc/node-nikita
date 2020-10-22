// Generated by CoffeeScript 2.5.1
// # `nikita.docker.load`

// Load Docker images.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container was loaded.
// * `stdout`   
//   Stdout value(s) unless `stdout` option is provided.
// * `stderr`   
//   Stderr value(s) unless `stderr` option is provided.

// ## Example

// ```javascript
// require('nikita')
// .docker.load({
//   image: 'nikita/load_test:latest',
//   machine: machine,
//   source: source + "/nikita_load.tar"
// }, function(err, {status}) {
//   console.info( err ? err.message : 'Container loaded: ' + status);
// })
// ```

// ## Schema
var handler, schema, string;

schema = {
  type: 'object',
  properties: {
    'input': {
      type: 'string',
      description: `TAR archive file to read from.`
    },
    'source': {
      type: 'string',
      description: `Alias for the "input" option.`
    },
    'checksum': {
      type: 'string',
      description: `If provided, will check if attached input archive to checksum already exist,
not native to docker but implemented to get better performance.`
    },
    'boot2docker': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/boot2docker'
    },
    'compose': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/compose'
    },
    'machine': {
      $ref: 'module://@nikitajs/docker/src/tools/execute#/properties/machine'
    }
  }
};

// ## Handler
handler = async function({
    config,
    tools: {find, log}
  }) {
  var cmd, i, image, images, infos, j, k, len, len1, new_image, new_images, new_k, ref, ref1, status, stderr, stdout;
  log({
    message: "Entering Docker load",
    level: 'DEBUG',
    module: 'nikita/lib/docker/load'
  });
  // Validate parameters
  if (config.input == null) {
    config.input = config.source;
  }
  if (config.input == null) {
    throw Error('Missing input parameter');
  }
  cmd = `load -i ${config.input}`;
  // need to records the list of image to see if status is modified or not after load
  // for this we print the existing images as REPOSITORY:TAG:IMAGE
  // parse the result to record images as an array of   {'REPOSITORY:TAG:'= 'IMAGE'}
  images = {};
  delete config.cmd;
  log({
    message: 'Storing previous state of image',
    level: 'INFO',
    module: 'nikita/lib/docker/load'
  });
  if (config.checksum == null) {
    log({
      message: 'No checksum provided',
      level: 'INFO',
      module: 'nikita/lib/docker/load'
    });
  }
  if (config.checksum) {
    log({
      message: `Checksum provided :${config.checksum}`,
      level: 'INFO',
      module: 'nikita/lib/docker/load'
    });
  }
  if (config.checksum == null) {
    config.checksum = '';
  }
  ({stdout} = (await this.docker.tools.execute({
    cmd: "images | grep -v '<none>' | awk '{ print $1\":\"$2\":\"$3 }'"
  })));
  // skip header line, wi skip it here instead of in the grep  to have
  // an array with at least one not empty line
  if (string.lines(stdout).length > 1) {
    ref = string.lines(stdout);
    for (i = 0, len = ref.length; i < len; i++) {
      image = ref[i];
      image = image.trim();
      if (image !== '') {
        infos = image.split(':');
        if (infos[2] === config.checksum) {
          // if image is here we skip
          log({
            message: `Image already exist checksum :${config.checksum}, repo:tag ${`${infos[0]}:${infos[1]}`}`,
            level: 'INFO',
            module: 'nikita/lib/docker/load'
          });
        }
        if (infos[2] === config.checksum) {
          return false;
        }
        images[`${infos[0]}:${infos[1]}`] = `${infos[2]}`;
      }
    }
  }
  log({
    message: `Start Loading ${config.input} `,
    level: 'INFO',
    module: 'nikita/lib/docker/load'
  });
  this.docker.tools.execute({
    cmd: cmd
  });
  ({stdout, stderr} = (await this.docker.tools.execute({
    cmd: 'images | grep -v \'<none>\' | awk \'{ print $1":"$2":"$3 }\''
  })));
  new_images = {};
  status = false;
  log({
    message: 'Comparing new images',
    level: 'INFO',
    module: 'nikita/lib/docker/load'
  });
  if (string.lines(stdout).length > 1) {
    ref1 = string.lines(stdout.toString());
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      image = ref1[j];
      if (image !== '') {
        infos = image.split(':');
        new_images[`${infos[0]}:${infos[1]}`] = `${infos[2]}`;
      }
    }
  }
  for (new_k in new_images) {
    new_image = new_images[new_k];
    if (images[new_k] == null) {
      status = true;
      break;
    } else {
      for (k in images) {
        image = images[k];
        if (image !== new_image && new_k === k) {
          status = true;
          log({
            message: 'Identical images',
            level: 'INFO',
            module: 'nikita/lib/docker/load'
          });
          break;
        }
      }
    }
  }
  return {
    status: status,
    stdout: stdout,
    stderr: stderr
  };
};


// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker'
  },
  schema: schema
};

// ## Dependencies
string = require('@nikitajs/engine/lib/utils/string');
