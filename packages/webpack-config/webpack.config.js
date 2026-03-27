module.exports = {
	node: {
		__dirname: true,
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: "swc-loader",
					options: {
						sourceMaps: true,
						jsc: {
							target: "es2023",
							parser: {
								syntax: "typescript",
								decorators: true,
								dynamicImport: true,
							},
							transform: {
								legacyDecorator: true,
								decoratorMetadata: true,
							},
							keepClassNames: true,
						},
					},
				},
			},
		],
	},
};
