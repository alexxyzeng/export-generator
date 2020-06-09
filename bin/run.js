#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const parseExport = require('../parseExport');

let importStatements = [];
let exportStatements = [];
function readFiles(dirName) {
  const paths = fs.readdirSync(dirName);
  paths.forEach((p) => {
    const targetPath = dirName + `/${p}`;
    const stat = fs.statSync(path.resolve(targetPath));
    if (stat.isDirectory()) {
      readFiles(targetPath);
    } else if (stat.isFile()) {
      result.push(targetPath);
      if (targetPath.endsWith('.js')) {
        global.defaultExport = null;
        const file = fs.readFileSync(targetPath).toString();
        babel.transform(file, {
          plugins: [
            parseExport,
            '@babel/plugin-transform-react-jsx',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-optional-chaining',
          ],
        });
        const finalPath = targetPath.replace(__dirname, '.');
        // 写入文件

        generateDefaultExport(finalPath, importStatements, exportStatements);
        generateNamedExport(finalPath, importStatements, exportStatements);
        const imports = importStatements.join('\n');
        const exports = generateExports(exportStatements);
        fs.writeFileSync('./index.js', imports + '\n' + exports);
        global.defaultExport = null;
        global.namedExport = [];
      }
    }
  });
}

readFiles(__dirname);

function generateDefaultExport(finalPath, importStatements, exportStatements) {
  const paths = finalPath.split('/');
  const exportName = global.defaultExport || paths[paths.length - 2];
  importStatements.push(`import { ${exportName} } from ${finalPath}`);
  exportStatements.push(exportName);
}

function generateNamedExport(finalPath, importStatements, exportStatements) {
  if (!Array.isArray(global.namedExport) || global.namedExport.length === 0) {
    return;
  }
  const names = global.namedExport.join(',\n');
  importStatements.push(`import { ${names} } from ${finalPath}`);
  global.namedExport.forEach((name) => {
    exportStatements.push(name);
  });
}

function generateExports(exportStatements) {
  if (!Array.isArray(exportStatements) || exportStatements.length === 0) {
    return '';
  }
  const exportNames = exportStatements.join(',\n');
  return `export { ${exportNames} }`;
}
