# 将文件目录作为文件服务器

>本文使用nodejs讲解将自己电脑文件夹作为服务器，使用浏览器来访问文件目录和查看文件内容。

# 预览

![如果是文件，则显示文件内容，如果是文件夹，则列出文件夹内文件](https://upload-images.jianshu.io/upload_images/1787273-8c75e333ae7740ad.gif?imageMogr2/auto-orient/strip)


-  代码量不超过50行。
-  不需要 `npm` 来安装任何第三方库。
-  只需要有`node`环境即可。
-  兼容 `mac os`，`windows` 和 `linux`。

# 实现步骤 

> 如果嫌我啰嗦的话，可直接查看源代码 [CurrentDirAsServer.js](./CurrentDirAsServer.js) 或 [AnyDirAsServer.js](./AnyDirAsServer.js) 代码量也不过50行

1. 从最简单的一个nodejs服务开始
`server.js`
```
var http = require('http');

var server = http.createServer(function(req, res) {});

server.listen(3000);
```
> nodejs中3行代码即可实现一个 web server 服务。

2. 首先实现列出当前文件夹内列表

```
// 导入nodejs内置的 http 模块和文件处理模块 fs
var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
	// 在此打印出来我们访问的地址
	console.log('visited : ', req.url);
    // 如果访问的是首页，则列出当前目录
	if ('/' === req.url) {
        // 设置响应头信息
		res.writeHead(200, { 'Content-Type': 'text/html' });
        // 调用 fileList 函数来显示，不传参数则默认当前文件目录
		return res.end(fileList());
	}

	/**
	 * 列出指定文件目录，默认当前目录
	 */
	function fileList(path = __dirname) {
		var html = '';
        // 遍历读取文件夹内每项
		fs.readdirSync(path).forEach(function(item) {
            // 拼接文件的链接地址
			var href = (req.url + '/' + item).replace('//', '/');
			html += '<a href="' + href + '">' + item + '</a><br/>';
		});
		return html;
	}
});
```
 此时我们在来启动项目，并访问试试。如下是我的目录情况

![我们查看元素的链接地址](https://upload-images.jianshu.io/upload_images/1787273-8fa95773e138776d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/640)

目前点击链接暂时是无法跳转的，接下来实现点击跳转显示。

3. 处理其他链接地址

```
var server = http.createServer(function(req, res) {
	if ('/' === req.url) {
        // ...
	}
        // 文件路径为当前路径+请求的路径，考虑到中文目录或带有空格的目录作为url时会被转义，所以使用decodeURI进行处理
	var filepath = decodeURI(__dirname + req.url);
    // 检查下文件是否存在，不存在则返回提示信息
	var exists = fs.existsSync(filepath);

	if (exists) {
		var stat = fs.lstatSync(filepath);
		if (stat.isFile()) {
            // 如果是文件，则创建文件读取流管道返回给 res，这里的return和其他地方的return只是表示程序执行到此就不继续往下执行了，当然你也可以在此行之后直接  return; 结束
			res.writeHead(200, { 'Content-Type': 'text' });
			return fs.createReadStream(filepath).pipe(res);
		} else if (stat.isDirectory()) {
            // 如果是文件夹，则继续调用 fileList 函数，将当前请求的URL传入
			res.writeHead(200, { 'Content-Type': 'text/html' });
			return res.end(fileList(filepath));
		}
	} else {
        // 当文件未找到时，返回客户端404状态码并给出提示
		res.writeHead(404, { 'Content-Type': 'text/html' });
		return res.end('<h2>没有找到文件</h2');
	}

	/**
	 * 列出指定文件目录，默认当前目录
	 */
	function fileList(path = __dirname) {
		var html = '';
		fs.readdirSync(path).forEach(function(item) {
			var href = (req.url + '/' + item).replace('//', '/');
			html += '<a href="' + href + '">' + item + '</a><br/>';
		});
		return html;
	}
});
```
到此我们已经完成了全部代码工作，可以重新运行测试。
> 此代码可以在 window，linux，Mac os 系统上运行，当你想把某个目录作为浏览器来访问查看文件内容的时候，只需把此 js 文件放到指定目录，然后执行 `node server.js` 即可

# 补充
   例如当我想把 `/Users/andy` 作为浏览器文件服务器的时候，我必须得把此 js 文件放到这个目录，我们能不能实现把`当前目录`实现成`可指定的目录`呢？

答案是当然可以。

我们在上面的代码稍加改造即可实现。
```
// 为了兼容多系统，我们需要导入另一个nodejs内置的 os 模块
var os = require('os');
// 我把默认路径定义成变量
var defaultPath = '/Users/andy';

var server = http.createServer(function(req, res) {
	if ('/' === req.url) {
	}
    // 此次直接使用请求的路径来读取文件，意味着请求的路径将是文件的完整路径
	var filepath = decodeURI(req.url);
    // var filepath = decodeURI(__dirname + req.url);

    function fileList(path = defaultPath) {
    	var html = '';
        // 由于windows目录是如 C://Windows D://Program files 等类型的路径，需要进行截取
        // 如果路径是 F://Nodejs/Learn 则截取后的路径为 /Nodejs/Learn
    	// 如果是windows系统
    	if ('Windows_NT' == os.type()) {
    		var index = path.indexOf(':');
    		path = path.slice(index + 1);
    	}
    	fs.readdirSync(path).forEach(function(item) {
    		var href = (path + '/' + item).replace('//', '/');
    		html += '<a href="' + href + '">' + item + '</a><br/>';
    	});
    	return html;
    }
}
```
此时我们再运行查看链接路径

![链接的路径为文件所在的全路径](https://upload-images.jianshu.io/upload_images/1787273-3915a90ec6f487d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/640)

至此我们已经改造完毕。

分了两个版本

[任意目录作为文件服务器 AnyDirAsServer.js](./AnyDirAsServer.js)

[当前目录作为文件服务器 CurrentDirAsServer.js](CurrentDirAsServer.js)
