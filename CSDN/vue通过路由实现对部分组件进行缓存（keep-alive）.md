首先在router中，设置meta属性keepAlive

```javascript
{
	path:'/svglink',
	name: 'svglink',
	component: () => import('@/components/SvgMain/SvgLink.vue'),
	meta: {
	     keepAlive: true
	 }
 },
```
然后在组件中，通过v-if将需要缓存的组件放到keep-alive中去

```html
<div class="app-container">
	<keep-alive>
     	<router-view v-if="$route.meta.keepAlive"/>
	</keep-alive>
    	<router-view v-if="!$route.meta.keepAlive"/>
 </div>
```

