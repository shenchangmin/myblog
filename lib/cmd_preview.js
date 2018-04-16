const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const utils = require('./utils');

// 调试辅助插件(open, color)
const open = require('open');
require('colors');

module.exports = (dir = '.') => {
    //初始化express
    const app = express();
    const router = express.Router();
    app.use('/assets', serveStatic(path.resolve(dir, 'assets')));
    app.use(router);

    //渲染文章
    router.get('/posts/*', (req, res, next) => {
        const name = utils.stripExtName(req.params[0]);
        const file = path.resolve(dir, '_posts', `${name}.md`);
        const html = utils.renderPost(dir, file);
        res.send(html);
    });

    //渲染列表
    router.get('/', (req, res, next) => {
        const html = utils.renderIndex(dir);
        res.send(html);
    });

    const config = utils.loadConf(dir);
    const port = config.port || 3000;
    const server = app.listen(port, () => {
        let url = `http://localhost:${port}`;
        console.log('server listening at', url.blue);
        open(url);
    });
};

