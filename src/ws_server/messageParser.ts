import {MessageType} from "./models/types.ts";
import {RawData} from "ws";
import {str, prs} from "./helpers.ts";
import regHandler from "./handlers/reg.js";
import createRoomHandler from "./handlers/createRoom.js";
import clients from "./db/clients.js";
import addUserHandler from "./handlers/addUserToRoom.js";

const parser = (msg: RawData, id: number) => {
  clients[id].send("oops")
  try {
    // @ts-ignore
    const message = prs(msg);
    const msgData = message.data ? prs(message.data) : "";
    console.log(">> ", message)
    if (message?.type === MessageType.REG && msgData?.name && msgData?.password) {
      console.log(">>> ", msgData);
      regHandler(msgData, id);
    } else if (message?.type === MessageType.CREATE_R) {
      createRoomHandler(id);
    } else if (message?.type === MessageType.ADD_U && msgData?.indexRoom) {
      addUserHandler(msgData, id);
    }
  } catch (e) {
    console.log(e.message)
  }
}

export default parser;