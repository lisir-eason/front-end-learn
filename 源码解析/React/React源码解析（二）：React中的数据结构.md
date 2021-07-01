# React源码解析（二）：React中的数据结构

react中有很多数据结构：树、链表、小顶堆等等。这些数据结构一方面为了方便我们储存需要的数据，另一方面为了优化性能，选取时间复杂度最低的算法计算我们所需的数据，这一章就记录下阅读react源码时看到的数据结构。

## 1.FiberRoot

一个应用一般都只有一个fiberRoot，用于记录该应用更新的一些信息。比如当前的containerInfo，或者是已经完成的任务finishedWork等。那我们先来看看它都有哪些属性吧。

```js
function FiberRootNode(containerInfo, tag, hydrate) {
  this.tag = tag;  //root的类型 LegacyRoot = 0; BlockingRoot = 1; ConcurrentRoot = 2;
  this.containerInfo = containerInfo; //就是传入的根div,id为root的div
  this.pendingChildren = null;
  this.current = null;  //当前的fiber树，指向rootFiber
  this.pingCache = null;
  this.finishedWork = null;  //completeWork最后返回的树，也就是workInProgress，指向rootFiber
  this.timeoutHandle = noTimeout;
  this.context = null;
  this.pendingContext = null;
  this.hydrate = hydrate;  //是否混合模式
  this.callbackNode = null;  //由schedule创建的callback，也就是宏观任务
  this.callbackPriority = NoLanePriority; //由schedule创建的callback的优先级
  this.eventTimes = createLaneMap(NoLanes);  //记录每个优先级任务的开始时间
  this.expirationTimes = createLaneMap(NoTimestamp); //记录每个优先级任务的过期时间时间

  this.pendingLanes = NoLanes;  //挂起的车道
  this.suspendedLanes = NoLanes;  //暂停的车道
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;  //过期的车道
  this.mutableReadLanes = NoLanes;
  this.finishedLanes = NoLanes;  //完成的车道

  this.entangledLanes = NoLanes;  //纠缠的车道
  this.entanglements = createLaneMap(NoLanes);
  // ....
}
```

## 2.Fiber

fiber是根据jsx编译后返回的虚拟dom结构生成的一种**树形数据结构**，为了方便记录节点的各种信息。可以看我这篇博客：[数据结构（六）：树](https://github.com/lisir-eason/front-end-learn/blob/master/js%E4%B8%AD%E7%9A%84%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%EF%BC%88%E5%85%AD%EF%BC%89%EF%BC%9A%E6%A0%91.md)。

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  // 实例
  this.tag = tag; //节点的类型，比如ClassComponent = 1，Fragment = 7
  this.key = key;  //节点的key
  this.elementType = null; //元素类型，这些类型可用于在视觉上区分类型，或启用/禁用某些功能。
  this.type = null; //类型，普通的div就为字符串'div'
  this.stateNode = null; //真实的dom节点

  // Fiber
  this.return = null; //父节点
  this.child = null; //子节点
  this.sibling = null; //兄弟节点
  this.index = 0;

  this.ref = null; //ref

  this.pendingProps = pendingProps;  //挂起的props
  this.memoizedProps = null; //上一次完成渲染后的props
  this.updateQueue = null; //更新的队列，链表
  this.memoizedState = null; //上一次渲染后的state,存放hook的
  this.dependencies = null;

  //当前组件使用的模式：StrictMode = 0b00001; BlockingMode = 0b00010;ConcurrentMode = 0b00100;
  //Fiber被创建的时候他会继承父Fiber其他的标识也可以在创建的时候被设置
  //但是在创建之后不应该再被修改，特别是他的子Fiber创建之前
  //export const NoMode = 0b00000;
  this.mode = mode; 

  // Effects
  this.flags = NoFlags;  //标记当前节点的更新状态:Update = 0b000000000000000100;Deletion = 0b000000000000001000;
  this.nextEffect = null;  //节点的下个Effect

  this.firstEffect = null;  //节点的第一个Effect
  this.lastEffect = null;  //节点的最后一个Effect

  this.lanes = NoLanes;  //节点的优先级，SyncLane = 0b0000000000000000000000000000001
  this.childLanes = NoLanes; //节点的子节点优先级

  this.alternate = null;  //替身，对应的树 workInProgress <==> current
  //....
}
```

## 3.Flags

flags用于在调和节点后，标记当前节点的状态。比如对比后发现该节点被删除了，则标记Deletion。

```js
// 这两用于react devTools.
export const NoFlags = /*                      */ 0b000000000000000000;
export const PerformedWork = /*                */ 0b000000000000000001;

// 主要的flag.
export const Placement = /*                    */ 0b000000000000000010;  //增
export const Update = /*                       */ 0b000000000000000100;  //改
export const PlacementAndUpdate = /*           */ 0b000000000000000110;  //新增后更改
export const Deletion = /*                     */ 0b000000000000001000;  //删除
export const ContentReset = /*                 */ 0b000000000000010000;
export const Callback = /*                     */ 0b000000000000100000;
export const DidCapture = /*                   */ 0b000000000001000000;
export const Ref = /*                          */ 0b000000000010000000;
export const Snapshot = /*                     */ 0b000000000100000000;  //一般都是rootFiber完成调和后打上这个标签
export const Passive = /*                      */ 0b000000001000000000;
//....
```

## 4.Tags

tags用于表示当前fiber的类型，比如ClassComponent = 1

```js
export const FunctionComponent = 0;  //FunctionComponent
export const ClassComponent = 1;  //ClassComponent
export const IndeterminateComponent = 2; // 未知的组件类型，先设置为这个，判断后会更改
export const HostRoot = 3; // 根节点，rootFiber
export const HostPortal = 4; 
export const HostComponent = 5; //普通的节点，比如span
export const HostText = 6;
export const Fragment = 7;  //Fragment
export const Mode = 8;  //比如StrictMode
export const ContextConsumer = 9;  //Consumer
export const ContextProvider = 10;  //Provider
export const ForwardRef = 11;  //ForwardRef
export const Profiler = 12; //Profiler
export const SuspenseComponent = 13; //Suspense
export const MemoComponent = 14;
export const SimpleMemoComponent = 15;
export const LazyComponent = 16; //Lazy
//...
```

## 5.Lanes

表示优先级，数值越小优先级越高。

```js
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
export const SyncBatchedLane: Lane = /*                 */ 0b0000000000000000000000000000010;

export const InputDiscreteHydrationLane: Lane = /*      */ 0b0000000000000000000000000000100;
const InputDiscreteLanes: Lanes = /*                    */ 0b0000000000000000000000000011000;

const InputContinuousHydrationLane: Lane = /*           */ 0b0000000000000000000000000100000;
const InputContinuousLanes: Lanes = /*                  */ 0b0000000000000000000000011000000;
//...
```

## 6.Update & UpdateQueue

Update: **链表的数据结构**，可以看我这篇博客：[数据结构（三）：链表](https://github.com/lisir-eason/front-end-learn/blob/master/js%E4%B8%AD%E7%9A%84%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%EF%BC%88%E4%B8%89%EF%BC%89%EF%BC%9A%E9%93%BE%E8%A1%A8.md)。

```js
export type Update<State> = {
  eventTime, //事件时间
  lane, //优先级

  // UpdateState = 0; ReplaceState = 1; ForceUpdate = 2; CaptureUpdate = 3;
  tag,
  payload, //更新内容，比如setState接收的第一个参数
  callback, // 对应的回调，setState，render都有

  next, //下一个update
};
```

UpdateQueue:

```js
export type UpdateQueue = {
  baseState,  //每次操作完更新之后的state
  firstBaseUpdate,  //队列中的第一个Update
  lastBaseUpdate,  //队列中的最后一个Update
  shared,  //共享的queue,shared.pending 共享的未处理的update
  effects,  //effects
};
```

## 7.SchedulerMinHeap

Scheduler的task，为**小顶堆数据结构**，可以看我这篇博客：[数据结构（八）：堆](https://github.com/lisir-eason/front-end-learn/blob/master/js%E4%B8%AD%E7%9A%84%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84%EF%BC%88%E5%85%AB%EF%BC%89%EF%BC%9A%E5%A0%86.md)。

时间复杂度为O(1)选取最小的task，也就是即将过期（优先级最高）的任务。

```js
export function push(heap, node){/*..*/}

export function peek(heap) {/*..*/}}

export function pop(heap){/*..*/}

function siftUp(heap, node, i) {/*..*/}

function siftDown(heap, node, i) {/*..*/}

function compare(a, b) {
  // 比较优先级，sortIndex一般为过期时间
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
```

