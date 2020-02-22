import * as cookieParser from 'cookie-parser';
import * as serveStatic from 'serve-static';
import * as bodyParser from 'body-parser';
import { initRoutes } from './lib/routes';
import * as express from 'express';
import * as morgan from 'morgan';
import { IO } from './lib/io';
import * as path from 'path';
import * as http from 'http';

namespace App {
	function initMiddleware(app: express.Express) {
		app.use(morgan('dev'));
		app.use(cookieParser());
		app.use(
			bodyParser.json({
				type: '*/json'
			})
		);
		app.use(
			bodyParser.urlencoded({
				extended: true
			})
		);
		app.use(bodyParser.text());
		app.use(serveStatic(path.join(__dirname, '../', 'client/public')));
		app.use(serveStatic(path.join(__dirname, '../', 'client/static')));
	}

	export function init() {
		const io = IO.get();

		const app = express();
		initMiddleware(app);
		initRoutes(app);

		http.createServer(app).listen(io.port, () => {
			console.log(`Listening on port ${io.port}`);
		});
	}
}

App.init();