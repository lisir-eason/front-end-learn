const arr = [1, 2, 3, 3, 2]

//new set
const set = new Set(arr)

//去重
const arr2 = [...set]
const arr3 = Array.from(set)

//判断元素是否在集合中
const has = set.has(1)

//求交集
const set2 = new Set([3, 4])
const set3 = new Set([...set].filter(item => set2.has(item)))

//添加元素
set.add(5)
set.add({value: 'a'})

//删除元素
set.delete(1)

//遍历：可以for..of.. 或者转成数组遍历
for (const item of set) {
  console.log(item);
}