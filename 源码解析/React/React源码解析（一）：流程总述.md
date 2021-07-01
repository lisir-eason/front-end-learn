# React源码解析（一）：流程总述

在阅读react源码之前，可能听过最多的词语是JSX、虚拟dom、diff算法等等。react的render或者update流程究竟是什么样的呢？首先先看下我边看源码边绘制的流程图：原图可以点[这里](https://github.com/lisir-eason/front-end-learn/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90/React/react-render.jpg)。

![react-render](https://i.loli.net/2021/06/30/GFcNvBbugiM3Sok.jpg)

看起来是有些复杂，但总的来说可以分成以下阶段：

scheduler阶段 -->  reconciler阶段 --> commit阶段

## 1.准备工作

首先，我们要搭建本地的调试环境。我使用create-react-app构建项目，然后把react的源码拉倒本地copy到项目中，我选择的是17.0.2版本。配置webpack，让项目中的react使用我们刚才clone的源码：

```js
alias: {
    'react-native': 'react-native-web',
    'react': path.resolve(__dirname, '../src/react/packages/react'),
    'react-dom': path.resolve(__dirname, '../src/react/packages/react-dom'),
    'shared': path.resolve(__dirname, '../src/react/packages/shared'),
    'react-reconciler': path.resolve(__dirname, '../src/react/packages/react-reconciler'),
    //'react-events': path.resolve(__dirname, '../src/react/packages/events')
},
```

可以直接clone我创建的代码库：[react-debug](https://github.com/lisir-eason/react-debug)

## 2.JSX

接下来，需要一些JSX的预备知识，可以看我另一篇博客[babel学习笔记](https://github.com/lisir-eason/front-end-learn/blob/master/babel/babel%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0.md)。JSX是什么，babel是如何工作的？简单来说就是JSX是React.createElement的语法糖，就是为了我们方便开发和理解，最终都会转换成React.createElement进而生成虚拟dom树。有了这些准备，我们可以继续前进了。

## 3.Fiber

fiber是react的一种数据结构，用于报错节点的信息。无论是class component还是function component，或者是Fragment还是普通的div等等，都会创建一个节点（fiberNode）来记录该节点的信息。一个应用最终生成的节点如下图所示，其中fiberRoot是应用的根，来记录应用的更新状态等一些信息，一个应用一般只会有一个fiberRoot。而rootFiber则是有ReactDOM.render生成的根fiber，是整个fiber的根。fiber的父子节点通过child和return属性互相指定，而兄弟节点由subling指定，是个单向的链状数据结构（也没有必要双向）。为什么这么设计呢？我猜测是不想让一个节点有非常多的children节点，其次也比较好遍历或者中断遍历吧。

另外在一个应用中，会有一个current的树代表当前的树的状况，还有一个workInProgress树是代表正在构建的树，也就是将来会更新的树。这种双Fiber缓存，一方面可以提升性能，不需要多次定义树状对象浪费时间，另一方面也可以保证状态不耦合，更新万一出错不会影响当前的current树。

![fiber](https://i.loli.net/2021/06/30/FjPC7cBvpKDmrki.jpg)

## 4.Lane

Lane是新的用于计算节点更新优先级的数据模型，使用31位二进制数表示。**React源码中有大量二进制表示的数据，二进制一方面运算非常快（计算机底层就是二进制实现的），另一方面使用‘|’和‘&’运算可以很方便的计算两个数据的关系。**比如加上某种属性就可以用**'|'**运算符这个优先级，判断有没有某种优先级就可以**'&'**这个优先看是不是为0，不为0则代表有这个属性。

如下，1的位数越高所表示的优先级越低。

```js
//ReactFiberLane.js
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
export const SyncBatchedLane: Lane = /*                 */ 0b0000000000000000000000000000010;

export const InputDiscreteHydrationLane: Lane = /*      */ 0b0000000000000000000000000000100;
const InputDiscreteLanes: Lanes = /*                    */ 0b0000000000000000000000000011000;

const InputContinuousHydrationLane: Lane = /*           */ 0b0000000000000000000000000100000;
const InputContinuousLanes: Lanes = /*                  */ 0b0000000000000000000000011000000;
...
```

## 5.Scheduler

Scheduler是独立于react的一个包工具，react也在未来计划将其单独作为一个包发布。**它主要是作为“指挥员”，告诉react应该什么时候开始工作，什么时候暂停工作，以及将任务优先级排序，先调度优先级高的任务。**为什么需要Scheduler呢？我觉得主要的目的还是为了性能优化。举个例子，比如当我们的fiber树更新比较庞大，这样就会消耗巨大的时间在js上，而我们的js是单线程，也就是说这段时间页面的渲染和用户的交互可能会因为js的执行而被限制，进而造成页面卡顿的情况。因此React为了优化性能，所以加入了Scheduler。假设我们的设备刷新率是60hz，那么每一帧动画执行的时间就是16.6ms，Schedule就在react计算的过程中给react每帧5ms（默认就是5ms）的时间去执行，超过这个时间就暂停js执行，把控制权交给浏览器去渲染，这样页面就不会应为过久地执行js而造成卡顿。

## 6.Reconciler

调和阶段，该阶段可以被Scheduler打断。这里主要分为beginWork和completeWork两个阶段。首先从rootFiber开始，向下（也就是child）深度遍历（这个过程先不考虑sibling节点），构建(首次渲染)或者对比(更新时)Fiber，也就是我们所说的diff算法。将节点的更新都挂载到updateQueue上，updateQueue也是一个单项环装链表。当child为null，也就是到达左侧最下面的子节点时，就会向上completeWork。如果这时节点有subling，就会对subling执行beginWork，直到遍历完所有sibling时，把所有的effects向上整合到父节点上。然后开始对父节点（returnFiber）执行上述同样的操作直到rootFiber。

![reconciler](https://i.loli.net/2021/06/30/xvih8Gm4MwVfjJu.jpg)

## 7.Commit

提交阶段，这里就不能被Scheduler打断了。这个阶段已经准备好了所有的effects(更新)。主要就是将更新或者创建新节点应用到dom上。主要执行了commitBeforeMutationEffects，commitMutationEffects，commitLayoutEffects这三个阶段。其中真正的dom更新发生在commitMutationEffects，而componentDidMount等生命周期函数发生在commitLayoutEffects阶段。

到这里，我们对所有的流程有个大致的了解，接下来我会分别详细介绍这些阶段。

撒花！