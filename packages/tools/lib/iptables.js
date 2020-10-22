// Generated by CoffeeScript 2.5.1
// # `nikita.system.iptables`

// Iptables  is  used to set up, maintain, and inspect the tables of IPv4 packet 
// filter rules in the Linux kernel.

// Iptables rules are only inserted if the service is started on the target system.

// ## Options

// * `log` (function)    
//   Function called with a log related messages.   
// * `rules` (object | array)   
//   One or more objects containing iptables rule definitions.   
// * `stdout` (stream writer)   
//   Stream writer to pipe the standart output stream of the executed commands.   
// * `stderr` (stream writer)   
//   Stream writer to pipe the standart error stream of the executed commands.   
// * `ssh` (object|ssh2)   
//   Run the action on a remote server using SSH, an ssh2 instance or an
//   configuration object used to initialize the SSH connection.   
// * `stdout` (stream.Writable)   
//   Writable EventEmitter in which the standard output of executed commands will
//   be piped.   
// * `stderr` (stream.Writable)   
//   Writable EventEmitter in which the standard error output of executed command
//   will be piped.   

// ## Callback Parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is "true" if Iptables rules were created or modified.   

// ## Usage

// Rule objects may contains the following keys:

// * `rulenum`   
// * `protocol`   
// * `jump`   
// * `in-interface`   
//   Name of an interface via which a packet was received.   
// * `out-interface`   
//   Name of an interface via which a packet is going to be sent.   
// * `source`   
//   Source specification. Address can be either a network name, a hostname, a
//   network IP address (with /mask), or a plain IP address.   
// * `target`   
//   Destination specification. See the description of the -s (source) flag for
//   a detailed description of the syntax.   
// * `comment`   
// * `state`   
// * `dport`   
//   Destination port or port range specification, see the "tcp" and "udp"
//   modules.   
// * `sport`   
//   Source port or port range specification, see the "tcp" and "udp" modules.   

// Iptables comes with many modules. Each of them which must be specifically 
// integrated to the parser part of this code. For this reason, we could only
// integrate a limited set of modules and more are added based on usages. Supported
// modules are:

// * `state`   
//   This module, when combined with connection tracking, allows access to the
//   connection tracking state for this packet.   
// * `comment`   
//   Allows you to add comments (up to 256 characters) to any rule.   
// * `limit`   
//   Matches at a limited rate using a token bucket filter.   
// * `tcp`   
//   Used if protocol is set to "tcp", the supported properties are "dport" and
//   "sport".   
// * `udp`   
//   Used if protocol is set to "udp", the supported properties are "dport" and
//   "sport".   

// ## Example

// ```coffee
// var after = {chain: 'INPUT', jump: 'ACCEPT', 'in-interface': 'lo'}
// require('nikita')
// .tools.iptables({
//   ssh: ssh,
//   rules: [
//     chain: 'INPUT', after: after, jump: 'ACCEPT', dport: 22, protocol: 'tcp'
//   ]
// }, function(err, {status}){
//   console.info(err ? err.message : 'Iptables was updated: ' + status);
// });
// ```

// ## Source Code
var iptables;

module.exports = function({options}, callback) {
  this.log({
    message: "Entering iptables",
    level: 'DEBUG',
    module: 'nikita/lib/iptables'
  });
  this.log({
    message: "List existing rules",
    level: 'INFO',
    module: 'nikita/lib/iptables'
  });
  return this.system.execute({
    cmd: "service iptables status &>/dev/null && iptables -S",
    code_skipped: 3
  }, (err, data) => {
    var cmd, newrules, oldrules;
    if (err) {
      return callback(err);
    }
    if (!data.status) {
      return callback(Error("Service iptables not started"));
    }
    oldrules = iptables.parse(data.stdout);
    newrules = iptables.normalize(options.rules);
    cmd = iptables.cmd(oldrules, newrules);
    if (!cmd.length) {
      return callback();
    }
    this.log({
      message: `${cmd.length} modified rules`,
      level: 'WARN',
      module: 'nikita/lib/iptables'
    });
    return this.system.execute({
      cmd: `${cmd.join('; ')}; service iptables save;`,
      trap: true
    }, function(err, data) {
      return callback(err, true);
    });
  });
};

// ## Dependencies
iptables = require('@nikitajs/core/lib/misc/iptables');

// ## IPTables References

// List rules in readable format: `iptables -L --line-numbers -nv`
// List rules in save format: `iptables -S -v`
