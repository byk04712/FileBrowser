/**
 * 使用nodejs把当前电脑文件夹目录当作web服务器来访问
 * - 如果是文件，则显示文件内容
 * - 如果是文件夹，则列出当前文件夹目录列表
 */
var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res) {
	// 访问 http://localhost:3000 时列出当前目录列表
	console.log('visited : ', req.url);
	if ('/' === req.url) {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		return res.end(fileList());
	}
	var filepath = decodeURI(__dirname + req.url);
	var exists = fs.existsSync(filepath);

	if (exists) {
		var stat = fs.lstatSync(filepath);
		if (stat.isFile()) {
			res.writeHead(200, { 'Content-Type': 'text' });
			return fs.createReadStream(filepath).pipe(res);
		} else if (stat.isDirectory()) {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			return res.end(fileList(filepath));
		}
	} else {
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

server.listen(3000, function() {
	console.log('Server started at http://localhost:3000');
});
