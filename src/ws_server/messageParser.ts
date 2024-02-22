import {MessageType} from "./models/types.ts";
import {RawData} from "ws";
import {str, prs} from "./helpers.ts";
import regHandler from "./handlers/reg.ts";
import createRoomHandler from "./handlers/createRoom.ts";
import clients from "./db/clients.ts";
import addUserHandler from "./handlers/addUserToRoom.ts";
import addShipsHandler from "./handlers/addShips.ts";
import attackHandler from "./handlers/attack.js";

const parser = (msg: RawData, id: number) => {
  // clients[id].send("oops")
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
    } else if (message?.type === MessageType.ADD_S && msgData?.gameId && msgData?.ships && msgData?.indexPlayer) {
      addShipsHandler(msgData, id);
    } else if (message?.type === MessageType.ATTACK && msgData?.gameId && msgData?.x >=0 && msgData?.y >=0 && msgData?.indexPlayer) {
      attackHandler(msgData);
     } else if (message?.type === MessageType.ATTACK_R && msgData?.gameId && msgData?.indexPlayer) {
      attackHandler(msgData, true);
    }
  } catch (e) {
    console.log(e.message)
  }
}

export default parser;