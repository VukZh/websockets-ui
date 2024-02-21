import {GameType, IndexedFieldsType, RoomType, ShipsUserType, StatusType, UserType} from "./models/types.js";

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
  console.log("indexArray", indexArray, indexField, Math.max(...indexArray))
  return indexArray.length ? Math.max(...indexArray) : 0;
}

const getId = () => {
  return Number(Math.random().toFixed(6).split(".")[1]);
}

const shipsMatrix = (ships: Array<ShipsUserType>): Array<Array<boolean>> => {
  const matrix = Array.from({length: 10}, () => Array.from({length: 10}).fill(false));
  ships.forEach((s) => {
    const isVertical = s.direction;
    const length = s.length;
    const x = s.position.x;
    const y = s.position.y;
    if (isVertical) {
      for (let i = 0; i < length; i++) {
        matrix[x][y + i] = true;
        // console.log("v", x, y + i)
      }
    } else {
      for (let i = 0; i < length; i++) {
        matrix[x + i][y] = true;
        // console.log("h", x + i, y)
      }
    }
  })
  return matrix as Array<Array<boolean>>;
}

// const setOpenedMatrix = (x: number, y: number, opened: Array<Array<boolean>>) => {
//   opened[x][y] = true;
//   return [...opened];
// };
//
// const stateShip = (x: number, y: number, matrix: Array<Array<boolean>>, opened: Array<Array<boolean>>) => {
//   let state = StatusType.MISS;
//   if (!opened[x][y] && matrix[x][y] === true) {
//     state = StatusType.SHOT;
//     if (x - 1 >= 0 && (opened[x - 1][y] && matrix[x - 1][y] === true || !opened[x - 1][y] && matrix[x - 1][y] === false)) {
//       if (x + 1 <= 9 && (opened[x + 1][y] && matrix[x + 1][y] === true || !opened[x + 1][y] && matrix[x + 1][y] === false)) {
//         if (y - 1 >= 0 && (opened[x][y - 1] && matrix[x][y - 1] === true || !opened[x][y - 1] && matrix[x][y - 1] === false)) {
//           if (y + 1 <= 9 && (opened[x][y + 1] && matrix[x][y + 1] === true || !opened[x][y + 1] && matrix[x][y + 1] === false)) {
//             state = StatusType.KILLED;
//           }
//         }
//       }
//     }
//   }
//   return state;
// }

const stateShip = (x: number, y: number, matrix: Array<Array<boolean>>, openedMatrix: Array<Array<boolean>>) => {
  console.log("openedMatrix", openedMatrix)
  let state = StatusType.MISS;
  const sheep = [[x, y]];
  if (matrix[x][y] === true) {
    state = StatusType.SHOT;
    let shotCount = 1;
    let xx = x;
    while (xx >= 1) {
      xx--;
      if (matrix[xx][y]) {
        sheep.push([xx, y]);
        shotCount = openedMatrix[xx][y] ? shotCount + 1 : shotCount;
      } else {
        break;
      }
    }
    xx = x;
    while (xx <= 8) {
      xx++;
      if (matrix[xx][y]) {
        sheep.push([xx, y]);
        shotCount = openedMatrix[xx][y] ? shotCount + 1 : shotCount;
      } else {
        break;
      }
    }
    let yy = y;
    while (yy >= 1) {
      yy--;
      if (matrix[x][yy]) {
        sheep.push([x, yy]);
        shotCount = openedMatrix[x][yy] ? shotCount + 1 : shotCount;
      } else {
        break;
      }
    }
    yy = y;
    while (yy <= 8) {
      yy++;
      if (matrix[x][yy]) {
        sheep.push([x, yy]);
        shotCount = openedMatrix[x][yy] ? shotCount + 1 : shotCount;
      } else {
        break;
      }
    }
    console.log("SSSSheep", sheep, shotCount)

    if (sheep.length === shotCount) {
      state = StatusType.KILLED;
    }

    // state = StatusType.SHOT;
    // if ((x - 1 >= 0 && matrix[x - 1][y] === false) || (x - 1 < 0)) {
    //   if ((x + 1 <= 9 && matrix[x + 1][y] === false) || (x + 1 > 9) ) {
    //     if ((y - 1 >= 0 && matrix[x][y - 1] === false) || (y - 1 < 0)) {
    //       if ((y + 1 <= 9 && matrix[x][y + 1] === false) || (y + 1 > 9)) {
    //         state = StatusType.KILLED;
    //       }
    //     }
    //   }
    // }
  }
  return {
    state: state,
    sheep: sheep
  };
}

const additionalFields = (coordinates: number[][]) => {
  let minX = Math.min(...coordinates.map(c => c[0])) - 1;
  let maxX = Math.max(...coordinates.map(c => c[0])) + 1;
  let minY = Math.min(...coordinates.map(c => c[1])) - 1;
  let maxY = Math.max(...coordinates.map(c => c[1])) + 1;

  minX = minX < 0 ? 0 : minX;
  maxX = maxX > 9 ? 9 : maxX;
  minY = minY < 0 ? 0 : minY;
  maxY = maxY > 9 ? 9 : maxY;

  console.log("...", coordinates, minX, maxX, minY, maxY)

  const result = [];
  for (let xx = minX; xx <= maxX; xx++) {
    for (let yy = minY; yy <= maxY; yy++) {
      result.push([xx, yy])
    }
  }
  return result.filter(r => !coordinates.map(c => c.toString()).includes(r.toString()));
}

export {str, prs, lastIndex, getId, shipsMatrix, stateShip, additionalFields};