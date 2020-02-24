import * as cookieParser from 'cookie-parser';
import * as serveStatic from 'serve-static';
import * as bodyParser from 'body-parser';
import { initRoutes } from './lib/routes';
import * as express from 'express';
import * as ws from 'express-ws';
import * as morgan from 'morgan';
import { IO } from './lib/io';
import * as path from 'path';

namespace App {
    function initMiddleware(app: ws.Application) {
        app.use(morgan('dev'));
        app.use(cookieParser());
        app.use(
            bodyParser.json({
                type: '*/json',
            })
        );
        app.use(
            bodyParser.urlencoded({
                extended: true,
            })
        );
        app.use(bodyParser.text());
        app.use(serveStatic(path.join(__dirname, '../', 'client/public')));
        app.use(serveStatic(path.join(__dirname, '../', 'client/static')));
    }

    export function init() {
        const io = IO.get();

        const app = (express() as unknown) as ws.Application;
        require('express-ws')(app);
        app.use((_req, _res, next) => {
            next();
        });

        initMiddleware(app);
        initRoutes(app);

        app.listen(io.port, () => {
            console.log(`Listening on port ${io.port}`);
        });
    }
}

App.init();