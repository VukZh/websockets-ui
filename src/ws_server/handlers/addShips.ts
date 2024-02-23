import clientsDB from "../db/clients.ts";
import shipsDB from "../db/ships.ts";
import gamesDB from "../db/games.ts";

import {IndexedFieldsType, MessageType, ShipsUserType, StatusType} from "../models/types.ts";
import {lastIndex, str} from "../helpers.ts";
import roomsDB from "../db/rooms.js";

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

  const getShipsFrom2Players = shipsDB.filter(s => s.gameId === msgData.gameId).length === 2;

  if (getShipsFrom2Players) {

    const firstPlayerShips = shipsDB.find(s => s.gameId === msgData.gameId && s.indexPlayer !== id);

    const wsMessage1 = {
      type: MessageType.START,
      data: str({ships: firstPlayerShips.ships, currentPlayerIndex: firstPlayerShips.indexPlayer}),
      id: 0
    }

    clientsDB[firstPlayerShips.indexPlayer].send(str(wsMessage1));

    const wsMessage2 = {
      type: MessageType.START,
      data: str({ships: msgData.ships, indexPlayer: id}),
      id: 0
    }

    clientsDB[id].send(str(wsMessage2));

    const wsMessage = {
      type: MessageType.TURN,
      data: str({
        currentPlayer: firstPlayerShips.indexPlayer
      }),
      id: 0
    }
    clientsDB[id].send(str(wsMessage));
    clientsDB[firstPlayerShips.indexPlayer].send(str(wsMessage));


    gamesDB.push({
      gameId: lastIndex(gamesDB, IndexedFieldsType.GAME) + 1,
      position: {
        x: NaN,
        y: NaN
      },
      indexPlayers: [firstPlayerShips.indexPlayer, id],
      currentPlayer: [firstPlayerShips.indexPlayer],
      status: StatusType.SHOT,
      winPlayer: NaN
    })

    const foundRoomId = roomsDB.findIndex(r => r.roomUsers.some(r => r.index === id))
    roomsDB.splice(foundRoomId, 1);


    if (roomsDB.length) {
      const allRoomsData = [];
      roomsDB.forEach((r => {
        const data = {
          roomId: r.roomId,
          roomUsers: [...r.roomUsers],
        };
        allRoomsData.push(data)
      }))

      const wsMessage = {
        type: MessageType.UPDATE_R,
        data: str(allRoomsData),
        id: 0
      }
      for (const key in clientsDB) {
        clientsDB[key].send(str(wsMessage));
      }

    } else {
      const wsMessage = {
        type: MessageType.UPDATE_R,
        data: str([]),
        id: 0
      }

      for (const key in clientsDB) {
        clientsDB[key].send(str(wsMessage));
      }
    }
  }

}

export default addShipsHandler;