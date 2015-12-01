var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var nextTodoId = 0;

app.use(bodyParser.json());

app.get('/', function( req, res ) {
	res.send('Todo API root');
});

// GET /todos
app.get('/todos', function( req, res ) {
	var query = req.query;
	var where = {};

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
app.get('/todos/:id', function( req, res ) {
	var id = parseInt(req.params.id, 10);
	
	db.todo.findById(id).then(function(todo) {
		if (!!todo) { res.json(todo);	} 
		else { res.status(404).send(); }
	}).catch(function(e) {
		res.status(500).json(e);
	});
});

// POST /todos
app.post('/todos', function( req, res ) {
	// Only pass through the description value
	var body = _.pick(req.body, 'description');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});

});

// DELETE /todos/:id
app.delete('/todos/:id', function( req, res ) {
	var id = parseInt(req.params.id, 10);
	
	db.todo.destroy({
		where: {
			id: id
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
app.put('/todos/:id', function( req, res ) {
	var id = parseInt(req.params.id, 10);
	var updatedTodo = {};

	if (req.body.hasOwnProperty('done')) {
		updatedTodo.done = req.body.done;
	}

	if (req.body.hasOwnProperty('description')) {
		updatedTodo.description = req.body.description;
	}

	db.todo.findById(id).then(function(todo) {
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
		res.json(user.toJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	})
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Listening on ' + PORT);	
	});	
});
