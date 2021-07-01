# React源码解析（五）：Commit

commit阶段，这里就不能被Scheduler打断了。这个阶段已经准备好了所有的effects(更新)。主要就是将更新或者创建新节点应用到dom上。主要执行了commitBeforeMutationEffects，commitMutationEffects，commitLayoutEffects这三个阶段。其中真正的dom更新发生在commitMutationEffects，而componentDidMount等生命周期函数发生在commitLayoutEffects阶段。

所有的逻辑在commitRootImpl中，来看看commitRootImpl这个函数：

```js
function commitRootImpl(root, renderPriorityLevel) {
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  root.callbackNode = null;

  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  markRootFinished(root, remainingLanes);

  //重置workInProgress相关
  if (root === workInProgressRoot) {
    workInProgressRoot = null;
    workInProgress = null;
    workInProgressRootRenderLanes = NoLanes;
  }

  // 获取effects链表
  let firstEffect;
  firstEffect = finishedWork.firstEffect;

  if (firstEffect !== null) {
    ReactCurrentOwner.current = null;

    //第一阶段是“更新前”阶段。我们使用这个阶段来读取宿主树的状态，就在我们更新它之前。这就是调用getSnapshotBeforeUpdate的地方。
    nextEffect = firstEffect;
    do {
       commitBeforeMutationEffects();
    } while (nextEffect !== null);

    // 下一个阶段是更新阶段，我们对宿主树进行更新。
    nextEffect = firstEffect;
    do {
      commitMutationEffects(root, renderPriorityLevel);
    } while (nextEffect !== null);

    resetAfterCommit(root.containerInfo);
    root.current = finishedWork;

    nextEffect = firstEffect;
    do {
       commitLayoutEffects(root, lanes);
    } while (nextEffect !== null);

    nextEffect = null;

    // 告诉Scheduler在帧的末尾让步，这样浏览器就有机会绘制。
    requestPaint();
  } else {
    // No effects.
    root.current = finishedWork;
  }

  // If layout work was scheduled, flush it now.
  flushSyncCallbackQueue();

  return null;
}

```

主要看下**commitMutationEffects**的源码，其它两个阶段意义不是很大。这里我们看到，每个effect的都有flags，标记这个节点是插入还是更新或者是删除，因此对不同的effect执行不同的dom操作。接下去的任务就是dom操作，比较简单，所以不再深入看下去了。

```js
function commitMutationEffects(
  root: FiberRoot,
  renderPriorityLevel: ReactPriorityLevel,
) {
  while (nextEffect !== null) {
    const flags = nextEffect.flags;

    // 下面的switch语句只涉及插入、更新和删除。
    const primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
    switch (primaryFlags) {
      case Placement: {
        commitPlacement(nextEffect);
        nextEffect.flags &= ~Placement;
        break;
      }
      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect);
        nextEffect.flags &= ~Placement;

        // Update
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Update: {
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Deletion: {
        commitDeletion(root, nextEffect, renderPriorityLevel);
        break;
      }
    }
      
    nextEffect = nextEffect.nextEffect;
  }
}
```

