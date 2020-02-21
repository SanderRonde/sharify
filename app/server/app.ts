import * as cookieParser from 'cookie-parser';
import * as serveStatic from 'serve-static';
import * as bodyParser from 'body-parser';
import { initRoutes } from './lib/routes';
import * as express from 'express';
import * as morgan from 'morgan';
import * as path from 'path';
import * as http from 'http';

namespace App {
	namespace IO {
		export interface IO {
			port: number;
		}

		function assertArgLength(minLength: number) {
			if (process.argv.length < minLength) {
				console.log('Not enough arguments');
				process.exit(1);
			}
		}

		export function get(): IO {
			const io: IO = {
				port: 1234
			};

			for (let i = 0; i < process.argv.length; i++) {
				if (process.argv[i] === '-p' || process.argv[i] === '--port') {
					assertArgLength(i + 1);
					io.port = parseInt(process.argv[i + 1]);
					i++;
				} else if (process.argv[i] === '-h' || process.argv[i] === '--help') {
					console.log('Usage:');
					console.log('');
					console.log('\t-p | --port	[port] 		The port to use');
					process.exit(0);
				}
			}

			return io;
		}
	}

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