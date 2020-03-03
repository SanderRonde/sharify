const { override, fixBabelImports, addLessLoader  } = require('customize-cra');
const darkTheme = require('@ant-design/dark-theme');
const theme = require('./src/theme-override.json');

module.exports = override(
	fixBabelImports('import', {
		libraryName: 'antd',
		libraryDirectory: 'es',
		style: true
	}),
	addLessLoader({
		javascriptEnabled: true,
		modifyVars: {... darkTheme.default, '@primary-color': theme["primary-color"] }
	})
);