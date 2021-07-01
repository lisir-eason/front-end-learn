# React源码解析（六）：Hooks

我们知道函数组件相比于class组件，没有实例所以不能有独立的state，也没有生命周期函数。而Hooks的出现，使得函数组件可以模拟实现这些功能，从而弥补函数组件的不足。另外，在class组件中，逻辑复用很难。相同的逻辑，可能在componentDidMount中使用，也可能在componentWillReceiveProps中使用，其实它们本来就应该是同一个逻辑，而因为生命周期函数分布在不同的方法中。而useEffects这样的hook就可以使得相同的逻辑写在一起，从而模拟各种生命周期函数，也方便封装同一逻辑。那么Hooks是怎么实现的呢？本章就来看看。

![fiberNode](https://i.loli.net/2021/07/01/aPuGjqgk3zIKnNO.png)

## 1.useState

 在hook源码中hook存在于Dispatcher中，Dispatcher就是一个对象，不同hook 调用的函数不一样，全局变量ReactCurrentDispatcher.current会根据是mount还是update赋值为HooksDispatcherOnMount或HooksDispatcherOnUpdate。

```js
ReactCurrentDispatcher.current =
      current === null || current.memoizedState === null
        ? HooksDispatcherOnMount
        : HooksDispatcherOnUpdate;

const HooksDispatcherOnMount = {
  useContext: readContext,
  useEffect: mountEffect,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState,
};

const HooksDispatcherOnUpdate = {
  useContext: readContext,
  useEffect: updateEffect,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState,
};
```

mount阶段：

```js
function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = hook.baseState = initialState; //初始值
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,  //因为一般initialState都是值，所以basicStateReducer()返回的就是initialState
    lastRenderedState: (initialState: any),
  });
  const dispatch = (queue.dispatch = (dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  )));
  return [hook.memoizedState, dispatch];
}
```

由此可见，mount后返回的第二个参数是**dispatchAction**，主要将update加入queue.pending，当更新阶段时，它就会去更新。

```js
function dispatchAction(fiber, queue, action) {
  //fiber对应当前fiber对象，一般为function component;queue就是上面创建的hook.queue;action就是setState方法传的参数，即将要改变的值。

  const eventTime = requestEventTime();
  const lane = requestUpdateLane(fiber);

  const update = {
    lane,
    action,
    eagerReducer: null,
    eagerState: null,
    next: (null: any),
  };

  // 将更新附加到列表的末尾，pending为环状链表
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
    
  const lastRenderedReducer = queue.lastRenderedReducer;
    if (lastRenderedReducer !== null) {
       const currentState = queue.lastRenderedState;
       const eagerState = lastRenderedReducer(currentState, action);
       update.eagerReducer = lastRenderedReducer;
       update.eagerState = eagerState;
    }
    scheduleUpdateOnFiber(fiber, lane, eventTime);
}
```

update阶段：

```js
function updateReducer(reducer, initialArg, init) {
  //获取当前工作中的hook，因为hook是个链状结构，所以从头遍历
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  queue.lastRenderedReducer = reducer;

  const current = currentHook;
  let baseQueue = current.baseQueue;

  //开始工作上面dispatchAction加入进来的update
  const pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      //合并baseQueue和pendingQueue
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next;
      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }

  if (baseQueue !== null) {
    const first = baseQueue.next;
    let newState = current.baseState;

    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let update = first;
    do {
      const updateLane = update.lane;
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        //update没有足够的优先级
      } else {
        // update有足够的优先级
        if (newBaseQueueLast !== null) {
          const clone: Update<S, A> = {
            lane: NoLane,
            action: update.action,
            eagerReducer: update.eagerReducer,
            eagerState: update.eagerState,
            next: (null: any),
          };
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }

        // 执行这个update.获取newState
        if (update.eagerReducer === reducer) {
          newState = ((update.eagerState: any): S);
        } else {
          const action = update.action;
          newState = reducer(newState, action);
        }
      }
      update = update.next;
    } while (update !== null && update !== first);

    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = (newBaseQueueFirst: any);
    }

	//更新hook的状态
    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;

    queue.lastRenderedState = newState;
  }

  const dispatch: Dispatch<A> = (queue.dispatch: any);
  //更新后返回的就是新的state
  return [hook.memoizedState, dispatch];
}
```

总结：useState在mount和update阶段调用不同的方法返回一个数组，一个是当前值，一个是改变这个值的方法。当调用这个改变值的方法时，给这个hook的queue.pending加入updata，然后调用scheduleUpdateOnFiber。此时function component就会重新渲染，而这个hook就进入了update阶段。此时调用updateReducer，处理之前的queue.pending计算出新的newState，并返回。所以function component得到了更新。

## 2.useEffect

首先mount阶段：创建新的effect并挂载到 hook.memoizedState和对应fiber的updateQueue。

```js
function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= fiberFlags;
  //新的effect挂载到hook.memoizedState
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps,
  );
}

function pushEffect(tag, create, destroy, deps) {
  //创建新的effect，保存回调函数create和依赖数组deps
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    // Circular
    next: (null: any),
  };
  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
    //挂载到对应fiber的updateQueue
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}
```

update阶段：更新hook.memoizedState和对应fiber的updateQueue。

```js
function updateEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;

  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      //浅对比deps是否发生了改变
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        pushEffect(hookFlags, create, destroy, nextDeps);
        return;
      }
    }
  }

  currentlyRenderingFiber.flags |= fiberFlags;

  //更新hook的memoizedState的deps为nextDeps
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps,
  );
}
```

执行阶段：commit阶段的commitLayoutEffects函数中会调用schedulePassiveEffects，将useEffect的销毁和回调函数push到pendingPassiveHookEffectsUnmount和pendingPassiveHookEffectsMount中，然后在mutation之后调用flushPassiveEffects依次执行上次render的销毁函数回调和本次render 的回调函数。

```js
function flushPassiveEffectsImpl () {
    const unmountEffects = pendingPassiveHookEffectsUnmount;
    pendingPassiveHookEffectsUnmount = [];
    for (let i = 0; i < unmountEffects.length; i += 2) {
      const effect = ((unmountEffects[i]: any): HookEffect);
      const fiber = ((unmountEffects[i + 1]: any): Fiber);
      const destroy = effect.destroy;
      effect.destroy = undefined;

      if (typeof destroy === 'function') {
        try {
          destroy();//销毁函数执行
        } catch (error) {
          captureCommitPhaseError(fiber, error);
        }
      }
    }

    const mountEffects = pendingPassiveHookEffectsMount;
    pendingPassiveHookEffectsMount = [];
    for (let i = 0; i < mountEffects.length; i += 2) {
      const effect = ((mountEffects[i]: any): HookEffect);
      const fiber = ((mountEffects[i + 1]: any): Fiber);

      try {
        const create = effect.create;//创建函数执行
        effect.destroy = create(); 
      } catch (error) {
        captureCommitPhaseError(fiber, error);
      }
    }
}
```

总结：useEffect会把回调函数（create）、销毁函数（destroy）、依赖（deps）新建一个effect保存到 hook.memoizedState和对应fiber的updateQueue。当组件更新时，浅对比deps是否发生了改变，决定是否更新我们的effect。最后在commitLayoutEffects中调用flushPassiveEffectsImpl，执行create函数和destroy函数。