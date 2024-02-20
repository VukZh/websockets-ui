import {WebSocketServer} from "ws";
import parser from "./messageParser.ts";
import {getId} from "./helpers.js";
import clients from "./db/clients.js";

const wss = new WebSocketServer({port: 3000});



wss.on('connection', function connection(ws) {
  const wsId = getId();
  clients[wsId] = ws
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
    // @ts-ignore
    parser(data, wsId);
  });

  ws.on('open', function open() {
    console.log('connected');
    ws.send(Date.now());
  });

  ws.on('close', function close() {
    console.log('close');
  });


  // ws.send('something');
});