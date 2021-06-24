var http = require('http');
var puerto = 8080

http.createServer( (request, response) => {
    response.writeHead(200, {'Content-Type' : 'text/plain'});
    response.end('PUTA\n');
}).listen(puerto);

console.log('Servidor ejecutandose en ' + puerto + '...');