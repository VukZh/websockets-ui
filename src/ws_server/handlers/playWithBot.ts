import {MessageType, ShipsType, StatusType} from "../models/types.js";
import {additionalFields, prs, shipsMatrix, stateShip, str} from "../helpers.js";
import clientsDB from "../db/clients.js";
import usersDB from "../db/players.js";
import botShips from "../bot/ships.js";
import usersVsBotDB from "../db/playersVsBot.js";

const playWithBotHandler = (message: any, id: number) => {

  const findUser = usersDB.find(u => u.index === id);
  const findUserVsBot = usersVsBotDB.find(u => u.index === id);
  // let userShips: ShipsType;
  if (message.type === MessageType.BOT) {
    usersVsBotDB.push({
      name: findUser.name,
      index: id,
      gameId: 0,
      botId: 1,
      ships: [],
      openedShips: Array.from({length: 10}, () => Array.from({length: 10}).fill(false)) as Array<Array<boolean>>,
      openedBotShips: Array.from({length: 10}, () => Array.from({length: 10}).fill(false)) as Array<Array<boolean>>,
      isCurrentPlayer: true,
      killed: 0,
      botKilled: 0
    })

    console.log("oops", id, findUser.index);

    let data = {
      idGame: 0,
      idPlayer: id
    }

    let wsMessage = {
      type: MessageType.CREATE_G,
      data: str(data),
      id: 0
    }

    clientsDB[id].send(str(wsMessage));

  }

  if (message.type === MessageType.ADD_S) {

    const randomBotIndex = Math.floor(Math.random() * botShips.length);

    findUserVsBot.botId = randomBotIndex;
    // console.log("sss", prs(message.data).ships)
    findUserVsBot.ships = prs(message.data).ships;

    let wsMessage = {
      type: MessageType.START,
      data: str({ships: findUserVsBot.ships, currentPlayerIndex: id}),
      id: 0
    }
    clientsDB[id].send(str(wsMessage));

    wsMessage = {
      type: MessageType.TURN,
      data: str({
        currentPlayer: id
      }),
      id: 0
    }
    clientsDB[id].send(str(wsMessage));
    console.log(">>>", usersVsBotDB)

  }

  if (message.type === MessageType.ATTACK && findUserVsBot.isCurrentPlayer) {
    const msgData = prs(message.data)
    let x = msgData.x;
    let y = msgData.y;

    if (findUserVsBot.openedBotShips[x][y]) {
      return;
    } else {
      findUserVsBot.openedBotShips[x][y] = true;
      const attackState = stateShip(x, y, shipsMatrix(findUserVsBot.ships), findUserVsBot.openedBotShips).state;

      if (attackState !== StatusType.KILLED) {
        const wsMessage = {
          type: MessageType.ATTACK,
          data: str({
            position: {
              x: x,
              y: y,
            },
            currentPlayer: id,
            status: attackState
          }),
          id: 0
        }
        clientsDB[id].send(str(wsMessage));
      } else {
        findUserVsBot.killed++;


        const sheepCoordinates = stateShip(x, y, shipsMatrix(findUserVsBot.ships), findUserVsBot.openedBotShips).sheep;
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
        additionalFields(sheepCoordinates).forEach(a => {
          findUserVsBot.openedBotShips[a[0]][a[1]] = true;
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
          clientsDB[id].send(str(wsMessage));
        })
      }



    }
  }


  // const data = {
  //     roomId: 0,
  //     roomUsers: [findUser.name, "Bot"],
  //   }
  //
  // const wsMessage = {
  //   type: MessageType.UPDATE_R,
  //   data: str(data),
  //   id: 0
  // }
  //
  // clientsDB[id].send(str(wsMessage));


}

export default playWithBotHandler;