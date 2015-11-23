var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var seq;

// Check if we're on heroku
if (env === 'production') {
	// heroku production environment
	seq = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	seq = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}

var db = {};

db.todo = seq.import(__dirname + '/models/todo.js');
db.sequelize = seq;
db.Sequelize = Sequelize;

module.exports = db;