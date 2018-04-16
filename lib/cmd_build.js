const path = require('path');
const utils = require('./utils');
const fse = require('fs-extra');

module.exports = function (dir='.', options) {
  const outputDir = path.resolve(options.output || dir);

  // 写入文件
  function outputFile(file, content) {
    console.log('生成页面: %s', file.slice(outputDir.length + 1));
    fse.outputFileSync(file, content);
  }

  // 生成文章内容页面
  const sourceDir = path.resolve(dir, '_posts');
  utils.eachSourceFile(sourceDir, (f, s) => {
    const html = utils.renderPost(dir, f);
    const relativeFile = `${utils.stripExtName(f.slice(sourceDir.length + 1))}.html`;
    const file = path.resolve(outputDir, 'posts', relativeFile);
    outputFile(file, html);
  })

  // 生成首页
  const htmlIndex = utils.renderIndex(dir);
  const fileIndex = path.resolve(outputDir, 'index.html');
  outputFile(fileIndex, htmlIndex);
}
