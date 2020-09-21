import { Configuration } from 'webpack'
import HTMLWebPackPlugin from 'html-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import * as path from 'path'

// interface VariableConfiguratio extends Configuration {
//     devServer: any
// }

const babelOptions = (preset?: any) => {
    const options = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if (preset) {
        options.presets.push(preset)
    }

    return options
}

const jsLoaders = () => {
    const loaders = [
        { // подключение babel также в packege.json строчка browserlist
            loader: "babel-loader",
            options: babelOptions()
        }
    ]

    return loaders
}

const config: Configuration & { devServer: any } = {
    context: path.resolve(__dirname, 'src'),
    entry: {
        main: ['@babel/polyfill', './app.ts']
    },
    output: {
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, 'public')
    },
    devServer: {
        port: 4200
    },
    mode: 'development',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HTMLWebPackPlugin({
            template: './index.html'
        }),
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: {
                    loader: "babel-loader",
                    options: babelOptions('@babel/preset-typescript')
                }
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader', 'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|jpeg|svg|gif|ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader', 'css-loader', 'sass-loader'
                ]
            }
        ]
    }
};

module.exports = config
