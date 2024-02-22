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
}, isRandom = false) => {

  const currentGame = gamesDB.find(g => g.gameId === msgData.gameId);
  const oppositeShips = shipsDB.find(s => s.gameId === msgData.gameId && s.indexPlayer !== msgData.indexPlayer)
  console.log("1", msgData.indexPlayer, currentGame.currentPlayer[0], currentGame)
  // console.log(">", currentGame.currentPlayer, msgData.indexPlayer, !oppositeShips.openedShips[msgData.x][msgData.y])

  let x = msgData.x;
  let y = msgData.y;
  if (isRandom) {
    const closedCell = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (!oppositeShips.openedShips[i][j]) {
          closedCell.push([i, j]);
        }
      }
    }
    const randomCell = Math.floor(Math.random() * closedCell.length);
    x = closedCell[randomCell][0];
    y = closedCell[randomCell][1];
  }

  if (currentGame.currentPlayer[0] === msgData.indexPlayer && !oppositeShips.openedShips[x][y]) {
    console.log("111111111111111111111")
    oppositeShips.openedShips[x][y] = true;
    console.log("2222222222222222222222")
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", oppositeShips.openedShips)
    // console.log("shipsDB", shipsDB)
    const attackState = stateShip(x, y, shipsMatrix(oppositeShips.ships), oppositeShips.openedShips).state
    if (attackState !== StatusType.KILLED) {
      const wsMessage = {
        type: MessageType.ATTACK,
        data: str({
          position: {
            x: x,
            y: y,
          },
          currentPlayer: msgData.indexPlayer,
          status: attackState
        }),
        id: 0
      }
      clientsDB[msgData.indexPlayer].send(str(wsMessage));
    } else {
      oppositeShips.killed++;
      const sheepCoordinates = stateShip(x, y, shipsMatrix(oppositeShips.ships), oppositeShips.openedShips).sheep;
      sheepCoordinates.forEach(c => {
        const wsMessage = {
          type: MessageType.ATTACK,
          data: str({
            position: {
              x: c[0],
              y: c[1],
            },
            currentPlayer: msgData.indexPlayer,
            status: attackState
          }),
          id: 0
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
          }),
          id: 0
        }
        clientsDB[msgData.indexPlayer].send(str(wsMessage));
      })
    }
    // console.log("getState", getState)

    console.log("oppositeShips.killed", oppositeShips.killed);

    if (oppositeShips.killed === 10) {
      const wsMessage = {
        type: MessageType.FINISH,
        data: str({
          winPlayer: msgData.indexPlayer
        }),
        id: 0
      }
      clientsDB[msgData.indexPlayer].send(str(wsMessage));
      clientsDB[oppositeShips.indexPlayer].send(str(wsMessage));
    } else {
      console.log("attackState", attackState)
      if (attackState === StatusType.MISS) {
        console.log("TURN");
        const wsMessage = {
          type: MessageType.TURN,
          data: str({
            currentPlayer: msgData.indexPlayer ? oppositeShips.indexPlayer : msgData.indexPlayer
          }),
          id: 0
        }
        clientsDB[msgData.indexPlayer].send(str(wsMessage));
        clientsDB[oppositeShips.indexPlayer].send(str(wsMessage));
        console.log("2", oppositeShips.indexPlayer);
        currentGame.currentPlayer[0] = oppositeShips.indexPlayer;
      }
    }


  } else {
    throw new Error("false move")
  }

}

export default attackHandler;