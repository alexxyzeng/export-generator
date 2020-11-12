#!/usr/bin/env node
const fs = require('fs')
const process = require('process')
const path = require('path')
const babel = require('@babel/core')
const chalk = require('chalk')
const parseExport = require('../parseExport')
let importStatements = []
let exportStatements = []

const [dirPath = process.cwd(), outputName = 'index.js'] = process.argv.slice(2)
if (!dirPath) {
  throw new Error(chalk.red('No directory path specified'))
}

function parseFiles(basePath, dirName, outputPath) {
  const paths = fs.readdirSync(dirName)

  paths.forEach(p => {
    const targetPath = path.resolve(dirName, p)
    
    const stat = fs.statSync(targetPath)
    if (stat.isDirectory()) {
      // parseFiles(basePath, targetPath)
      const targetFile = path.resolve(targetPath, outputName)
      if (fs.existsSync(targetFile)) {
        generateExport(targetFile, basePath)
      }
    } else if (stat.isFile()) {
      if (p === outputPath) {
        return
      }
      generateExport(targetPath, basePath)
    }
  })

  const imports = importStatements.join('\n')
  const exports = generateExports(exportStatements)
  fs.writeFileSync(path.resolve(basePath, outputName), imports + '\n\n' + exports)
  const importList = Object.values(global.imports || {})
  fs.writeFileSync('./exports.json', JSON.stringify(importList, null, 2))
}

parseFiles(dirPath, dirPath, outputName)

function generateExport(targetPath, basePath) {
  if (!targetPath.endsWith('.js')) {
    return
  }
  global.defaultExport = null
  const file = fs.readFileSync(targetPath, 'utf-8').toString()
  babel.transform(file, {
    plugins: [
      parseExport,
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-optional-chaining'
    ]
  })
  const finalPath = targetPath.replace(basePath, '.')
  if (finalPath !== '.') {
    generateDefaultExport(finalPath, importStatements, exportStatements, basePath, targetPath)
    generateNamedExport(finalPath, importStatements, exportStatements)
  }
  global.defaultExport = null
  global.namedExport = []
}

// 写入文件

function generateDefaultExport(finalPath, importStatements, exportStatements, basePath, targetPath) {
  const paths = finalPath.split('/')
  if (global.defaultExport === null) {
    return
  }
  let exportName = global.defaultExport
  if (!exportName) {
    const length = paths.length === 2 ? paths.length - 1 : paths.length - 2
    exportName = paths[length].replace('.js', '')
  }
  if (exportName !== '.') {
    importStatements.push(`import ${exportName} from '${finalPath}'`)
    exportStatements.push(exportName)
  }
}

function generateNamedExport(finalPath, importStatements, exportStatements) {
  if (!Array.isArray(global.namedExport) || global.namedExport.length === 0) {
    return
  }
  // console.log(global.namedExport, '---- named export')
  const names = global.namedExport.join(',\n  ')
  importStatements.push(`import {\n  ${names} \n} from '${finalPath}'`)
  global.namedExport.forEach(name => {
    if (name !== '.') {
      exportStatements.push(name)
    }
  })
}

function generateExports(exportStatements) {
  if (!Array.isArray(exportStatements) || exportStatements.length === 0) {
    return ''
  }
  const exportNames = exportStatements.join(',\n  ')
  return `export {\n  ${exportNames} \n}`
}
