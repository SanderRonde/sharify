const { override, fixBabelImports, addLessLoader } = require("customize-cra");
const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");
const darkTheme = require("@ant-design/dark-theme");
const { GenerateSW } = require("workbox-webpack-plugin");
const theme = require("./src/theme-override.json");

module.exports = override(
    fixBabelImports("import", {
        libraryName: "antd",
        libraryDirectory: "es",
        style: true,
    }),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: {
            ...darkTheme.default,
            "@primary-color": theme["primary-color"],
        },
    }),
    (config, env) => {
        return {
            ...config,
            plugins: [
                ...config.plugins.filter(
                    (p) => p.constructor.name !== "GenerateSW"
                ),
                new GenerateSW({
                    clientsClaim: true,
                    exclude: [/\.map$/, /asset-manifest\.json$/],
					importWorkboxFrom: "cdn",
					navigateFallback: "/index.html",
                    navigateFallbackBlacklist: [
                        // Exclude URLs starting with /_, as they're likely an API call
						new RegExp("^/_"),
						new RegExp("^/api"),
                        new RegExp("/[^/?]+\\.[^/]+$"),
                    ],
                }),
            ],
        };
    }
);
