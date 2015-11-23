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
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (!matchedTodo) {
		res.status(404).json({"error": "Could not find todo with that id"});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
});

// PUT /todos/:id
app.put('/todos/:id', function( req, res ) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});	
	var body = _.pick(req.body, 'description', 'done');
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).json({"error": "Could not find todo with that id"});
	}

	if (body.hasOwnProperty('done') && body.done) {
		validAttributes.done = body.done;
	} else if (body.hasOwnProperty('done')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') 
		&& (_.isString(body.description) 
		&& body.description.trim().length >= 0)) {
		validAttributes.description = body.description;	
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).json({"error": "Invalid description"});
	}

	_.extend(matchedTodo, body)
	res.json(matchedTodo);
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Listening on ' + PORT);	
	});	
});
