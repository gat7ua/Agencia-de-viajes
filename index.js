'use strict'

const port = process.env.port || 8080;

const express = require('express');
const logger = require('morgan');

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({extended : 'false'}));
app.use(express.json());

app.get('/api/products', (request, response) => {
    response.send({products : []});
})

app.get('/api/products/:id', (request, response) => {
    response.send({products : `${request.params.id}`});
})

app.post('/api/products', (request, response) => {
    console.log(request.body)
    response.send({products : `Product received`});
})

app.put('/api/products/:id', (request, response) => {
    response.send({products : `${request.params.id}`});
})

app.delete('/api/products/:id', (request, response) => {
    response.send({products : `${request.params.id}`});
})

app.listen(port, () => {
    console.log('API REST en http://localhost:' + port + '/api/products');
});



/*
var http = require('http');
var server = http.createServer();

function HTTP_Response(request, response) {
    response.writeHead(200, {'Content-Type' : 'text/plain'});
    response.write('TODAS PUTAS, TODOS PUTOS')
    response.end();
}

server.on('request', HTTP_Response);
server.listen(puerto);

console.log('Servidor ejecutandose en ' + puerto + '...');
*/