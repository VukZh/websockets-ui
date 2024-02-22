import {IndexedFieldsType, MessageType} from "../models/types.ts";
import {lastIndex, str} from "../helpers.ts";
import usersDB from "../db/players.ts";
import roomsDB from "../db/rooms.ts";
import clientsDB from "../db/clients.ts";

const regHandler = (msgData: {
  name: string,
  password: string
}, id: number) => {

  const userExists = usersDB.some(u => u.name === msgData.name && u.password === msgData.password);
  let error = false;
  let errorText = "";
  let index = NaN;

  console.log("usersDB", usersDB)

  if (userExists) {
    error = true;
    errorText = "user exists";
  } else {
    index = id;
    usersDB.push({
      name: msgData.name,
      password: msgData.password,
      index: index
    })
  }

  const data = {
    name: msgData.name,
    index: index,
    error: error,
    errorText: errorText
  }
  const wsMessage = {
    type: MessageType.REG,
    data: str(data),
    id: 0
  }
  console.log("..>>..", wsMessage, data, usersDB)
  clientsDB[id].send(str(wsMessage));
  console.log("rooms in reg", roomsDB)

  const noFullRoom = roomsDB.find((r) => r.roomUsers.length === 1);
  console.log("noFullRoom", noFullRoom);
  if (noFullRoom) {
    const data = [{
      roomId: noFullRoom.roomId,
      roomUsers: noFullRoom.roomUsers
    }]
    const wsMessage = {
      type: MessageType.UPDATE_R,
      data: str(data),
      id: roomsDB.length - 1
    }
    clientsDB[id].send(str(wsMessage));
  }
}

export default regHandler;