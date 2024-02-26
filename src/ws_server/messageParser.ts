import {MessageType} from "./models/types.ts";
import {RawData} from "ws";
import {prs} from "./helpers.ts";
import regHandler from "./handlers/reg.ts";
import createRoomHandler from "./handlers/createRoom.ts";
import addUserHandler from "./handlers/addUserToRoom.ts";
import addShipsHandler from "./handlers/addShips.ts";
import attackHandler from "./handlers/attack.js";
import playWithBotHandler from "./handlers/playWithBot.js";

const parser = (msg: RawData, id: number) => {
  try {
    const message = prs(msg);
    const msgData = message.data ? prs(message.data) : "";
    if (message?.type === MessageType.REG && msgData?.name && msgData?.password) {
      regHandler(msgData, id);
    } else if (message?.type === MessageType.CREATE_R) {
      createRoomHandler(id);
    } else if (message?.type === MessageType.ADD_U && msgData?.indexRoom) {
      addUserHandler(msgData, id);
    } else if (message?.type === MessageType.ADD_S && msgData?.gameId && msgData?.ships && msgData?.indexPlayer) {
      addShipsHandler(msgData, id);
    } else if (message?.type === MessageType.ATTACK && msgData?.gameId && msgData?.x >= 0 && msgData?.y >= 0 && msgData?.indexPlayer) {
      attackHandler(msgData);
    } else if (message?.type === MessageType.ATTACK_R && msgData?.gameId && msgData?.indexPlayer) {
      attackHandler(msgData, true);
    } else if (message?.type === MessageType.BOT
      || message?.type === MessageType.ADD_S && msgData?.gameId === 0
      || message?.type === MessageType.ATTACK && msgData?.gameId === 0) {
      playWithBotHandler (message, id);
    }
  } catch (e) {
    console.log(e.message)
  }
}

export default parser;