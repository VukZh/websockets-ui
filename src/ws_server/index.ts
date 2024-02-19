import {WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 3000});

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.on('open', function open() {
    console.log('connected');
    ws.send(Date.now());
  });

  ws.on('close', function close() {
    console.log('close');
  });


  ws.send('something');
});