module.exports = function () {
  return {
    visitor: {
      ExportDefaultDeclaration: function (path) {
        const { node } = path
        const { declaration } = node
        const { name, id } = declaration

        if (!ableToExport(node)) {
          return
        }
        if (name) {
          global.defaultExport = name || id.name
          return
        }
        global.defaultExport = id ? id.name : undefined
      },
      ExportNamedDeclaration: function (path) {
        if (!Array.isArray(global.namedExport)) {
          global.namedExport = []
        }
        const { node } = path
        if (!ableToExport(node)) {
          return
        }
        const { declaration, specifiers } = node
        if (declaration) {
          const name = declaration.id ? declaration.id.name : undefined
          global.namedExport.push(name)
        }
        if (!Array.isArray(specifiers) || specifiers.length === 0) {
          return
        }
        specifiers.forEach(specifier => {
          // if (!ableToExport(specifier)) {
          //   console.log(specifier)
          //   return
          // }
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