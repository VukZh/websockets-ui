import {MessageType, StatusType} from "../models/types.ts";
import {additionalFields, prs, shipsMatrix, stateShip, str} from "../helpers.ts";
import clientsDB from "../db/clients.ts";
import usersDB from "../db/players.ts";
import botShips from "../bot/ships.ts";
import shipsBot from "../bot/ships.ts";
import usersVsBotDB from "../db/playersVsBot.ts";
import botAttack from "../bot/botAttack.ts";
import checkedField from "../bot/checkedField.ts";

const playWithBotHandler = async (message: any, id: number, isRandom = false) => {

  const findUser = usersDB.find(u => u.index === id);
  const findUserVsBot = usersVsBotDB.find(u => u.index === id);
  if (message.type === MessageType.BOT) {
    usersVsBotDB.push({
      name: findUser.name,
      index: id,
      gameId: 0,
      botId: 1,
      ships: [],
      openedBotShips: Array.from({length: 10}, () => Array.from({length: 10}).fill(false)) as Array<Array<boolean>>,
      isCurrentPlayer: true,
      killed: 0,
      botKilled: 0
    })

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

  }

  if ((message.type === MessageType.ATTACK || isRandom) && findUserVsBot.isCurrentPlayer) {
    const msgData = prs(message.data)
    let x = msgData.x;
    let y = msgData.y;

    if (isRandom) {
      const closedCell = [];
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (!findUserVsBot.openedBotShips[i][j]) {
            closedCell.push([i, j]);
          }
        }
      }
      const randomCell = Math.floor(Math.random() * closedCell.length);
      x = closedCell[randomCell][0];
      y = closedCell[randomCell][1];
    }

    if (findUserVsBot.openedBotShips[x][y]) {
      return;
    } else {
      findUserVsBot.openedBotShips[x][y] = true;
      const attackState = stateShip(x, y, shipsBot[findUserVsBot.botId], findUserVsBot.openedBotShips).state;

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


        if (attackState === StatusType.MISS) {
          findUserVsBot.isCurrentPlayer = false;

          const wsMessage = {
            type: MessageType.TURN,
            data: str({
              currentPlayer: 0
            }),
            id: 0
          }
          clientsDB[id].send(str(wsMessage));

          const [x, y] = botAttack(checkedField);
          checkedField[x][y] = true;

          const botAttackState = stateShip(x, y, shipsMatrix(findUserVsBot.ships), checkedField).state;

          if (botAttackState !== StatusType.KILLED) {
            setTimeout(() => {
              const wsMessage = {
                type: MessageType.ATTACK,
                data: str({
                  position: {
                    x: x,
                    y: y,
                  },
                  currentPlayer: 0,
                  status: botAttackState
                }),
                id: 0
              }
              clientsDB[id].send(str(wsMessage));
            }, 1000)
          }


          if (botAttackState === StatusType.MISS) {
            setTimeout(() => {
              findUserVsBot.isCurrentPlayer = true;
              const wsMessage = {
                type: MessageType.TURN,
                data: str({
                  currentPlayer: id
                }),
                id: 0
              }
              clientsDB[id].send(str(wsMessage));
            }, 1000)

          } else {

            if (botAttackState === StatusType.KILLED) {
              findUserVsBot.botKilled++;
              const sheepCoordinates = stateShip(x, y, shipsMatrix(findUserVsBot.ships), checkedField).sheep;
              sheepCoordinates.forEach(c => {
                const wsMessage = {
                  type: MessageType.ATTACK,
                  data: str({
                    position: {
                      x: c[0],
                      y: c[1],
                    },
                    currentPlayer: 0,
                    status: botAttackState
                  }),
                  id: 0
                }
                clientsDB[id].send(str(wsMessage));
              })
              additionalFields(sheepCoordinates).forEach(a => {
                checkedField[a[0]][a[1]] = true;
                const wsMessage = {
                  type: MessageType.ATTACK,
                  data: str({
                    position: {
                      x: a[0],
                      y: a[1],
                    },
                    currentPlayer: 0,
                    status: StatusType.MISS
                  }),
                  id: 0
                }
                clientsDB[id].send(str(wsMessage));
              })

            }

            let delay = 2000;

            do {
              const [x, y] = botAttack(checkedField);
              checkedField[x][y] = true;
              const botAttackState = stateShip(x, y, shipsMatrix(findUserVsBot.ships), checkedField).state;

              const resolveAttack = (p) => {
                return new Promise<void>((resolve) => {
                  setTimeout(() => {
                    const wsMessage = {
                      type: MessageType.ATTACK,
                      data: str({
                        position: {
                          x: x,
                          y: y,
                        },
                        currentPlayer: 0,
                        status: botAttackState
                      }),
                      id: 0
                    }
                    clientsDB[id].send(str(wsMessage));
                    resolve();
                  }, p);
                });
              }


              if (botAttackState === StatusType.MISS) {

                await resolveAttack(delay);

                const wsMessage = {
                  type: MessageType.TURN,
                  data: str({
                    currentPlayer: id
                  }),
                  id: 0
                }
                clientsDB[id].send(str(wsMessage));

                findUserVsBot.isCurrentPlayer = true;
                break;

              } else if (botAttackState === StatusType.SHOT) {

                await resolveAttack(delay);

                const wsMessage = {
                  type: MessageType.TURN,
                  data: str({
                    currentPlayer: 0
                  }),
                  id: 0
                }
                clientsDB[id].send(str(wsMessage));

                findUserVsBot.isCurrentPlayer = false;

              } else if (botAttackState === StatusType.KILLED) {

                findUserVsBot.botKilled++;

                const sheepCoordinates = stateShip(x, y, shipsMatrix(findUserVsBot.ships), checkedField).sheep;
                sheepCoordinates.forEach(c => {
                  const wsMessage = {
                    type: MessageType.ATTACK,
                    data: str({
                      position: {
                        x: c[0],
                        y: c[1],
                      },
                      currentPlayer: 0,
                      status: botAttackState
                    }),
                    id: 0
                  }
                  clientsDB[id].send(str(wsMessage));
                })
                additionalFields(sheepCoordinates).forEach(a => {
                  checkedField[a[0]][a[1]] = true;
                  const wsMessage = {
                    type: MessageType.ATTACK,
                    data: str({
                      position: {
                        x: a[0],
                        y: a[1],
                      },
                      currentPlayer: 0,
                      status: StatusType.MISS
                    }),
                    id: 0
                  }
                  clientsDB[id].send(str(wsMessage));
                })

                if (findUserVsBot.botKilled === 10) {
                  break
                }

              }
            } while (true);

          }


        } else {
          const wsMessage = {
            type: MessageType.TURN,
            data: str({
              currentPlayer: id
            }),
            id: 0
          }
          clientsDB[id].send(str(wsMessage));
        }


      } else {

        const wsMessage = {
          type: MessageType.TURN,
          data: str({
            currentPlayer: id
          }),
          id: 0
        }
        clientsDB[id].send(str(wsMessage));

        findUserVsBot.killed++;
        const sheepCoordinates = stateShip(x, y, shipsBot[findUserVsBot.botId], findUserVsBot.openedBotShips).sheep;
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

  if (findUserVsBot?.killed === 10) {
    const wsMessage = {
      type: MessageType.FINISH,
      data: str({
        winPlayer: id
      }),
      id: 0
    }
    clientsDB[id].send(str(wsMessage));
    usersVsBotDB.length = 0;
    const clearedCheckedField: Array<Array<boolean>> = Array.from({length: 10}, () => Array.from({length: 10}).fill(false)) as Array<Array<boolean>>;
    checkedField.length = 0;
    checkedField.push(...clearedCheckedField)
  }

  if (findUserVsBot?.botKilled === 10) {
    const wsMessage = {
      type: MessageType.FINISH,
      data: str({
        winPlayer: 0
      }),
      id: 0
    }
    clientsDB[id].send(str(wsMessage));
    usersVsBotDB.length = 0;
    const clearedCheckedField: Array<Array<boolean>> = Array.from({length: 10}, () => Array.from({length: 10}).fill(false)) as Array<Array<boolean>>;
    checkedField.length = 0;
    checkedField.push(...clearedCheckedField)
  }

}

export default playWithBotHandler;