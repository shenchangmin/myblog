const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const open = require('open');
const fs = require('fs');

// 控制台颜色小插件
const colors = require('colors');
colors.setTheme({  
  silly: 'rainbow',  
  input: 'grey',  
  verbose: 'cyan',  
  prompt: 'red',  
  info: 'green',  
  data: 'blue',  
  help: 'cyan',  
  warn: 'yellow',  
  debug: 'magenta',  
  error: 'red'  
});

// markdown解析
const MarkDownIt = require('markdown-it');
const md = MarkDownIt({
  html: true,
  langPrefix: 'code-'
});

// swig
const swig = require('swig');
swig.setDefaults({ cache: false });

// rd
const rd = require('rd');

module.exports = (dir='.') => {
  //初始化express
  const app = express();
  const router = express.Router();
  app.use('/assets', serveStatic(path.resolve(dir, 'assets')));
  app.use(router);

  //渲染文章
  router.get('/posts/*', (req, res, next) => {
    const name = stripExtName(req.params[0]);
    const file = path.resolve(dir, '_posts', `${name}.md`);
    fs.readFile(file, (err, content) => {
      if (err) {
        return next(err);
      }
      const post  = parseSourceContent(content.toString());
      post.content = markdownToHtml(post.source);
      post.layout = post.layout || 'post';
      const html = renderFile(path.resolve(dir, '_layout', `${post.layout}.html`), { post });
      res.send(html);
    });
  });

  //渲染列表
  router.get('/', (req, res, next) => {
    let list = [];
    const sourceDir = path.resolve(dir, '_posts');
    rd.eachFileFilterSync(sourceDir, /\.md$/, (f, s) => {
      const source = fs.readFileSync(f).toString();
      const post = parseSourceContent(source);
      post.timestamp = new Date(post.date);
      post.url = `/posts/${stripExtName(f.slice(sourceDir.length + 1))}.html`;
      list.push(post);
    });

    list.sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });

    const html = renderFile(path.resolve(dir, '_layout', 'index.html'), {
      posts: list
    });
    
    res.send(html);
  });

  const server = app.listen(3000, () => {
    let url = `http://localhost:${server.address().port}`;
    console.log('server listening at', url.blue);
    open(url);
  });
};

/**
 * 去掉文件名中的扩展
 * @param name
 * @returns {Buffer|T[]|SharedArrayBuffer|Uint8ClampedArray|Uint32Array|Blob|any}
 */
 function stripExtName(name) {
  let i = 0 - path.extname(name).length;
  if (i === 0) {
    i = name.length;
  }
  return name.slice(0, i);
}

/**
 * 将markdown转换成HTML
 * @param content
 * @returns {*}
 */
 function markdownToHtml(content='') {
  return md.render(content);
}

/**
 * 解析文章内容
 * @param data {string} 原始数据
 * @return info {object} 文章元数据
 */
function parseSourceContent(data) {
  let split = '---\n';
  let i = data.indexOf(split);
  let info = {};
  if(i !== -1){
    let j = data.indexOf(split, i + split.length);
    if(j !== -1){
      let str = data.slice(i + split.length, j).trim();
      data = data.slice(j + split.length);
      str.split('\n').forEach(line => {
        let i = line.indexOf(':');
        if(i !== -1){
          let name = line.slice(0, i).trim();
          let value = line.slice(i + 1).trim();
          info[name] = value;
        }
      });
    }
  }
  info.source = data;
  return info;
}

/**
 * 渲染模板
 * @param file {string} 模板路径
 * @param data {object} 文章元数据
 * @return
 */
function renderFile(file, data) {
  return swig.render(fs.readFileSync(file).toString(), {
    filename: file,
    autoescape: false,
    locals: data
  })
}


