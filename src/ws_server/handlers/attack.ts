import gamesDB from "../db/games.ts";
import shipsDB from "../db/ships.ts";
import {additionalFields, shipsMatrix, stateShip, str} from "../helpers.js";
import {MessageType, StatusType} from "../models/types.js";
import clientsDB from "../db/clients.js";


const attackHandler = (msgData: {
  gameId: number,
  x: number,
  y: number,
  indexPlayer: number,
}) => {
  console.log("1")
  const currentGame = gamesDB.find(g => g.gameId === msgData.gameId);
  const oppositeShips = shipsDB.find(s => s.gameId === msgData.gameId && s.indexPlayer !== msgData.indexPlayer)
  console.log(">", currentGame.currentPlayer, msgData.indexPlayer, !oppositeShips.openedShips[msgData.x][msgData.y])
  if (currentGame.currentPlayer === msgData.indexPlayer && !oppositeShips.openedShips[msgData.x][msgData.y]) {
    console.log("111111111111111111111")
    oppositeShips.openedShips[msgData.x][msgData.y] = true;
    console.log("2222222222222222222222")
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", oppositeShips.openedShips)
    // console.log("shipsDB", shipsDB)
    const getState = stateShip(msgData.x, msgData.y, shipsMatrix(oppositeShips.ships), oppositeShips.openedShips).state
    if (getState !== StatusType.KILLED) {
      const wsMessage = {
        type: MessageType.ATTACK,
        data: str({
          position: {
            x: msgData.x,
            y: msgData.y,
          },
          currentPlayer: msgData.indexPlayer,
          status: getState
        })
      }
      clientsDB[msgData.indexPlayer].send(str(wsMessage));
    } else {
      const sheepCoordinates = stateShip(msgData.x, msgData.y, shipsMatrix(oppositeShips.ships), oppositeShips.openedShips).sheep;
      sheepCoordinates.forEach(c => {
        const wsMessage = {
          type: MessageType.ATTACK,
          data: str({
            position: {
              x: c[0],
              y: c[1],
            },
            currentPlayer: msgData.indexPlayer,
            status: getState
          })
        }
        clientsDB[msgData.indexPlayer].send(str(wsMessage));
      })
      console.log("additionalFields", additionalFields(sheepCoordinates));
      additionalFields(sheepCoordinates).forEach(a => {
        oppositeShips.openedShips[a[0]][a[1]] = true;
        const wsMessage = {
          type: MessageType.ATTACK,
          data: str({
            position: {
              x: a[0],
              y: a[1],
            },
            currentPlayer: msgData.indexPlayer,
            status: StatusType.MISS
          })
        }
        clientsDB[msgData.indexPlayer].send(str(wsMessage));
      })
    }
    // console.log("getState", getState)



  } else {
    throw new Error("not your move")
  }

}

export default attackHandler;