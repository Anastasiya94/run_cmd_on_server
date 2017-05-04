var config = {};

config.database = {};
config.server= {};

config.database.host = '127.0.0.1';
config.database.port = 9994;
config.database.database = 'commands';
config.database.user = 'postgres';
config.database.password = '1111';

config.server.port = 3000;


module.exports = config;