import { COOKIE_SECRETS_FILE } from "./lib/constants";
import * as cookieParser from "cookie-parser";
import * as serveStatic from "serve-static";
import * as bodyParser from "body-parser";
import { initRoutes } from "./lib/routes";
import * as express from "express";
import * as ws from "express-ws";
import * as morgan from "morgan";
import * as fs from "fs-extra";
import { IO } from "./lib/io";
import * as path from "path";

namespace App {
    async function tryReadSecret() {
        const exists = fs.pathExists(COOKIE_SECRETS_FILE);
        if (!exists) {
            console.log("Missing cookie secrets file");
            process.exit(1);
        }
        return fs.readFile(COOKIE_SECRETS_FILE, {
            encoding: "utf8",
        });
    }

    async function initMiddleware(app: ws.Application) {
        app.use(morgan("dev"));
        app.use(cookieParser(await tryReadSecret()));
        app.use(
            bodyParser.json({
                type: "*/json",
            })
        );
        app.use(
            bodyParser.urlencoded({
                extended: true,
            })
        );
        app.use(bodyParser.text());
        app.use(serveStatic(path.join(__dirname, "../", "client/build")));
    }

    export async function init() {
        const io = IO.get();

        const app = express() as unknown as ws.Application;
        require("express-ws")(app);
        app.use((_req, _res, next) => {
            next();
        });

        await initMiddleware(app);
        initRoutes(app);

        app.listen(io.port, () => {
            console.log(`Listening on port ${io.port}`);
        });
    }
}

(async () => {
    await App.init();
})();
