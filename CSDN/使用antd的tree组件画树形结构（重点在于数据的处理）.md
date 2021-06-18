二话不说先上代码

```javascript
import _ from 'underscore'
import $ from 'jquery'

let spreadArr = []

//功能id树的方法
export function changeToTree(data,name,id) {
	//原始数据 名称数组 id数组
	return createTreeData(getAllNodes(data, name, id))
}

//统计日志树的方法
export function statisticsLogTree(data,name,id,sj,pipes) {
	//原始数据 名称数组 id数组 升降序的数组 展开的层数

	//获取总层数
	const pipesNum = id.length

	//为了保证最后树中所有的key唯一，用‘-’拼接
	let copyData = $.extend({}, true, data)
	let idArrList = []

	//对copyData进行排序
	for (let i = 1; i <= pipesNum; i++){
		if (sj[i - 1] == '1') {
			copyData[`listReturn${i}`].reverse()
		}
	}

	//修改id值 得修改所有的list 因为要取得顺序
	for (let i = 1; i <= pipesNum; i++) {
		copyData[`listReturn${i}`] = copyData[`listReturn${i}`].map((v) =>{
			for (let j = 1; j <= i; j++) {
				v[id[j - 1]] = (v[id[j - 2]] ? (v[id[j - 2]] + '-' + v[id[j - 1]]) : v[id[j - 1]]).toString()
			}
			return v
		})
	}

	//获取id的list 用来确定顺序
	for (let i = 1; i <= pipesNum; i++) {
		idArrList.push(_.uniq(_.pluck(copyData[`listReturn${i}`], id[i - 1])).filter(val=>val))
	}

	//把最后一层的数据先拿出来 最后要做树用
	let treeDate = copyData[`listReturn${pipesNum}`].map(item =>{
		return $.extend({}, true, item)
	})

	//循环把count拼到name中去
	for (let i = 1; i <= pipesNum; i++ ){
		copyData[`listReturn${i}`].map(v=>{
			treeDate.map((item, index) =>{
				if (v[id[i - 1]] == item[id[i - 1]]) {
					treeDate[index][name[i - 1]] = `${v[name[i - 1]]}  ${v.count}`
				}
			})
		})
	}

	//获取展开层数的节点key
	spreadArr = []
	for (let i = 0; i < pipes; i++ ){
		if (idArrList[i]) {
			spreadArr = [...spreadArr, ...idArrList[i]]
		}

	}

	let result = createTreeData(getAllNodes(treeDate, name, id, idArrList))
	result['spreadArr'] = spreadArr

	return result
}

function getAllNodes(data, nameArr, idArr, idArrList) {

	const targetArr = []
	let obj = {
		key: null,
		parent_key: null,
		title: null
	}

	let idList = []

	if (idArrList) {
		idList = idArrList
	} else {
		idList = idArr.map(item => {
			return _.uniq(_.pluck(data, item)).filter(val=>val)
		})
	}

	idList.map((item, index)=>{
		item.map(el=>{
			let flag = true
			data.map((item)=>{
				if (item[idArr[index]] === el && flag) {
					obj.key = el
					obj.title = item[nameArr[index]]
					if (index === 0) {
						obj.parent_key = '#'
					} else {
						if (!item[idArr[index - 1]]) {
							obj.parent_key = item[idArr[0]]
						} else {
							obj.parent_key = item[idArr[index - 1]]
						}
					}
					targetArr.push({...obj})
					flag = false
				}
			})

		})
	})


	return targetArr
}

function createTreeData(data) {
	let initData = {key:'#', children:[]}

	$.each(data, function(i, n) {
		n['children']=[];
		initData = initTreeData(initData, n);
	});

	return initData
}

function initTreeData(b, d) {
	if(b.key == d.parent_key) {
		b['children'].push(d);
		return b;
	}
	if(0 == b['children'].length) {
		return b;
	}
	$.each(b['children'], function(i, n) {
		b['children'][i]= initTreeData(b['children'][i], d);
	});
	return b;
}

```
#### 主要方法解释
statisticsLogTree()该方法主要是讲后台返回的接口转换成需要的格式，比如：可能在title里显示总数；
getAllNodes()该方法主要是把数据拆分成一个一个小节，每一节都有自己的id，还有它的父id，还有他的children们；
createTreeData()这个方法就是组装树的过程，方法很简单，采用了递归的思想，从树的根部开始拼整棵树，如果有children就把此方法再递归调用，如此下来就可以拼成整个树！、
具体的代码实现，比较复杂的部分都写了注释。
