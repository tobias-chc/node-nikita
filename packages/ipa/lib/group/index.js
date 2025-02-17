// Generated by CoffeeScript 2.7.0
// # `nikita.ipa.group`

// Add or modify a group in FreeIPA.

// ## Example

// ```js
// const {$status} = await nikita.ipa.group({
//   cn: 'somegroup',
//   connection: {
//     url: "https://ipa.domain.com/ipa/session/json",
//     principal: "admin@DOMAIN.COM",
//     password: "mysecret"
//   }
// })
// console.info(`Group was updated: ${$status}`)
// ```

// ## Schema definitions
var definitions, handler;

definitions = {
  config: {
    type: 'object',
    properties: {
      'cn': {
        type: 'string',
        description: `Name of the group to add or modify.`
      },
      'attributes': {
        type: 'object',
        default: {},
        description: `Attributes associated with the group to add or modify.`
      },
      'connection': {
        type: 'object',
        $ref: 'module://@nikitajs/network/lib/http#/definitions/config',
        required: ['principal', 'password']
      }
    },
    required: ['cn', 'connection']
  }
};

// ## Handler
handler = async function({config}) {
  var $status, base, data, error, output, result;
  if ((base = config.connection.http_headers)['Referer'] == null) {
    base['Referer'] = config.connection.referer || config.connection.url;
  }
  ({$status} = (await this.ipa.group.exists({
    connection: config.connection,
    cn: config.cn
  })));
  // Add or modify a group
  ({data} = (await this.network.http(config.connection, {
    negotiate: true,
    method: 'POST',
    data: {
      method: !$status ? "group_add/1" : "group_mod/1",
      params: [[config.cn], config.attributes],
      id: 0
    }
  })));
  output = {};
  $status = false;
  if (data != null ? data.error : void 0) {
    if (data.error.code !== 4202) { // no modifications to be performed
      error = Error(data.error.message);
      error.code = data.error.code;
      throw error;
    }
  } else {
    output.result = data.result.result;
    $status = true;
  }
  // Get result info even if no modification is performed
  if (!$status) {
    ({result} = (await this.ipa.group.show(config, {
      cn: config.cn
    })));
    output.result = result;
  }
  return {
    $status: $status,
    result: output.result
  };
};

// ## Exports
module.exports = {
  handler: handler,
  metadata: {
    definitions: definitions
  }
};
