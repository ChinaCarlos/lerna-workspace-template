import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import clear from 'rollup-plugin-clear';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

// 本地测试打包之后产物，在index.html 中引入打包之后的产物
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
export default [
    {
        input: 'src/index.ts',
        plugins: [
            clear({
                targets: ['dist', 'esm', 'iife', 'cjs'],
            }),
            scss({
                processor: () => postcss([autoprefixer()]),
                // 配置选项，例如输出文件的路径和名称
                output: false,
                insert: true,
                // 其他配置选项，如是否压缩等
                outputStyle: 'compressed',
            }),
            resolve(),
            commonjs(),
            typescript({
                outDir: 'dist',
            }),
            json(),
            babel({
                babelHelpers: 'runtime',
                extensions: ['.ts', '.js'],
                exclude: ['node_modules/**'],
                presets: [['@babel/preset-env', { modules: false }]],
                plugins: ['@babel/plugin-transform-runtime'],
            }),
        ],
        output: [
            {
                dir: 'dist',
                format: 'esm',
                sourcemap: true,
                preserveModules: false,
                exports: 'auto',
            },
        ],
    },
    {
        input: 'src/index.ts',
        plugins: [
            clear({
                targets: ['dist', 'esm', 'iife', 'cjs'],
            }),
            scss({
                processor: () => postcss([autoprefixer()]),
                // 配置选项，例如输出文件的路径和名称
                output: false,
                insert: true,
                // 其他配置选项，如是否压缩等
                outputStyle: 'compressed',
            }),
            resolve(),
            commonjs(),
            typescript({
                outDir: 'iife',
            }),
            json(),
            babel({
                babelHelpers: 'runtime',
                extensions: ['.ts', '.js'],
                exclude: 'node_modules/**',
                presets: [['@babel/preset-env', { modules: false }]],
                plugins: ['@babel/plugin-transform-runtime'],
            }),
            serve({
                contentBase: '', //服务器启动的文件夹，默认是项目根目录，需要在该文件下创建index.html
                port: 8020, //端口号，默认10001
            }),
            livereload('iife'), //watch dist目录，当目录中的文件发生变化时，刷新页面
        ],
        output: [
            {
                dir: 'iife',
                format: 'iife',
                sourcemap: true,
                exports: 'auto',
                name: 'FAST_PWA_SDK',
            },
        ],
    },
];
