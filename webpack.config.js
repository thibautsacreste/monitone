module.exports = {
    entry:  './src',
    output: {
        path:     'builds',
        filename: 'bundle.js',
    },
    devServer: {
      hot: true,
    },
    module: {
        loaders: [
            {
                test:   /\.js/,
                loader: 'babel',
                include: __dirname + '/src',
            },
            {
                test:   /\.scss/,
                loader: 'style!css!sass',
            },
            {
                test:   /\.html/,
                loader: 'html',
            }
        ],
    }
};
