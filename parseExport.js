module.exports = function (babel) {
  return {
    visitor: {
      ExportDefaultDeclaration: function (path) {
        const { node } = path
        const { declaration } = node
        const { name } = declaration
        if (name) {
          global.defaultExport = name
        } else {
          global.defaultExport = node.id ? node.id.name : undefined
        }
      },
      ExportNamedDeclaration: function (path) {
        global.namedExport = []
        path.node.specifiers.forEach(specifier => {
          global.namedExport.push(specifier.exported.name)
        })
      }
    }
  }
}
