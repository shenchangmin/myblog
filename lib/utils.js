const path = require('path');
const fs = require('fs');

// markdown解析
const MarkDownIt = require('markdown-it');
const md = MarkDownIt({
  html: true,
  langPrefix: 'code-'
});

// swig(swig模板语法解析)
const swig = require('swig');
swig.setDefaults({ cache: false });

// rd(遍历文件目录)
const rd = require('rd');

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

/**
 * 遍历目录所有文章
 * @param sourceDir {string} 目录路径
 * @param callback {function} 回调函数
 */
function eachSourceFile(sourceDir, callback) {
  rd.eachFileFilterSync(sourceDir, /\.md$/, callback)
}

/**
 * 渲染文章
 * @param dir {string} 博客目录
 * @param file {string} markdown文件路径
 * @return {string} 渲染后的文章html
 */
function renderPost(dir, file) {
  const content = fs.readFileSync(file).toString();
  const post  = parseSourceContent(content.toString());
  post.content = markdownToHtml(post.source);
  post.layout = post.layout || 'post';
  const config = loadConf(dir);
  const html = renderFile(path.resolve(dir, '_layout', `${post.layout}.html`), { config, post });
  return html;
}

/**
 * 渲染文章列表
 * @param dir {string} 博客目录
 * @return {string} 渲染后的文章列表html
 */
function renderIndex(dir) {
  let list = [];
  const sourceDir = path.resolve(dir, '_posts');
  eachSourceFile(sourceDir, (f, s) => {
    const source = fs.readFileSync(f).toString();
    const post = parseSourceContent(source);
    post.timestamp = new Date(post.date);
    post.url = `/posts/${stripExtName(f.slice(sourceDir.length + 1))}.html`;
    list.push(post);
  })

  list.sort(function (a, b) {
    return b.timestamp - a.timestamp;
  });

  const config = loadConf(dir);
  const html = renderFile(path.resolve(dir, '_layout', 'index.html'), {
    config: config,
    posts: list
  });
  return html;
}

/**
 * 读取配置
 * @param dir {dir} 博客目录
 * @return {JSON} 配置JSON内容
 */
function loadConf(dir) {
  const content = fs.readFileSync(path.resolve(dir, 'config.json')).toString();
  const data = JSON.parse(content);
  return data;
}

exports.stripExtName = stripExtName;
exports.eachSourceFile = eachSourceFile;
exports.renderPost = renderPost;
exports.renderIndex = renderIndex;
exports.loadConf = loadConf;

