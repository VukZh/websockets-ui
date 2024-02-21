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
}

enum ShipType {
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

// type UserTypeFEType = {
//   name: string;
//   password: string;
// }
//
// type UserTypeBEType = {
//   index: number;
//   error: boolean;
//   errorText: string;
// }
// export type UserType = UserTypeFEType & UserTypeBEType;

export type UserType = {
  name: string;
  password: string;
  index: IndexPlayerType;
  roomId?: RoomIdType;
  gameId?: GameIdType;
  wins?: number;
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
  currentPlayer: IndexPlayerType;
  status: StatusType;
  winPlayer: IndexPlayerType;
}

// type WinnerType = {
//   name: string;
//   wins: number;
// }

// type RoomType = {
//   indexRoom: RoomIdType;
// };

type IndexPlayerType = number;

type GameIdType = number;

type RoomIdType = number;

// type CreatedGameType = {
//   idGame: GameIdType;
//   idPlayer: IndexPlayerType;
// }

// export type RoomBEType = RoomType & CreatedGameType;

// type RoomUserType = {
//   name: string;
//   index: number;
// }

// type UpdatedRoomType = {
//   roomId: RoomIdType;
//   roomUsers: Array<RoomUserType>
// }

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
  gameId: GameIdType;
  indexPlayer: IndexPlayerType;
}

// type AttackFEType = {
//   gameId: GameIdType,
//   x: number,
//   y: number,
//   indexPlayer: IndexPlayerType
// }
//
// type AttackBEType = {
//   position: PositionType,
//   currentPlayer: IndexPlayerType,
//   status: StatusType
// }

// type RandomAttackType = {
//   gameId: GameIdType,
//   indexPlayer: IndexPlayerType
// }
//
// type TurnType = {
//   currentPlayer: IndexPlayerType
// }
//
// type FinishType = {
//   winPlayer: IndexPlayerType
// }