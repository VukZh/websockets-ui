import clients from "../db/clients.ts";
import ships from "../db/ships.ts";

import {MessageType, ShipsUserType} from "../models/types.ts";
import {str} from "../helpers.ts";

const addShipsHandler = (msgData: {
  gameId: number,
  ships: Array<ShipsUserType>,
}, id: number) => {
  ships.push({
    gameId: msgData.gameId,
    ships: msgData.ships,
    indexPlayer: id
  })
  console.log("ships", ships)

  const getShipsFrom2Players = ships.filter(s => s.gameId === msgData.gameId).length === 2;
  console.log("ships", ships, getShipsFrom2Players)

  if (getShipsFrom2Players) {

    const firstPlayerShips = ships.find(s => s.gameId === msgData.gameId && s.indexPlayer !== id);

    const wsMessage1 = {
      type: MessageType.START,
      data: str({ships: firstPlayerShips.ships, currentPlayerIndex: firstPlayerShips.indexPlayer}),
      id: 0
    }

    console.log(":>>>1", wsMessage1)
    clients[firstPlayerShips.indexPlayer].send(str(wsMessage1));

    const wsMessage2 = {
      type: MessageType.START,
      data: str({ships: msgData.ships, currentPlayerIndex: id}),
      id: 0
    }

    console.log(":>>>2", wsMessage2)
    clients[id].send(str(wsMessage2));
  }

}

export default addShipsHandler;