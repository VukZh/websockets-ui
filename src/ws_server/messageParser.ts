import {MessageType} from "./models/types.ts";
import {RawData} from "ws";
import {str, prs} from "./helpers.ts";

const parser = (msg: RawData, ws: WebSocket) => {
  ws.send("oops")
  try {
    // @ts-ignore
    const message = prs(msg);
    const msgData = prs(message.data);
    console.log(">> ", message)
    if (message?.type === MessageType.REG && msgData?.name && msgData?.password) {
      console.log(">>> ", msgData);
      const data = {
        name: msgData.name,
        index: 0,
        error: false,
        errorText: ""
      }
      const wsMessage = {
        type: MessageType.REG,
        data: str(data)
      }
      ws.send(str(wsMessage));
    }
  } catch (e) {
    console.log(e.message)
  }
}

export default parser;