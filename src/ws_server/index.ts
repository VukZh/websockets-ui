import {WebSocketServer} from "ws";
import parser from "./messageParser.ts";
import {getId, str} from "./helpers.ts";
import clients from "./db/clients.ts";
import usersDB from "./db/players.ts";
import gamesDB from "./db/games.ts";
import {MessageType} from "./models/types.ts";
import clientsDB from "./db/clients.ts";

const wss = new WebSocketServer({port: 3000});

try {
  wss.on('connection', function connection(ws) {
    const wsId = getId();
    clients[wsId] = ws
    ws.on('error', console.error);

    ws.on('message', function message(data) {
      parser(data, wsId);
    });

    ws.on('close', function close(e) {
      const foundGames = gamesDB.filter(g => g.indexPlayers.includes(wsId)).map(g => g.indexPlayers.filter(g => g !== wsId));


      if (foundGames.length) {
        foundGames.forEach((fg) => {
          if (fg[0]) {

            const wsMessage = {
              type: MessageType.FINISH,
              data: str({
                winPlayer: fg[0]
              }),
              id: 0
            }

            if (clientsDB[fg[0]]) {
              clientsDB[fg[0]].send(str(wsMessage));
            }

          }
        })
      }

      delete clients[wsId];
      const closedUser = usersDB.find(u => u.index === wsId);
      if (closedUser) {
        closedUser.isActive = false;
      }
    });
  });
} catch (e) {
  console.log(e)
}
