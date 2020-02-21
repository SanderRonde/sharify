import * as express from 'express';

export function initRoutes(app: express.Express) {
	app.get('/', (_req, res) => {
		res.write('test');
		res.end();
	});
}