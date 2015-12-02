var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var nextTodoId = 0;

app.use(bodyParser.json());

app.get('/', function( req, res ) {
	res.send('Todo API root');
});

// GET /todos?done=true&q=work
app.get('/todos', middleware.requireAuthentication, function( req, res ) {
	var query = req.query;
	var where = {userId: req.user.get('id')};

	if (query.hasOwnProperty('done')) {
		if (query.done === 'true') { where.done = true; }
		else if (query.done === 'false') { where.done = false; }
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) { 
		where.description = {
		 $like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({
		where: where
	}).then(function(results) {
		if (!!results) { res.json(results);	} 
		else { res.status(404).send(); }
	}).catch(function(e) {
		res.status(500).json(e.toJSON());
	});

})

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function( req, res ) {
	var id = parseInt(req.params.id, 10);
	
	db.todo.findOne({
		where: {
			id: id,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (!!todo) { res.json(todo);	} 
		else { res.status(404).send(); }
	}).catch(function(e) {
		res.status(500).json(e);
	});
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function( req, res ) {
	// Only pass through the description value
	var body = _.pick(req.body, 'description');

	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}).catch(function(e) {
		res.status(400).json(e);
	});

});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function( req, res ) {
	var id = parseInt(req.params.id, 10);
	
	db.todo.destroy({
		where: {
			id: id,
			userId: req.user.get('id')
		}
	}).then(function(deletedRows) {
		if (deletedRows < 1) {
			res.status(404).send();
		} else {
			res.status(204).send();
		}
	}).catch(function(e) {
		res.status(500).json(e);
	});
});

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function( req, res ) {
	var id = parseInt(req.params.id, 10);
	var updatedTodo = {};

	if (req.body.hasOwnProperty('done')) {
		updatedTodo.done = req.body.done;
	}

	if (req.body.hasOwnProperty('description')) {
		updatedTodo.description = req.body.description;
	}

	db.todo.findOne({
		where: {
			id: id,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (!!todo) { 
			todo.update(updatedTodo).then(function() {
				res.json(todo.toJSON());
			});
		} else {
			res.status(404).send();
		}
	}).catch(function(e) {
		res.status(500).json(e);
	});
});

// POST /users
app.post('/users', function( req, res ) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	})
});

// POST /users/login
app.post('/users/login', function( req, res ) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
		
	}).then(function(tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(e) {
		res.status(401).send();
	});
});

// DELETE /users/login 
app.delete('/users/login', middleware.requireAuthentication, function( req, res ) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}).catch(function(e) {
		res.status(500).send();
	});
});

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Listening on port ' + PORT + ' ...');	
	});	
});
