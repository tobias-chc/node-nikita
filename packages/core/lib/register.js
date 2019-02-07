// Generated by CoffeeScript 2.3.2
// # Register

// Register actions into the global namespace. The actions registered below will be
// available to every Nikita sessions.

// ## Source code

// Dependency
var registry;

registry = require('./registry');

// Action registration
registry.register({
  assert: 'nikita/core/assert',
  kv: {
    get: 'nikita/core/kv/get',
    engine: 'nikita/core/kv/engine',
    set: 'nikita/core/kv/set'
  },
  core: {
    ping: 'nikita/core/ping'
  },
  cron: {
    add: 'nikita/cron/add',
    remove: 'nikita/cron/remove'
  },
  file: {
    '': 'nikita/file',
    assert: 'nikita/file/assert',
    cache: 'nikita/file/cache',
    cson: 'nikita/file/cson',
    download: 'nikita/file/download',
    glob: 'nikita/file/glob',
    hash: 'nikita/file/hash',
    ini: 'nikita/file/ini',
    json: 'nikita/file/json',
    properties: {
      '': 'nikita/file/properties',
      'read': 'nikita/file/properties/read'
    },
    render: 'nikita/file/render',
    touch: 'nikita/file/touch',
    upload: 'nikita/file/upload',
    yaml: 'nikita/file/yaml'
  },
  fs: {
    chmod: 'nikita/fs/chmod',
    chown: 'nikita/fs/chown',
    copy: 'nikita/fs/copy',
    createReadStream: 'nikita/fs/createReadStream',
    createWriteStream: 'nikita/fs/createWriteStream',
    exists: 'nikita/fs/exists',
    lstat: 'nikita/fs/lstat',
    mkdir: 'nikita/fs/mkdir',
    rmdir: 'nikita/fs/rmdir',
    readFile: 'nikita/fs/readFile',
    readlink: 'nikita/fs/readlink',
    rename: 'nikita/fs/rename',
    stat: 'nikita/fs/stat',
    symlink: 'nikita/fs/symlink',
    unlink: 'nikita/fs/unlink',
    writeFile: 'nikita/fs/writeFile'
  },
  java: {
    keystore_add: 'nikita/java/keystore_add',
    keystore_remove: 'nikita/java/keystore_remove'
  },
  log: {
    '': 'nikita/log',
    cli: 'nikita/log/cli',
    fs: 'nikita/log/fs',
    md: 'nikita/log/md',
    csv: 'nikita/log/csv'
  },
  connection: {
    assert: 'nikita/connection/assert',
    wait: {
      '': 'nikita/connection/wait'
    }
  },
  service: {
    '': 'nikita/service',
    assert: 'nikita/service/assert',
    discover: 'nikita/service/discover',
    install: 'nikita/service/install',
    init: 'nikita/service/init',
    remove: 'nikita/service/remove',
    restart: 'nikita/service/restart',
    start: 'nikita/service/start',
    startup: 'nikita/service/startup',
    status: 'nikita/service/status',
    stop: 'nikita/service/stop'
  },
  system: {
    cgroups: 'nikita/system/cgroups',
    chmod: 'nikita/system/chmod',
    chown: 'nikita/system/chown',
    copy: 'nikita/system/copy',
    discover: 'nikita/system/discover',
    execute: {
      '': 'nikita/system/execute',
      'assert': 'nikita/system/execute/assert'
    },
    group: {
      '': 'nikita/system/group/index',
      read: 'nikita/system/group/read',
      remove: 'nikita/system/group/remove'
    },
    info: {
      'disks': 'nikita/system/info/disks',
      'system': 'nikita/system/info/system'
    },
    limits: 'nikita/system/limits',
    link: 'nikita/system/link',
    mkdir: 'nikita/system/mkdir',
    mod: 'nikita/system/mod',
    move: 'nikita/system/move',
    remove: 'nikita/system/remove',
    running: 'nikita/system/running',
    tmpfs: 'nikita/system/tmpfs',
    uid_gid: 'nikita/system/uid_gid',
    user: {
      '': 'nikita/system/user/index',
      read: 'nikita/system/user/read',
      remove: 'nikita/system/user/remove'
    }
  },
  ssh: {
    '': 'nikita/ssh',
    open: 'nikita/ssh/open',
    close: 'nikita/ssh/close',
    root: 'nikita/ssh/root'
  },
  wait: {
    '': 'nikita/wait',
    execute: 'nikita/wait/execute',
    exist: 'nikita/wait/exist'
  }
});

// Backward compatibility
registry.deprecate('cgroups', 'nikita/system/cgroups');

registry.deprecate('chmod', 'nikita/system/chmod');

registry.deprecate('chown', 'nikita/system/chown');

registry.deprecate('copy', 'nikita/system/copy');

registry.deprecate('cron_add', 'nikita/cron/add');

registry.deprecate('cron_remove', 'nikita/cron/remove');

registry.deprecate('download', 'nikita/file/download');

registry.deprecate('execute', 'nikita/system/execute');

registry.deprecate('cache', 'nikita/file/cache');

registry.deprecate('group', 'nikita/system/group');

registry.deprecate('java_keystore_add', 'nikita/java/keystore_add');

registry.deprecate('java_keystore_remove', 'nikita/java/keystore_remove');

registry.deprecate('link', 'nikita/system/link');

registry.deprecate('mkdir', 'nikita/system/mkdir');

registry.deprecate('move', 'nikita/system/move');

registry.deprecate('remove', 'nikita/system/remove');

registry.deprecate('render', 'nikita/file/render');

registry.deprecate('service_install', 'nikita/service/install');

registry.deprecate('service_remove', 'nikita/service/remove');

registry.deprecate('service_restart', 'nikita/service/restart');

registry.deprecate('service_start', 'nikita/service/start');

registry.deprecate('service_startup', 'nikita/service/startup');

registry.deprecate('service_status', 'nikita/service/status');

registry.deprecate('service_stop', 'nikita/service/stop');

registry.deprecate('system_limits', 'nikita/system/limits');

registry.deprecate('touch', 'nikita/file/touch');

registry.deprecate('upload', 'nikita/file/upload');

registry.deprecate('user', 'nikita/system/user');

registry.deprecate('wait_connect', 'nikita/connection/wait');

registry.deprecate('wait_execute', 'nikita/wait/execute');

registry.deprecate('wait_exist', 'nikita/wait/exist');

registry.deprecate('write', 'nikita/file');

registry.deprecate('write_ini', 'nikita/file/ini');

registry.deprecate('write_properties', 'nikita/file/properties');

registry.deprecate('write_yaml', 'nikita/file/yaml');
