var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8000 });

wss.on('connection', function connection(ws) {
  console.log("New connection");
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send(JSON.stringify({
    text: 'Hello from Server',
    name: 'React-Bot',
    image: {uri: 'https://facebook.github.io/react/img/logo_og.png'},
    position: 'left',
    date: new Date(),
    uniqueId: Math.round(Math.random() * 10000)
  }));
});
