import usersDB from "../db/players.ts";
import roomsDB from "../db/rooms.ts";
import {lastIndex, str} from "../helpers.ts";
import {IndexedFieldsType, MessageType} from "../models/types.ts";
import clientsDB from "../db/clients.ts";

const createRoomHandler = (id: number) => {
  // const lastUser = usersDB[usersDB.length - 1];
  const foundUser = usersDB.find(u => u.index === id);
  const index = lastIndex(roomsDB, IndexedFieldsType.ROOM) + 1;
  const data = [{
    roomId: index,
    roomUsers: [
      {
        name: foundUser.name,
        index: id
      }
    ]
  }]
  const foundRoomId = roomsDB.findIndex(r => r.roomUsers[0].index === id);
  if (foundRoomId === -1) {
    // const wsMessage = {
    //   type: MessageType.UPDATE_R,
    //   data: str(data),
    //   id: 0
    // }
    roomsDB.push(...data);
    // console.log("..>>>..", wsMessage, data, roomsDB);

    const allRoomsData = []
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

    // for (const key in clientsDB) {
    //   clientsDB[key].send(str(wsMessage));
    // }
    // clientsDB[id].send(str(wsMessage));
    // Object.keys(clientsDB).forEach((c => {
    //   clientsDB[c].send(str(wsMessage));
    // }))
  } else {
    throw new Error("multiple rooms for 1 player are not allowed")
  }
};

export default createRoomHandler;