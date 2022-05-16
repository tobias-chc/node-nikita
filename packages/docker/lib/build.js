// Generated by CoffeeScript 2.7.0
  // # `nikita.docker.build`

// Build docker repository from Dockerfile, from content or from current working
  // directory.

// The user can choose whether the build is local or on the remote.
  // Options are the same than docker build command with nikita's one.
  // Be aware than you can not use ADD with content option because docker build
  // from STDIN does not support a context.

// By default docker always run the build and overwrite existing repositories.
  // Status unmodified if the repository is identical to a previous one

// ## Output

// * `err`   
  //   Error object if any.   
  // * `$status`   
  //   True if image was successfully built.   
  // * `image`   
  //   Image ID if the image was built, the ID is based on the image sha256 checksum.   
  // * `stdout`   
  //   Stdout value(s) unless `stdout` option is provided.   
  // * `stderr`   
  //   Stderr value(s) unless `stderr` option is provided.   

// ## Builds a repository from dockerfile without any resourcess

// ```js
  // const {$status} = await nikita.docker.build({
  //   image: 'ryba/targe-build',
  //   source: '/home/ryba/Dockerfile'
  // })
  // console.info(`Container was built: ${$status}`)
  // ```

// ## Builds a repository from dockerfile with external resources

// In this case nikita download all the external files into a resources directory in the same location
  // than the Dockerfile. The Dockerfile content:

// ```dockerfile
  // FROM centos7
  // ADD resources/package.tar.gz /tmp/
  // ADD resources/configuration.sh /tmp/
  // ```

// Build directory tree :

// ```
  // ├── Dockerfile
  // ├── resources
  // │   ├── package.tar.gz
  // │   ├── configuration.sh
  // ```

// ```js
  // const {$status} = await nikita.docker.build({
  //   tag: 'ryba/target-build',
  //   source: '/home/ryba/Dockerfile',
  //   resources: ['http://url.com/package.tar.gz/','/home/configuration.sh']
  // })
  // console.info(`Container was built: ${$status}`)
  // ```

// ## Builds a repository from stdin

// ```js
  // const {$status} = await nikita.docker.build({
  //   tag: 'ryba/target-build'
  //   content: "FROM ubuntu\nRUN echo 'helloworld'"
  // })
  // console.info(`Container was built: ${$status}`)
  // ```

// ## Hooks
var definitions, errors, handler, on_action, path, utils,
  indexOf = [].indexOf;

on_action = function({config}) {
  if ((config.content != null) && (config.file != null)) {
    throw errors.NIKITA_DOCKER_BUILD_CONTENT_FILE_REQUIRED();
  }
};

// ## Schema definitions
definitions = {
  config: {
    type: 'object',
    properties: {
      'build_arg': {
        oneOf: [
          {
            type: 'string'
          },
          {
            type: 'object',
            patternProperties: {
              '.*': {
                typeof: 'string'
              }
            }
          }
        ],
        description: `Send arguments to the build, match the Docker native ARG command.`
      },
      'content': {
        type: 'string',
        description: `Content of the Docker file, required unless \`file\` is provided.`
      },
      'cwd': {
        type: 'string',
        description: `Change the build working directory.`
      },
      'docker': {
        $ref: 'module://@nikitajs/docker/lib/tools/execute#/definitions/docker'
      },
      'file': {
        type: 'string',
        description: `Path to Dockerfile, required unless \`content\` is provided.`
      },
      'force_rm': {
        type: 'boolean',
        default: false,
        description: `Always remove intermediate containers during build.`
      },
      'image': {
        type: 'string',
        description: `Name of the Docker image present in the registry.`
      },
      'quiet': {
        type: 'boolean',
        default: false,
        description: `Suppress the verbose output generated by the containers.`
      },
      'rm': {
        type: 'boolean',
        default: true,
        description: `Remove intermediate containers after a successful build.`
      },
      'no_cache': {
        type: 'boolean',
        default: false,
        description: `Do not use cache when building the repository.`
      },
      'tag': {
        type: 'string',
        description: `Tag of the Docker image, default to latest.`
      }
    },
    required: ['image']
  }
};

// ## Handler
handler = async function({
    config,
    tools: {log}
  }) {
  var dockerfile_commands, i, image_id, k, len, line, lines, number_of_cache, number_of_step, ref, ref1, ref2, source, stderr, stdout, userargs;
  number_of_step = 0;
  userargs = [];
  // status unmodified if final tag already exists
  dockerfile_commands = ['CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'RUN', 'STOPSIGNAL', 'MAINTAINER'];
  source = void 0;
  if (config.file) {
    source = config.file;
  } else if (config.cwd) {
    source = `${config.cwd}/Dockerfile`;
  }
  if (config.file) {
    if (config.cwd == null) {
      config.cwd = path.dirname(config.file);
    }
  }
  if (config.cwd) {
    if (config.file == null) {
      config.file = path.resolve(config.cwd, 'Dockerfile');
    }
  }
  // Make sure the Dockerfile exists
  if (!config.content) {
    await this.fs.assert(config.file);
  }
  // Build the image
  ({stdout, stderr} = (await this.docker.tools.execute({
    command: [
      'build',
      ...(['force_rm',
      'quiet',
      'no_cache'].filter(function(opt) {
        return config[opt];
      }).map(function(opt) {
        return `--${opt.replace('_',
      '-')}`;
      })),
      ...(utils.array.flatten(['build_arg']).filter(function(opt) {
        return config[opt];
      }).map(function(opt) {
        var i,
      k,
      len,
      ref,
      results;
        if (Array.isArray(config[opt])) {
          ref = config[opt];
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            k = ref[i];
            results.push(`--${opt.replace('_',
      '-')} ${k}`);
          }
          return results;
        } else {
          return `--${opt.replace('_',
      '-')} ${config[opt]}`;
        }
      })),
      '--rm=' + (config.rm ? 'true' : 'false'),
      '-t ' + utils.string.escapeshellarg(config.image + (config.tag ? `:${config.tag}` : '')),
      (config.content != null ? (log({
        message: "Building from text: Docker won't have a context. ADD/COPY not working",
        level: 'WARN'
      }),
      config.content != null ? `- <<DOCKERFILE\n${config.content}\nDOCKERFILE` : void 0) : config.file != null ? (log({
        message: `Building from Dockerfile: \"${config.file}\"`,
        level: 'INFO'
      }),
      `-f ${config.file} ${config.cwd}`) : (log({
        message: "Building from CWD",
        level: 'INFO'
      }),
      '.'))
    ].join(' '),
    cwd: config.cwd
  })));
  // Get the content of the Dockerfile
  if (config.content) {
    await this.file({
      content: config.content,
      source: source,
      target: function({content}) {
        return config.content = content;
      },
      from: config.from,
      to: config.to,
      match: config.match,
      replace: config.replace,
      append: config.append,
      before: config.before,
      write: config.write
    });
  } else {
    // Read Dockerfile if necessary to count steps
    log({
      message: `Reading Dockerfile from : ${config.file}`,
      level: 'INFO'
    });
    ({
      data: config.content
    } = (await this.fs.base.readFile({
      target: config.file,
      encoding: 'utf8'
    })));
  }
  ref = utils.string.lines(config.content);
  // Count steps
  for (i = 0, len = ref.length; i < len; i++) {
    line = ref[i];
    if (ref1 = (ref2 = /^(.*?)\s/.exec(line)) != null ? ref2[1] : void 0, indexOf.call(dockerfile_commands, ref1) >= 0) {
      number_of_step++;
    }
  }
  image_id = null;
  // Count cache
  lines = utils.string.lines(stdout);
  number_of_cache = 0;
  for (k in lines) {
    line = lines[k];
    if (line.indexOf('Using cache') !== -1) {
      number_of_cache = number_of_cache + 1;
    }
    if (line.indexOf('Successfully built') !== -1) {
      image_id = line.split(' ').pop().toString();
    }
  }
  userargs = {
    $status: number_of_step !== number_of_cache,
    image: image_id,
    stdout: stdout,
    stderr: stderr
  };
  log(userargs.$status ? {
    message: `New image id ${userargs.image}`,
    level: 'INFO',
    module: 'nikita/lib/docker/build'
  } : {
    message: `Identical image id ${userargs.image}`,
    level: 'INFO',
    module: 'nikita/lib/docker/build'
  });
  return userargs;
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    global: 'docker',
    definitions: definitions
  },
  hooks: {
    on_action: on_action
  }
};

// ## Errors
errors = {
  NIKITA_DOCKER_BUILD_CONTENT_FILE_REQUIRED: function() {
    return utils.error('NIKITA_DOCKER_BUILD_CONTENT_FILE_REQUIRED', ['could not build the container,', 'one of the `content` or `file` config property must be provided']);
  }
};

// ## Dependencies
utils = require('./utils');

path = require('path');
