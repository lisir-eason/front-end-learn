# React源码解析（四）：WorkLoop

在上一章的分析scheduler的时候，在最后我们看到了调用workloop的代码：

```js
do {
  try {
    workLoopConcurrent();
    break;
  } catch (thrownValue) {
    handleError(root, thrownValue);
  }
} while (true);

function workLoopConcurrent() {
  // shouldYield()是否需要暂停
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

其实还有一个**workLoopSync**，对应的是同步更新的模式，可以看到同步模式无法被scheduler打断。

```js
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
```

那么workloop究竟做了什么呢？我们这一章来分析下，总的流程可以分为两步：

1.beginWork：这里主要从根节点向下调和child，更新或者创建fiber节点信息。

2.completeUnitOfWork：这里主要遍历subling，如果有的话，执行perfomUnitOfWork。没有subling的时候开始向上完成父节点，并把effects合并到父节点，直到rootFiber。

![reconciler](https://i.loli.net/2021/07/01/JjOG9P2mvi3bEHu.jpg)

图中表示的是一个简单的应用workloop的顺序，绿色的为beginWork，红色的completeWork。

## 1.beginWork

直接上源码：

```js
function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  setCurrentDebugFiberInDEV(unitOfWork);

  let next;
  if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
    //给unitOfWork的子树挂载（生成Fiber对象）并返回，如果有就对比
    next = beginWork(current, unitOfWork, subtreeRenderLanes);
  } else {
    next = beginWork(current, unitOfWork, subtreeRenderLanes);
  }

  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    //如果没有child了,说明遍历child已经到底，开始向上遍历整个树，完成所有的work
    completeUnitOfWork(unitOfWork);
  } else {
    //如果有child,则继续performUnitOfWork
    workInProgress = next;
  }

  ReactCurrentOwner.current = null;
}
```

可以看到beginWork会返回一个next，其实就是workInProgress节点的child。如果有的话，继续向下开始调和child节点。如果没有的话，说明已经到头了，开始completeWork的工作。

再来看看beginWork的代码：判断current是不是为null，以此来决定是首次mount还是update。然后根据workInProgress的tag，判断当前的节点类型，在使用不同的方法生成或者更新fiber。比如class component就需要调用render函数返回子节点的内容。

```js
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  if (current !== null) {
    //...
    if (
      oldProps !== newProps ||
      hasLegacyContextChanged()
    ) {
      didReceiveUpdate = true;
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
	//...这里有个优化就是，没有pendingWork的时候就跳出了
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  } else {
    didReceiveUpdate = false;
  }
 switch (workInProgress.tag) {
     case IndeterminateComponent: {
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes,
      );
    }
    //....
 }
}
```

## 2.completeUnitOfWork

我们再来看completeUnitOfWork的源码，适当删减一些无用的代码。可以看到，**在completeUnitOfWork阶段，一个最主要的事情就是把子节点的effects全部合并到父节点**。另外检查有没有兄弟节点，如果有的话，需要遍历兄弟节点开始工作。如果没有的话，就可以开始对父节点执行completeUnitOfWork，直到rootFiber，并给当前的fiber节点打上完成的标签。

```js
function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  //这里从最底下的节点向上completeWork 先看它的siblingFiber有没有，有的话就把它加入workInProgram
  //否则，就把completedWork设置为它的父节点returnFiber
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    // Check if the work completed or if something threw.
    if ((completedWork.flags & Incomplete) === NoFlags) {
      let next;
      //创建对应的实例并挂载到当前fiber的stateNode
      next = completeWork(current, completedWork, subtreeRenderLanes);

      if (next !== null) {
        workInProgress = next;
        return;
      }

      if (
        returnFiber !== null &&
        // Do not append effects to parents if a sibling failed to complete
        (returnFiber.flags & Incomplete) === NoFlags
      ) {
       //这里就是将子节点的effects合并到父节点。
        if (returnFiber.firstEffect === null) {
            returnFiber.firstEffect = completedWork.firstEffect;
        }
        if (completedWork.lastEffect !== null) {
            if (returnFiber.lastEffect !== null) {
                returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
            }
            returnFiber.lastEffect = completedWork.lastEffect;
        }
      }
    } else {
      const next = unwindWork(completedWork, subtreeRenderLanes);

      //... 当前节点没有完成，可能出错了怎么的。。
    }

    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // 有兄弟节点开始调和兄弟节点
      workInProgress = siblingFiber;
      return;
    }
    // 否则的话就开始工作父节点
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);

  // 到达fiberRoot
  if (workInProgressRootExitStatus === RootIncomplete) {
    workInProgressRootExitStatus = RootCompleted;
  }
}
```

## 3.finishedWork

完成所有工作后，将root.current.alternate，也就是rootFiber的workInProgress树赋值到root.finishedWork。

```js
const finishedWork: Fiber = (root.current.alternate: any);
root.finishedWork = finishedWork;
root.finishedLanes = lanes;
commitRoot(root);
```

至此，workloop完结~
