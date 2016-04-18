var production = process.env.NODE_ENV === 'production';

module.exports = {
    debug:   !production,
    devtool: production ? false : 'eval',
    entry:  './src',
    output: {
        path:     'builds',
        filename: 'bundle.js',
        publicPath:    'builds/',
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
