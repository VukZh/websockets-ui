import usersDB from "../db/players.ts";
import roomsDB from "../db/rooms.ts";
import {lastIndex, str} from "../helpers.ts";
import {IndexedFieldsType, MessageType} from "../models/types.ts";
import clients from "../db/clients.ts";

const createRoomHandler = (id: number) => {
  const lastUser = usersDB[usersDB.length - 1];
  const index = lastIndex(roomsDB, IndexedFieldsType.ROOM) + 1;
  const data = [{
    roomId: index,
    roomUsers: [
      {
        name: lastUser.name,
        index: id
      }
    ]
  }]
  const foundRoomId = roomsDB.findIndex(r => r.roomUsers[0].index === id);
  if (foundRoomId === -1) {
    const wsMessage = {
      type: MessageType.UPDATE_R,
      data: str(data),
      id: 0
    }
    console.log("..>>>..", wsMessage, data, roomsDB);
    roomsDB.push(...data);
    clients[id].send(str(wsMessage));
  } else {
    throw new Error("multiple rooms for 1 player are not allowed")
  }
};

export default createRoomHandler;