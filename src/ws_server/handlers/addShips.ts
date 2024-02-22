import clientsDB from "../db/clients.ts";
import shipsDB from "../db/ships.ts";
import gamesDB from "../db/games.ts";

import {IndexedFieldsType, MessageType, ShipsUserType, StatusType} from "../models/types.ts";
import {lastIndex, prs, shipsMatrix, str} from "../helpers.ts";

const addShipsHandler = (msgData: {
  gameId: number,
  ships: Array<ShipsUserType>,
}, id: number) => {
  shipsDB.push({
    gameId: msgData.gameId,
    ships: msgData.ships,
    indexPlayer: id,
    openedShips: Array.from({length: 10}, () => Array.from({length: 10}).fill(false)) as Array<Array<boolean>>,
    killed: 0
  })
  console.log("ships", shipsDB)

  const getShipsFrom2Players = shipsDB.filter(s => s.gameId === msgData.gameId).length === 2;
  console.log("ships", shipsDB, getShipsFrom2Players)

  console.log(">>>", msgData.ships, shipsMatrix(msgData.ships))

  if (getShipsFrom2Players) {

    const firstPlayerShips = shipsDB.find(s => s.gameId === msgData.gameId && s.indexPlayer !== id);

    const wsMessage1 = {
      type: MessageType.START,
      data: str({ships: firstPlayerShips.ships, currentPlayerIndex: firstPlayerShips.indexPlayer}),
      id: 0
    }

    console.log(":>>>1", wsMessage1)
    clientsDB[firstPlayerShips.indexPlayer].send(str(wsMessage1));

    const wsMessage2 = {
      type: MessageType.START,
      data: str({ships: msgData.ships, indexPlayer: id}),
      id: 0
    }

    console.log(":>>>2", wsMessage2)
    clientsDB[id].send(str(wsMessage2));

    gamesDB.push({
      gameId: lastIndex(gamesDB, IndexedFieldsType.GAME) + 1,
      position: {
        x: NaN,
        y: NaN
      },
      indexPlayers: [firstPlayerShips.indexPlayer, id],
      currentPlayer: firstPlayerShips.indexPlayer,
      status: StatusType.SHOT,
      winPlayer: NaN
    })

    console.log("gamesDB", gamesDB)

    // clientsDB[firstPlayerShips.indexPlayer].send(str({
    //   type: MessageType.TURN,
    //   data: str({
    //     currentPlayer: firstPlayerShips.indexPlayer
    //   })
    // }));
    //
    // clientsDB[id].send(str({
    //   type: MessageType.TURN,
    //   data: str({
    //     currentPlayer: firstPlayerShips.indexPlayer
    //   })
    // }));
  }

}

export default addShipsHandler;