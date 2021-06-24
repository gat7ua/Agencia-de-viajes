'use strict'

var puerto = 8080

const express = require('express');
const app = express();

app.get('/hola', (request, response) => {
    response.send('Tu puta madre\n');
})

app.listen(puerto, () => {
    console.log('API REST en http://localhost:' + puerto + '/hola');
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