const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const fs = require('fs');
const MarkDownIt = require('markdown-it');
const md = MarkDownIt({
    html: true,
    langPrefix: 'code-'
});

module.exports = (dir = '.') => {
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
            const html = markdownToHtml(content.toString());
            res.send(html);
        });
    });

    //渲染列表
    router.get('/', (req, res, next) => {
        res.send('文章列表');
    });

    app.listen(3000);
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
function markdownToHtml(content = '') {
    return md.render(content);
}
