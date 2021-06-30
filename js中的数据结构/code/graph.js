const graph = {
  0: [1, 2],
  1: [2],
  2: [0, 3],
  3: [3]
}

//深度优先遍历
// const visited = new Set()
// const dbs = (n) => {
//   console.log(n);
//   visited.add(n)
//   graph[n].forEach(item => {
//     if (!visited.has(item)) {
//       dbs(item)
//     }
//   });
// }
// dbs(2)

//广度优先遍历
const visited = new Set()
visited.add(2)
const queue = [2]
while (queue.length) {
  const n = queue.shift()
  console.log(n);
  visited.add(n)
  graph[n].forEach(item => {
    if (!visited.has(item)) {
      queue.push(item)
    }
  });
}