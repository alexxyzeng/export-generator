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
  name = 'index.js',
  isTS = false,
] = process.argv.slice(2);
if (!dirPath) {
  throw new Error(chalk.red('No directory path specified'));
}

const isJSOrTSRegex = /.(js|ts)x?$/;

const configName = 'exportConfig.json';
/**
 * 
 * @param {string} basePath 要生成导出文件的路径
 * @param {string} dirName 要生成导出的文件所在的文件夹路径
 * @param {string} outputName 生成的导出文件名
 */
function parseFiles(basePath, dirName, outputName) {
  const currentPath = path.resolve(basePath)
  const paths = fs.readdirSync(currentPath);
  let exportConfigJSON = null
  const configPath = path.resolve(dirName, configName)
  if (fs.existsSync(configPath)) {
    let configStr = fs.readFileSync(configPath, 'utf-8')
    try {
      exportConfigJSON = JSON.parse(configStr || '{}')
    } catch (err) {
      console.log('====================================');
      console.log(err, '--- parse config err');
      console.log('====================================');
    }
  }
  paths.forEach((p) => {
    const targetPath = path.resolve(dirName, p);

    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      // parseFiles(basePath, targetPath)
      const targetFile = path.resolve(targetPath, outputName);
      if (fs.existsSync(targetFile)) {
        generateExport(targetFile, currentPath, exportConfigJSON);
      }
    } else if (stat.isFile()) {
      if (p === outputName || p === configName) {
        return;
      }
      generateExport(targetPath, currentPath, exportConfigJSON);
    }
  });

  const imports = importStatements.join('\n');
  const exports = generateStatements(exportStatements);
  fs.writeFileSync(
    path.resolve(basePath, name),
    imports + '\n\n' + exports
  );
}

parseFiles(dirPath, dirPath, name);

function generateExport(targetPath, basePath, config) {
  // console.log('====================================')
  // console.log(targetPath, '---- target path')
  // console.log(basePath, '---- base path')
  // console.log('====================================')
  if (!targetPath.match(isJSOrTSRegex)) {
    return;
  }
  if (config) {
    const { include, exclude } = config
    const isExcluded = Array.isArray(exclude) && exclude.length > 0 && exclude.some(excludeItem => excludeItem !== '' && targetPath.includes(excludeItem))
    if (isExcluded) {
      return
    }
    const isIncluded = !Array.isArray(include) || include.length === 0 || include.some(includeItem => includeItem !== '' && targetPath.includes(includeItem))
    if (!isIncluded) {

      return
    }
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

function generateStatements(exportStatements) {
  if (!Array.isArray(exportStatements) || exportStatements.length === 0) {
    return '';
  }
  const exportNames = exportStatements.join(',\n  ');
  return `export {\n  ${exportNames} \n}`;
}
