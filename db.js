var Sequelize = require('sequelize');

var seq = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/dev-todo-api.sqlite'
});

var db = {};

db.todo = seq.import(__dirname + '/models/todo.js');
db.sequelize = seq;
db.Sequelize = Sequelize;

module.exports = db;