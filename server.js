var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [
	{
		id: 1,
		description: 'Go eat a taco',
		done: false
	},{
		id: 2,
		description: 'Wear pants',
		done: false
	}, {
		id: 3,
		description: 'Eat some food before you shrivel and die :(',
		done: false
	}
]

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

app.listen(PORT, function() {
	console.log('Listening on ' + PORT);	
});