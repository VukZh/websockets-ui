import {IndexedFieldsType, MessageType} from "../models/types.ts";
import {lastIndex, str} from "../helpers.ts";
import usersDB from "../db/players.ts";
import roomsDB from "../db/rooms.ts";
import clientsDB from "../db/clients.ts";

const regHandler = (msgData: {
  name: string,
  password: string
}, id: number) => {

  const existedUser = usersDB.find(u => u.name === msgData.name)

  const wrongPass = existedUser && existedUser.password !== msgData.password;
  const activeUser = existedUser && existedUser.isActive === true;
  let error = false;
  let errorText = "";
  let index = NaN;

  console.log("usersDB", usersDB)

  if (wrongPass) {
    error = true;
    errorText = "wrong password";
  } else if (activeUser) {
    error = true;
    errorText = "user is playing now";
  } else {
    index = id;
    usersDB.push({
      name: msgData.name,
      password: msgData.password,
      index: index,
      wins: 0,
      isActive: true
    })
  }

  // if (userExists) {
  //   error = true;
  //   errorText = "user exists";
  // } else {
  //   index = id;
  //   usersDB.push({
  //     name: msgData.name,
  //     password: msgData.password,
  //     index: index,
  //     wins: 0
  //   })
  // }

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