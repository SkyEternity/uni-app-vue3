module.exports = {
	printWidth: 200, // 换行字符串阈值, 使用默认的折行标准
	tabWidth: 4, // 设置工具每一个水平缩进的空格数
	useTabs: true, //是否使用 tab 进行缩进，默认为false，表示用空格进行缩减
	semi: false, // 句末是否加分号
	vueIndentScriptAndStyle: true,
	singleQuote: true, // 用单引号
	trailingComma: 'none', // 最后一个对象元素符加逗号
	bracketSpacing: true,
	jsxBracketSameLine: true, // jsx > 是否另取一行
	arrowParens: 'always', // 不需要写文件开头的 @prettier
	insertPragma: false, // 不需要自动在文件开头加入 @prettier
	endOfLine: 'auto' // 换行符使用 lf
}
