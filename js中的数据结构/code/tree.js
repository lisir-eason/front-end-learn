const tree = {
  val: 'a',
  children: [
    {
      val: 'b',
      children:[
        {
          val: 'd',
          children: []
        },
        {
          val: 'e',
          children: []
        }
      ]
    },
    {
      val: 'c',
      children: []
    }
  ]
}

//深度优先遍历
const dfs = (root) => {
  console.log(root.val);
  root.children.forEach(item => {
    dfs(item)
  })
}

dfs(tree)

//广度优先遍历 队头入队，队头出队，访问对头，children入队
const bfs = (root) => {
  const queue = [root]
  while (queue.length > 0) {
    const node = queue.shift()
    console.log(node.val); 
    node.children.forEach(element => {
      queue.push(element)
    });
  }
}

bfs(tree)

const bt = {
  val: 1,
  left: {
    val: 2,
    left: {
      val: 4,
      left: null,
      right: null
    },
    right: {
      val: 5,
      left: null,
      right: null
    }
  },
  right: {
    val: 3,
    left: {
      val: 6,
      left: null,
      right: null
    },
    right: {
      val: 7,
      left: null,
      right: null,
    }
  }
}

//先序遍历 根->左->右
// const preOrder = (root) => {
//   if (!root) return
//   console.log(root.val);
//   preOrder(root.left)
//   preOrder(root.right)
// } 

//非递归版先序遍历
//思路：利用栈的后进先出原理，先访问当前节点的跟，然后把当前节点的left和right推进栈。
//由于后进先出，因此先要推入right,循环这个操作，直至栈为空
// const preOrder1 = (root) => {
//   if (!root) return
//   const stack = [root]
//   while (stack.length > 0) {
//     const node = stack.pop()
//     console.log(node.val);
//     if (node.right) stack.push(node.right)
//     if (node.left) stack.push(node.left) 
//   }
// } 

// preOrder1(bt)

//中序遍历 左->根->右
// const inOrder = (root) => {
//   if (!root) return
//   inOrder(root.left)
//   console.log(root.val);
//   inOrder(root.right)
// } 

// inOrder(bt)

//非递归版中序遍历 
//思路：先用指针把left全部推入栈中，直到没有left后，弹出当前的（left）节点，并访问它
//然后指针指向它的右节点，重复上述操作
// const inOrder1 = (root) => {
//   if (!root) return
//   const stack = []
//   let p = root
//   while (stack.length || p) {
//     while (p) {
//       stack.push(p)
//       p = p.left
//     }
//     const n = stack.pop()
//     console.log(n.val);
//     p = n.right
//   }
 
// } 

// inOrder1(bt)

//后序遍历 左->右->根
// const postOrder = (root) => {
//   if (!root) return
//   postOrder(root.left)
//   postOrder(root.right)
//   console.log(root.val);
// } 

// postOrder(bt)

//后续遍历的非递归版
//思路：先序遍历倒过来后是右 -> 左 -> 根，我们需要先把左右节点入栈的顺序反过来，访问节点的时候先把它推入另一个栈preStack
// 然后逆序对preStack中的节点访问
const postOrder1 = (root) => {
  if (!root) return
  const stack = [root]
  const preStack = []
  while (stack.length > 0) {
    const node = stack.pop()
    preStack.push(node)
    if (node.left) stack.push(node.left) 
    if (node.right) stack.push(node.right)
  }

  while (preStack.length) {
    const n = preStack.pop()
    console.log(n.val);
  }
} 

postOrder1(bt)