import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import rollupTypescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';
import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import nodeGlobals from 'rollup-plugin-node-globals';
import scss from 'rollup-plugin-scss';

const plugins = [
  commonjs({
    include: [
      '../../node_modules/**',
      './node_modules/**',
    ],
    exclude: [
      'src',
    ],
  }),
  url(),
  image(),
  scss(),
  nodeResolve({
    browser: true,
    preferBuiltins: false,
  }),
  builtins(),
  nodeGlobals({
    exclude: [
      'src/**/*.ts',
      'src/**/*.tsx',
    ],
    process: true,
    global: true,
    buffer: true,
    dirname: true,
    filename: true,
    baseDir: true,
  }),
  resolve({
    exportConditions: [
      'node',
    ],
    browser: true,
    preferBuiltins: false,
  }),
  babel({
    exclude: [
      '../../node_modules/**',
      './node_modules/**',
    ],
  }),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  }),
  json(),
  rollupTypescript(),
];

const onwarn = (warning, warn) => {
  const ignoredCircular = [
    'react-virtualized',
  ];
  const noExport = [
    'react-virtualized',
  ];

  if (
    warning.code === 'CIRCULAR_DEPENDENCY' &&
    ignoredCircular.some(d => warning.importer.includes(d))
  ) {
    return;
  }

  if (
    warning.code === 'NON_EXISTENT_EXPORT' &&
    noExport.some(d => warning.source.includes(d))
  ) {
    return;
  }

  warn(warning);
};

const background = {
  input: 'src/bg/index.ts',
  output: {
    file: 'app/bundle-bg.js',
    format: 'iife',
  },
  onwarn,
  plugins,
};

const frontend = {
  input: 'src/fe/index.tsx',
  output: {
    file: 'app/bundle-fe.js',
    format: 'iife',
  },
  plugins,
  onwarn,
  context: 'null',
  moduleContext: 'null',
};

const frontendFirst = true;
const config = frontendFirst ? [frontend, background] : [background, frontend];

export default config;
