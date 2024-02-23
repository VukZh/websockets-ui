import {WebSocketServer} from "ws";
import parser from "./messageParser.ts";
import {getId} from "./helpers.js";
import clients from "./db/clients.js";
import usersDB from "./db/players.ts";

const wss = new WebSocketServer({port: 3000});

wss.on('connection', function connection(ws) {
  const wsId = getId();
  clients[wsId] = ws
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    parser(data, wsId);
  });

  ws.on('close', function close(e) {
    delete clients[wsId];
    const closedUser = usersDB.find(u => u.index === wsId);
    if (closedUser) {
      closedUser.isActive = false;
    }
  });
});