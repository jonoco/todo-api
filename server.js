var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
	// convert to json & send
	res.json(todos);
})

// GET /todos/:id
app.get('/todos/:id', function( req, res ) {
	var id = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: id});
	
	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
})

// POST /todos
app.post('/todos', function( req, res ) {
	var body = req.body;

	if (!_.isString(body.description) || body.description.trim().length == 0) {
		return res.status(400).send();
	}

	var newTodo = {
		id: nextTodoId++,
		description: req.body.description.trim(),
		done: false
	};

	todos.push(newTodo);
	res.json(newTodo);
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
// app.put('/todos/:id', function( req, res ) {
// 	var todoId = parseInt(req.params.id, 10);
// 	var newDescription = 
// });

app.listen(PORT, function() {
	console.log('Listening on ' + PORT);	
});