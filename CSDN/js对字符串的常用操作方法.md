#### replace() 方法
replace() 方法用于在字符串中用一些字符替换另一些字符，或替换一个与正则表达式匹配的子串。
```javascript
stringObject.replace(regexp/substr,replacement)
// regexp/substr 必需。规定子字符串或要替换的模式的 RegExp 对象。
//replacement 必需。一个字符串值。规定了替换文本或生成替换文本的函数。

var str="Visit Microsoft!"
str.replace(/Microsoft/, "W3School")
// 输出： Visit W3School!
```
#### concat() 方法
concat() 方法用于连接两个或多个字符串。
```javascript
stringObject.concat(stringX,stringX,...,stringX)
// stringX必需。将被连接为一个字符串的一个或多个字符串对象。

var str1="Hello "
var str2="world!"
document.write(str1.concat(str2))
// 输出： Hello world!
```
#### slice() 方法
slice() 方法可提取字符串的某个部分，并以新的字符串返回被提取的部分。
```javascript
stringObject.slice(start,end)
// start  要抽取的片断的起始下标。
// end  紧接着要抽取的片段的结尾的下标。若未指定此参数，则要提取的子串包括 start 到原字符串结尾的字符串。

var str="Hello happy world!"
document.write(str.slice(6))
// 输出： happy world!
```
#### split() 方法
split() 方法用于把一个字符串分割成字符串数组。
```javascript
stringObject.split(separator,howmany)
// separator  必需。字符串或正则表达式，从该参数指定的地方分割 stringObject
// howmany  可选。该参数可指定返回的数组的最大长度。

var str="How are you doing today?"
document.write(str.split(" ") + "<br />")
// 输出：How,are,you,doing,today?
```
#### substring() 方法
substring() 方法用于提取字符串中介于两个指定下标之间的字符
```javascript
stringObject.substring(start,stop)
// start  必需。一个非负的整数，规定要提取的子串的第一个字符在 stringObject 中的位置。
// stop  可选。一个非负的整数，比要提取的子串的最后一个字符在 stringObject 中的位置多 1。如果省略该参数，那么返回的子串会一直到字符串的结尾。

var str="Hello world!"
document.write(str.substring(3))
// 输出：lo world!
```
