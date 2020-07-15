module.exports = function () {
  return {
    visitor: {
      ExportDefaultDeclaration: function (path) {
        const { node } = path
        const { declaration } = node
        const { name, id } = declaration
        // console.log('====================================');
        // console.log(node)
        // console.log('====================================');
        if (!ableToExport(node)) {
          console.log(node)
          return
        }
        if (name) {
          // console.log(declaration, '--- declaration')
          global.defaultExport = name || id.name
          return
        }
        // console.log(declaration, '--- declaration no name')
        global.defaultExport = id ? id.name : undefined
      },
      ExportNamedDeclaration: function (path) {
        global.namedExport = []
        const { node } = path
        if (!ableToExport(node)) {
          console.log(node)
          return
        }
        path.node.specifiers.forEach(specifier => {
          if (!ableToExport(specifier)) {
            console.log(specifier)
            return
          }
          global.namedExport.push(specifier.exported.name)
        })
      }
    }
  }
}

function ableToExport(node) {
  if (!node) {
    return true
  }
  const { leadingComments } = node
  // console.log('====================================');
  // console.log(leadingComments, '---- leadingElements');
  // console.log(node, '---- leadingElements');
  if (!leadingComments || !Array.isArray(leadingComments) || leadingComments.length === 0) {
    return true
  }
  const [comment] = leadingComments
  if (!comment) {
    return true
  }
  const { value } = comment
  if (typeof value === 'string' && value.includes('no export')) {
    console.log('11111')
    return false
  }
  return true
}