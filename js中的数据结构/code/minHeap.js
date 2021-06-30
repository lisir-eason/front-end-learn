class MinHeap {
  constructor(){
    this.heap = []
  }

  swap(index1, index2){
    const temp = this.heap[index1]
    this.heap[index1] = this.heap[index2]
    this.heap[index2] = temp
  }

  getParentIndex(i){
    return (i -1) >> 1
  }

  getLeftIndex(i) {
    return i * 2 + 1
  }

  getRightIndex(i) {
    return i * 2 + 2
  }

  shitUp(index){
    if (index === 0) return
    const parentIndex = this.getParentIndex(index)
    if (this.heap[parentIndex] > this.heap[index]) {
      this.swap(parentIndex, index)
    }
  }

  insert(value){
    this.heap.push(value)
    this.shitUp(this.heap.length - 1)
  }

  shitDown(index){
    const leftIndex = this.getLeftIndex(index)
    const rightIndex = this.getRightIndex(index)
    if (this.heap[leftIndex] < this.heap[index]) {
      this.swap(leftIndex, index)
      this.shitDown(leftIndex)
    }
    if (this.heap[rightIndex] < this.heap[index]) {
      this.swap(rightIndex, index)
      this.shitDown(rightIndex)
    }
  }

  // 删除堆顶，时间复杂度为O(logn)
  pop(){
    this.heap[0] = this.heap.pop()
    this.shitDown(0)
  }

  peek(){
    return this.heap[0]
  }

  size(){
    return this.heap.length
  }
}

const h = new MinHeap()
h.insert(3)
h.insert(2)
h.insert(1)
h.pop()
console.log(h.heap);