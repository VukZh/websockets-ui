export enum MessageType {
  REG = "reg",
  UPDATE = "update_winners",
  ADD_U = "add_user_to_room",
  CREATE_R = "create_room",
  CREATE_G = "create_game",
  UPDATE_R = "update_room",
  ADD_S = "add_ships",
  START = "start_game",
  ATTACK = "attack",
  ATTACK_R = "randomAttack",
  TURN = "turn",
  FINISH = "finish",
  BOT = "single_play"
}

export enum ShipType {
  S = "small",
  M = "medium",
  L = "large",
  H = "huge"
}

export enum StatusType {
  MISS = "miss",
  KILLED = "killed",
  SHOT = "shot",
}

export enum IndexedFieldsType {
  USER = "index",
  ROOM = "roomId",
  GAME = "gameId",
}

export type UserType = {
  name: string;
  password: string;
  index: IndexPlayerType;
  roomId?: RoomIdType;
  gameId?: GameIdType;
  wins: number;
  isActive: boolean;
}

export type UserVsBotType = Pick<UserType, "name" | "index" | "gameId"> & {
  ships: Array<ShipsUserType>;
  botId: number;
  openedBotShips: Array<Array<boolean>>;
  isCurrentPlayer: boolean;
  killed: number;
  botKilled: number;
}

export type RoomType = {
  roomId: RoomIdType;
  idGame?: GameIdType;
  roomUsers: Array<Pick<UserType, "name" | "index">>
}

export type GameType = {
  gameId: GameIdType;
  position: PositionType;
  indexPlayers: Array<IndexPlayerType>;
  currentPlayer: [IndexPlayerType];
  status: StatusType;
  winPlayer: IndexPlayerType;
}

type IndexPlayerType = number;

type GameIdType = number;

type RoomIdType = number;

type PositionType = {
  x: number;
  y: number;
}

export type ShipsUserType = {
  position: PositionType;
  direction: boolean;
  length: number;
  type: ShipType
}

export type ShipsType = {
  ships: Array<ShipsUserType>;
  openedShips: Array<Array<boolean>>
  gameId: GameIdType;
  indexPlayer: IndexPlayerType;
  killed: number;
}
