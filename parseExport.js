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
          const { type, id } = declaration
          let defId = id
          if (type === 'VariableDeclaration') {
            const { declarations } = declaration
            defId = Array.isArray(declarations) & declarations.length > 0 ? declarations[0].id : undefined
          }
          const name = defId ? defId.name : undefined
          global.namedExport.push(name)
        }
        if (!Array.isArray(specifiers) || specifiers.length === 0) {
          return
        }
        specifiers.forEach(specifier => {
          if (!ableToExport(specifier)) {
            console.log(specifier)
            return
          }
          const { exported, local } = specifier
          let name = exported.name
          if (name === 'default') {
            name = local.name
            if (!Array.isArray(global.defaultExport)) {
              global.defaultExport = []
            }
            global.defaultExport.push(name)
          } else {
            global.namedExport.push(name)
          }
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
    return false
  }
  return true
}