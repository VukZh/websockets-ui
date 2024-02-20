import usersDB from "../db/players.ts";
import roomsDB from "../db/rooms.ts";
import clients from "../db/clients.ts";
import {lastIndex, str} from "../helpers.ts";
import {IndexedFieldsType, MessageType} from "../models/types.ts";
import gamesDB from "../db/games.ts";

const addUserHandler = (msgData: {
  indexRoom: string
}, id: number) => {
  const addedUser = usersDB.find(u => u.index === id);
  const foundRoomId = roomsDB.findIndex(r => r.roomId === Number(msgData.indexRoom))
  const firstUserId = roomsDB[foundRoomId].roomUsers[0].index;

  const gameId = lastIndex(gamesDB, IndexedFieldsType.GAME) + 1;

  roomsDB[foundRoomId].roomUsers = [...roomsDB[foundRoomId].roomUsers, {
    name: addedUser.name,
    index: id
  }]

  if (id !== firstUserId) {
    let data = {
      idGame: gameId,
      idPlayer: firstUserId
    }

    let wsMessage = {
      type: MessageType.CREATE_G,
      data: str(data),
      id: 0
    }

    clients[firstUserId].send(str(wsMessage));

    data = {
      idGame: gameId,
      idPlayer: id
    }

    wsMessage = {
      type: MessageType.CREATE_G,
      data: str(data),
      id: 0
    }

    clients[id].send(str(wsMessage));
  } else {
    throw new Error("you can't add yourself to your room yet")
  }

}

export default addUserHandler;