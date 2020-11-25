#!/usr/bin/env node
const fs = require('fs');
const process = require('process');
const path = require('path');
const babel = require('@babel/core');
const chalk = require('chalk');
const parseExport = require('../parseExport');
let importStatements = [];
let exportStatements = [];

const [
  dirPath = process.cwd(),
  outputName = 'index.js',
  isTS = false,
] = process.argv.slice(2);
if (!dirPath) {
  throw new Error(chalk.red('No directory path specified'));
}

const isJSOrTSRegex = /.(js|ts)x?$/;

function parseFiles(basePath, dirName, outputPath) {
  const paths = fs.readdirSync(dirName);

  paths.forEach((p) => {
    const targetPath = path.resolve(dirName, p);

    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      // parseFiles(basePath, targetPath)
      const targetFile = path.resolve(targetPath, outputName);
      if (fs.existsSync(targetFile)) {
        generateExport(targetFile, basePath);
      }
    } else if (stat.isFile()) {
      if (p === outputPath) {
        return;
      }
      generateExport(targetPath, basePath);
    }
  });

  const imports = importStatements.join('\n');
  const exports = generateExports(exportStatements);
  fs.writeFileSync(
    path.resolve(basePath, outputName),
    imports + '\n\n' + exports
  );
}

parseFiles(dirPath, dirPath, outputName);

function generateExport(targetPath, basePath) {
  if (!targetPath.match(isJSOrTSRegex)) {
    return;
  }
  global.defaultExport = null;
  const file = fs.readFileSync(targetPath, 'utf-8').toString();
  const plugins = [
    parseExport,
    '@babel/plugin-transform-react-jsx',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
  ];
  if (isTS) {
    plugins.push('@babel/plugin-transform-typescript');
  }
  babel.transform(file, {
    plugins: plugins,
  });
  const finalPath = targetPath.replace(basePath, '.').replace(isJSOrTSRegex, '');
  if (finalPath !== '.') {
    generateDefaultExport(
      finalPath,
      importStatements,
      exportStatements,
      basePath,
      targetPath
    );
    generateNamedExport(finalPath, importStatements, exportStatements);
  }
  global.defaultExport = null;
  global.namedExport = [];
}

// 写入文件

function generateDefaultExport(
  finalPath,
  importStatements,
  exportStatements,
  basePath,
  targetPath
) {
  const paths = finalPath.split('/');
  if (global.defaultExport === null) {
    return;
  }
  let exportName = global.defaultExport;
  if (!exportName) {
    const length = paths.length === 2 ? paths.length - 1 : paths.length - 2;
    exportName = paths[length].replace(isJSOrTSRegex, '');
  }
  if (exportName !== '.') {
    importStatements.push(`import ${exportName} from '${finalPath}'`);
    exportStatements.push(exportName);
  }
}

function generateNamedExport(finalPath, importStatements, exportStatements) {
  if (!Array.isArray(global.namedExport) || global.namedExport.length === 0) {
    return;
  }
  // console.log(global.namedExport, '---- named export')
  const names = global.namedExport.join(',\n  ');
  importStatements.push(`import {\n  ${names} \n} from '${finalPath}'`);
  global.namedExport.forEach((name) => {
    if (name !== '.') {
      exportStatements.push(name);
    }
  });
}

function generateExports(exportStatements) {
  if (!Array.isArray(exportStatements) || exportStatements.length === 0) {
    return '';
  }
  const exportNames = exportStatements.join(',\n  ');
  return `export {\n  ${exportNames} \n}`;
}
