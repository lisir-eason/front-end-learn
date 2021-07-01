# React源码解析（三）：Scheduler

## 1.什么是Scheduler,为什么需要它？

Scheduler是独立于react的一个包工具，react也在未来计划将其单独作为一个包发布。**它主要是作为“指挥员”，告诉react应该什么时候开始工作，什么时候暂停工作，以及将任务优先级排序，先调度优先级高的任务。**为什么需要Scheduler呢？我觉得主要的目的还是为了性能优化。举个例子，比如当我们的fiber树更新比较庞大，这样就会消耗巨大的时间在js上，而我们的js是单线程，也就是说这段时间页面的渲染和用户的交互可能会因为js的执行而被限制，进而造成页面卡顿的情况。因此React为了优化性能，所以加入了Scheduler。假设我们的设备刷新率是60hz，那么每一帧动画执行的时间就是16.6ms，Schedule就在react计算的过程中给react每帧5ms（默认就是5ms）的时间去执行，超过这个时间就暂停js执行，把控制权交给浏览器去渲染，这样页面就不会应为过久地执行js而造成卡顿。开启react的concurrent mode，详情可见[Concurrent Mode](https://zh-hans.reactjs.org/docs/concurrent-mode-adoption.html)。

![concurrent](https://i.loli.net/2021/07/01/xVusFShCDRflaXn.jpg)

## 2.实现原理

要想实现暂停js执行，把执行权交给浏览器这样的功能，需要满足以下两点：

1. 暂停 JS 执行，将主线程还给浏览器，让浏览器有机会更新页面。
2. 在未来某个时刻继续调度任务，执行上次还没有完成的任务。

要满足这两点就需要调度一个宏任务，因为宏任务是在下次事件循环中执行，不会阻塞本次页面更新。而**微任务是在本次页面更新前执行**，与同步执行无异，不会让出主线程。关于js的事件循环可以看[这个视频](https://www.bilibili.com/video/BV1kf4y1U7Ln?from=search&seid=14859420704526145289)，讲的非常好。

如何创建宏任务呢？scheduler优先使用**MessageChannel**，如果平台不支持则使用**setTimeout**。

```js
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

//...这里就发送一个message，生成宏任务，port1的回调函数performWorkUntilDeadline，就会在下个事件循环开始的时候执行。
port.postMessage(null);
```

为什么不使用requestAnimationFrame？因为requestAnimationFrame触发时间不稳定且兼容性低。

## 3.unstable_scheduleCallback

我们先看下scheduler的入口方法：**unstable_scheduleCallback**，创建一个新的任务回调。如果当前任务延迟调用（没有过期）则放入**timerQueue**，否则放入**taskQueue**。

```js
function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = getCurrentTime();
  //这里简化了代码，默认startTime就是currentTime
  var startTime = currentTime;

  var timeout; //根据优先级设置timeout，优先级越高，timeout越小
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }

  //设置过期时间
  var expirationTime = startTime + timeout;

  //创建新任务
  var newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };
  if (enableProfiling) {
    newTask.isQueued = false;
  }
    
  newTask.sortIndex = expirationTime; //将task的sortIndex设置为expirationTime
  push(taskQueue, newTask);  //将任务加到小顶堆中国

  //注册一个主回调函数 flushWork
  if (!isHostCallbackScheduled && !isPerformingWork) {
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork);
  }
  return newTask;
}
```

## 4.flushWork、workLoop

在上面的unstable_scheduleCallback中我们注册了主回调函数flushWork，当所有任务都加入到队列后，接下来就会执行这个方法启动工作。

**flushWork**：这个方法调用了workLoop， 返回workLoop的返回值。

```js
function flushWork(hasTimeRemaining, initialTime) {
  //简化了代码，调用workLoop
  return workLoop(hasTimeRemaining, initialTime);
}
```

**workLoop：**这个方法开始工作循环，优先选择小顶堆中优先级最高的任务执行，**如果这个任务的callback函数返回的是个function，说明它还没有执行完等待下次的执行时机，如果不是function说明当前任务执行完了**。这点判断很隐秘，需要注意。

```js
function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  advanceTimers(currentTime);  //这里检查timerQueue中是否有过期的，如果有就加入到taskQueue
  currentTask = peek(taskQueue); //从小顶堆中获取优先级最高的任务，也就是队列的第一个[0]
  while (
    currentTask !== null &&
    !(enableSchedulerDebugging && isSchedulerPaused)
  ) {
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || shouldYieldToHost())
    ) {
      // This currentTask hasn't expired, and we've reached the deadline.
      break;
    }
    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      if (typeof continuationCallback === 'function') {
        //如果callback执行完返回的continuationCallback，说明任务被暂停了，没有执行完
        currentTask.callback = continuationCallback;
      } else {
		//出队
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
      //继续检查timerQueue中是否有过期的
      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }
    //继续选择优先级最高的任务，直至为null
    currentTask = peek(taskQueue);
  }
  // Return whether there's additional work
  if (currentTask !== null) {
    return true;
  } else {
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}
```

## 5.react和scheduler结合

以concurrent模式为例，在ensureRootIsScheduled中有一段这样的代码：

```js
//...
newCallbackNode = scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root),
);
root.callbackNode = newCallbackNode;
```

很好理解，这里就是生成了一个优先级为schedulerPriorityLevel、callback为performConcurrentWorkOnRoot的任务。**这里绑定了root，所以回调performConcurrentWorkOnRoot中的第一个参数始终为root**。

**scheduleCallback & scheduleSyncCallback：**

```js
//concurrent模式下
export function scheduleCallback(
  reactPriorityLevel: ReactPriorityLevel,
  callback: SchedulerCallback,
  options: SchedulerCallbackOptions | void | null,
) {
  //react的优先级（lanes）转化为scheduler的优先级
  const priorityLevel = reactPriorityToSchedulerPriority(reactPriorityLevel);
  return Scheduler_scheduleCallback(priorityLevel, callback, options);
}

//同步模式下
export function scheduleSyncCallback(callback: SchedulerCallback) {
  if (syncQueue === null) {
    syncQueue = [callback];
    // 以最高优先级生成一个task并加入到队列中，同时在host挂载flushWork
    immediateQueueCallbackNode = Scheduler_scheduleCallback(
      Scheduler_ImmediatePriority,
      flushSyncCallbackQueueImpl,
    );
  } else {
    syncQueue.push(callback);
  }
  return fakeCallbackNode;
}
```

那么react又是怎么被中断的呢？看它的回调函数中，这里是不是很熟悉？没错，就是当被中断时返回performConcurrentWorkOnRoot这样的function,否则返回null表示任务已经完成。

```js
function performConcurrentWorkOnRoot(root) {
  let exitStatus = renderRootConcurrent(root, lanes);
  //...
  if (root.callbackNode === originalCallbackNode) {
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  return null;
}
```

在**renderRootConcurrent**中，我们调用了**workLoopConcurrent**，而**shouldYield()**就是shcheduler告诉react是否还有时间去继续workLoop，如果没有时间就需要暂停跳出循环。

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

至此，所有的流程都看完了，总结一下吧。

在concurrent模式下，scheduler用shouldYield()告诉react需不需要暂停，而当任务被暂停时，react判断root.callbackNode是不是等于originalCallbackNode？如果是的话则返回一个functuon，如果不是的话返回null。而scheduler那边，刚好通过判断callback的返回值来确定当前的任务是否执行完了。OK，scheduler

的源码分析就到这里了。
