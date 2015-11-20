var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var nextTodoId = 0;

app.use(bodyParser.json());

app.get('/', function( req, res ) {
	res.send('Todo API root');
});

// GET /todos
app.get('/todos', function(req, res) {
	// convert to json & send
	res.json(todos);
})

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var id = parseInt(req.params.id, 10);
	var matchedTodo;

	todos.forEach(function(todo) {
		if (todo.id === id) {matchedTodo = todo;}
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

	//res.send('Asking for todo with id of ' + req.params.id);
})

// POST /todos
app.post('/todos', function( req, res ) {
	var body = req.body;
	console.log("desciption: " + req.body.description);

	var newTodo = {
		id: nextTodoId++,
		description: req.body.description,
		done: false
	};

	todos.push(newTodo);
	res.json(newTodo);
});

app.listen(PORT, function() {
	console.log('Listening on ' + PORT);	
});