import {GameType, IndexedFieldsType, RoomType, UserType} from "./models/types.js";

const str = (obj) => {
  try {
    return JSON.stringify(obj)
  } catch (e) {
    throw new Error("error json stringify")
  }
}

const prs = (str) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    throw new Error("error json parse")
  }
}

const lastIndex = (arr: Array<UserType> | Array<RoomType> | Array<GameType>, indexField: IndexedFieldsType) => {
  const indexArray = arr.map(item => item[indexField]) as Array<number>;
  return Math.max(...indexArray);
}

export {str, prs, lastIndex};