const path = require('path');
const fse = require('fs-extra');
const moment = require('moment');

const utils = require('./utils');

module.exports = function (dir='.') {
  // 创建基本目录
  fse.mkdirsSync(path.resolve(dir, '_layout'));
  fse.mkdirsSync(path.resolve(dir, '_posts'));
  fse.mkdirsSync(path.resolve(dir, 'assets'));
  fse.mkdirsSync(path.resolve(dir, 'posts'));

  // 复制模板文件
  const tplDir = path.resolve(__dirname, '../tpl');
  fse.copySync(tplDir, dir);

  // 创建初始文章
  newPost(dir, 'hello, world', '这是我的第一篇文章');

  console.log('OK');
}

function newPost(dir, title, content) {
  const data = [
    '---',
    `title: ${title}`,
    `date: ${moment().format('YYYY-MM-DD')}`,
    '---',
    '',
    content
  ].join('\n');

  const name = `${moment().format('YYYY-MM')}/hello-world.md`;
  const file = path.resolve(dir, '_posts', name);
  fse.outputFileSync(file, data);
}
