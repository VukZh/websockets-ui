const botAttack = (openedArray) => {
  const closedCell = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (!openedArray[i][j]) {
        closedCell.push([i, j]);
      }
    }
  }
  const randomCell = Math.floor(Math.random() * closedCell.length);
  return [
    closedCell[randomCell][0],
    closedCell[randomCell][1]
  ]
}

export default botAttack;