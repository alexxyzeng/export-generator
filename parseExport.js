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
        if (id) {
          global.defaultExport = id.name || undefined
          return
        }
        global.defaultExport = undefined

      },
      ExportNamedDeclaration: function (path) {
        if (!Array.isArray(global.namedExport)) {
          global.namedExport = []
        }
        const { node } = path
        if (!ableToExport(node)) {
          return
        }
        const { declaration, specifiers, source } = node
        
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

          let localName = local.name
          let exportedName = exported.name
          if (exportedName === 'default') {
            exportedName = localName
            if (!Array.isArray(global.defaultExport)) {
              global.defaultExport = []
            }
            global.defaultExport.push(exportedName)
          } if (localName === 'default') {
            if (source) {
              global.namedExport.push(exportedName)
            } else {
              if (!Array.isArray(global.defaultExport)) {
                global.defaultExport = []
              }
              global.defaultExport.push(exportedName)
            }
          } else {
            global.namedExport.push(exportedName)
          }
        })
      },
      ImportDeclaration: function (path) {
        if (!global.imports) {
          global.imports = {}
        }
        const importFrom = path.node.source.value
        if (!importFrom.startsWith('.')) {
          global.imports[importFrom] = importFrom
        }
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

// NodePath {
//   parent: Node {
//     type: 'Program',
//     start: 0,
//     end: 4551,
//     loc: SourceLocation { start: [Position], end: [Position] },
//     sourceType: 'module',
//     interpreter: null,
//     body: [
//       [Node], [Node],
//       [Node], [Node],
//       [Node], [Node],
//       [Node], [Node]
//     ],
//     directives: [],
//     leadingComments: undefined,
//     innerComments: undefined,
//     trailingComments: undefined
//   },
//   hub: {
//     file: File {
//       _map: [Map],
//       declarations: {},
//       path: [NodePath],
//       ast: [Node],
//       metadata: {},
//       code: "import React, { PureComponent } from 'react';\n" +
//         "import PropTypes from 'prop-types';\n" +
//         "import fengmapSDK from 'fengmap';\n" +
//         'import {\n' +
//         '  FengmapBase,\n' +
//         '  FengmapNavigation,\n' +
//         '  FengmapFloorControl,\n' +
//         '  Fengmap3DControl,\n' +
//         '  FengmapCompassControl,\n' +
//         '  FengmapResetControl,\n' +
//         '  FengmapZoomControl,\n' +
//         '  FengmapRotateControl,\n' +
//         "} from 'react-fengmap';\n" +
//         "import _ from 'lodash';\n" +
//         '\n' +
//         '// eslint-disable-next-line no-unused-vars\n' +
//         'class Map extends PureComponent {\n' +
//         '  constructor(props) {\n' +
//         '    super(props);\n' +
//         '    this.state = {};\n' +
//         '\n' +
//         '    this.fengBaseRef = React.createRef();\n' +
//         '  }\n' +
//         '\n' +
//         '  componentDidUpdate(prevProps, prevState, snapshot) {\n' +
//         '    if (\n' +
//         '      !_.isEqual(prevProps.authMapFeat, this.props.authMapFeat) ||\n' +
//         '      !_.isEqual(prevProps.navigation, this.props.navigation) ||\n' +
//         '      !_.isEqual(prevProps.mapOptionsNoPack, this.props.mapOptionsNoPack)\n' +
//         '    ) {\n' +
//         '      setTimeout(() => {\n' +
//         '        this.fengBaseRef.current._destroy();\n' +
//         '        this.fengBaseRef.current._loadMap(this.props.mapOptionsToMapPack.mapId);\n' +
//         '      }, 0);\n' +
//         '    }\n' +
//         '  }\n' +
//         '\n' +
//         '  render() {\n' +
//         '    const {\n' +
//         '      width,\n' +
//         '      height,\n' +
//         '      authMapFeat,\n' +
//         '      navigation,\n' +
//         '      mapOptionsNoPack,\n' +
//         '      mapOptionsToMapPack,\n' +
//         '      startPoint,\n' +
//         '      endPoint,\n' +
//         '    } = this.props;\n' +
//         '\n' +
//         '    return (\n' +
//         '      <FengmapBase\n' +
//         '        ref={this.fengBaseRef}\n' +
//         '        fengmapSDK={fengmapSDK}\n' +
//         '        mapId={mapOptionsToMapPack.mapId}\n' +
//         '        mapOptions={{\n' +
//         '          ...mapOptionsToMapPack,\n' +
//         '          compassSize: mapOptionsNoPack.compassSize,\n' +
//         '          defaultMapScale: mapOptionsNoPack.defaultMapScale,\n' +
//         '          mapScaleRange: mapOptionsNoPack.mapScaleRange,\n' +
//         '          defaultControlsPose: mapOptionsNoPack.defaultControlsPose,\n' +
//         '        }}\n' +
//         '        loadingTxt={mapOptionsNoPack.loadingTxt}\n' +
//         '        gestureEnableController={{\n' +
//         "          enableMapPinch: authMapFeat.includes('scale'),\n" +
//         '          enableMapIncline: true,\n' +
//         "          enableMapPan: authMapFeat.includes('move'),\n" +
//         '        }}\n' +
//         '        style={{\n' +
//         '          width: `${width}px`,\n' +
//         '          height: `${height}px`,\n' +
//         "          fontFamily: 'PorscheNextWAr',\n" +
//         "          borderRadius: '50px',\n" +
//         "          background: '#000000',\n" +
//         '        }}\n' +
//         '        events={\n' +
//         '          {\n' +
//         '            // loadComplete: _onMapLoaded,\n' +
//         '            // mapClickNode: mapClickNode,\n' +
//         '            // focusGroupIDChanged: (v, map) => floorChange(v, map)\n' +
//         '          }\n' +
//         '        }\n' +
//         '        FMDirection={{\n' +
//         '          FACILITY: 1,\n' +
//         '        }}\n' +
//         '      >\n' +
//         "        {authMapFeat.includes('navigation') ? (\n" +
//         '          <FengmapNavigation\n' +
//         '            naviOptions={{\n' +
//         '              lineStyle: {\n' +
//         '                lineType: fengmapSDK.FMLineType[navigation.lineType],\n' +
//         '                lineWidth: navigation.lineWidth,\n' +
//         '              },\n' +
//         '            }}\n' +
//         '            start={startPoint}\n' +
//         '            end={endPoint}\n' +
//         '          />\n' +
//         '        ) : null}\n' +
//         '\n' +
//         "        {authMapFeat.includes('reload') ? (\n" +
//         '          <FengmapResetControl\n' +
//         '            ctrlOptions={{\n' +
//         '              position: fengmapSDK.controlPositon.RIGHT_BOTTOM,\n' +
//         "              imgURL: '/assets/reset.png',\n" +
//         '            }}\n' +
//         '          />\n' +
//         '        ) : null}\n' +
//         '\n' +
//         "        {authMapFeat.includes('floor') ? (\n" +
//         '          <FengmapFloorControl\n' +
//         '            ctrlOptions={{\n' +
//         '              position: fengmapSDK.controlPositon.RIGHT_TOP,\n' +
//         '              showBtnCount: 7,\n' +
//         '            }}\n' +
//         '            labelFormater={v => `L${v}`}\n' +
//         '          />\n' +
//         '        ) : null}\n' +
//         '\n' +
//         "        {authMapFeat.includes('2/3D') ? (\n" +
//         '          <Fengmap3DControl\n' +
//         '            ctrlOptions={{\n' +
//         '              position: fengmapSDK.controlPositon.RIGHT_BOTTOM,\n' +
//         "              imgURL: '/assets/',\n" +
//         '              viewModeButtonNeeded: true,\n' +
//         '              groupsButtonNeeded: false,\n' +
//         '            }}\n' +
//         '          />\n' +
//         '        ) : null}\n' +
//         '\n' +
//         '        <FengmapCompassControl\n' +
//         "          visible={authMapFeat.includes('compass')}\n" +
//         '          image={{\n' +
//         "            bg: '/assets/compass_bg.png',\n" +
//         "            fg: '/assets/compass_fg.png',\n" +
//         '          }}\n' +
//         '        />\n' +
//         '\n' +
//         "        {authMapFeat.includes('scale') ? (\n" +
//         '          <FengmapZoomControl\n' +
//         "            ctrlOptions={{ position: fengmapSDK.controlPositon.RIGHT_TOP, imgURL: '/assets/' }}\n" +
//         '          />\n' +
//         '        ) : null}\n' +
//         '\n' +
//         "        {authMapFeat.includes('rotate') ? (\n" +
//         '          <FengmapRotateControl\n' +
//         '            angle={90}\n' +
//         '            ctrlOptions={{\n' +
//         '              position: fengmapSDK.controlPositon.LEFT_BOTTOM,\n' +
//         '            }}\n' +
//         '          />\n' +
//         '        ) : null}\n' +
//         '      </FengmapBase>\n' +
//         '    );\n' +
//         '  }\n' +
//         '}\n' +
//         '\n' +
//         'Map.propTypes = {\n' +
//         '  authMapFeat: PropTypes.array,\n' +
//         '  navigation: PropTypes.object,\n' +
//         '  mapOptionsNoPack: PropTypes.object,\n' +
//         '  mapOptionsToMapPack: PropTypes.object,\n' +
//         '  width: PropTypes.number,\n' +
//         '  height: PropTypes.number,\n' +
//         '  startPoint: PropTypes.object,\n' +
//         '  endPoint: PropTypes.object,\n' +
//         '};\n' +
//         '\n' +
//         'export default Map;\n',
//       inputMap: null,
//       hub: [Circular],
//       opts: [Object],
//       scope: [Scope]
//     },
//     getCode: [Function: getCode],
//     getScope: [Function: getScope],
//     addHelper: [Function: bound addHelper],
//     buildError: [Function: bound buildCodeFrameError]
//   },
//   contexts: [
//     TraversalContext {
//       queue: [Array],
//       parentPath: [NodePath],
//       scope: [Scope],
//       state: undefined,
//       opts: [Object],
//       priorityQueue: []
//     }
//   ],
//   data: null,
//   _traverseFlags: 0,
//   state: undefined,
//   opts: {
//     ExportDefaultDeclaration: { enter: [Array] },
//     ExportNamedDeclaration: { enter: [Array] },
//     ImportDeclaration: { enter: [Array] },
//     _exploded: {},
//     _verified: {},
//     JSXNamespacedName: { enter: [Array] },
//     JSXSpreadChild: { enter: [Array] },
//     JSXElement: { exit: [Array] },
//     JSXFragment: { exit: [Array] },
//     Program: { enter: [Array], exit: [Array] },
//     JSXAttribute: { enter: [Array] },
//     PrivateName: { enter: [Array] },
//     ClassExpression: { enter: [Array] },
//     ClassDeclaration: { enter: [Array] },
//     OptionalCallExpression: { enter: [Array] },
//     OptionalMemberExpression: { enter: [Array] },
//     BlockStatement: { exit: [Array] },
//     TSModuleBlock: { exit: [Array] }
//   },
//   skipKeys: null,
//   parentPath: NodePath {
//     parent: Node {
//       type: 'File',
//       start: 0,
//       end: 4551,
//       loc: [SourceLocation],
//       errors: [],
//       program: [Node],
//       comments: [Array],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     hub: {
//       file: [File],
//       getCode: [Function: getCode],
//       getScope: [Function: getScope],
//       addHelper: [Function: bound addHelper],
//       buildError: [Function: bound buildCodeFrameError]
//     },
//     contexts: [ [TraversalContext] ],
//     data: null,
//     _traverseFlags: 0,
//     state: undefined,
//     opts: {
//       ExportDefaultDeclaration: [Object],
//       ExportNamedDeclaration: [Object],
//       ImportDeclaration: [Object],
//       _exploded: {},
//       _verified: {},
//       JSXNamespacedName: [Object],
//       JSXSpreadChild: [Object],
//       JSXElement: [Object],
//       JSXFragment: [Object],
//       Program: [Object],
//       JSXAttribute: [Object],
//       PrivateName: [Object],
//       ClassExpression: [Object],
//       ClassDeclaration: [Object],
//       OptionalCallExpression: [Object],
//       OptionalMemberExpression: [Object],
//       BlockStatement: [Object],
//       TSModuleBlock: [Object]
//     },
//     skipKeys: null,
//     parentPath: null,
//     context: TraversalContext {
//       queue: [Array],
//       parentPath: undefined,
//       scope: [Scope],
//       state: undefined,
//       opts: [Object],
//       priorityQueue: []
//     },
//     container: Node {
//       type: 'File',
//       start: 0,
//       end: 4551,
//       loc: [SourceLocation],
//       errors: [],
//       program: [Node],
//       comments: [Array],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     listKey: undefined,
//     key: 'program',
//     node: Node {
//       type: 'Program',
//       start: 0,
//       end: 4551,
//       loc: [SourceLocation],
//       sourceType: 'module',
//       interpreter: null,
//       body: [Array],
//       directives: [],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     scope: Scope {
//       uid: 329,
//       block: [Node],
//       path: [Circular],
//       labels: Map {},
//       inited: true,
//       references: [Object: null prototype],
//       bindings: [Object: null prototype],
//       globals: [Object: null prototype],
//       uids: [Object: null prototype] {},
//       data: [Object: null prototype] {},
//       crawling: false
//     },
//     type: 'Program'
//   },
//   context: TraversalContext {
//     queue: [
//       [Circular],
//       [NodePath],
//       [NodePath],
//       [NodePath],
//       [NodePath],
//       [NodePath],
//       [NodePath],
//       [NodePath]
//     ],
//     parentPath: NodePath {
//       parent: [Node],
//       hub: [Object],
//       contexts: [Array],
//       data: null,
//       _traverseFlags: 0,
//       state: undefined,
//       opts: [Object],
//       skipKeys: null,
//       parentPath: null,
//       context: [TraversalContext],
//       container: [Node],
//       listKey: undefined,
//       key: 'program',
//       node: [Node],
//       scope: [Scope],
//       type: 'Program'
//     },
//     scope: Scope {
//       uid: 329,
//       block: [Node],
//       path: [NodePath],
//       labels: Map {},
//       inited: true,
//       references: [Object: null prototype],
//       bindings: [Object: null prototype],
//       globals: [Object: null prototype],
//       uids: [Object: null prototype] {},
//       data: [Object: null prototype] {},
//       crawling: false
//     },
//     state: undefined,
//     opts: {
//       ExportDefaultDeclaration: [Object],
//       ExportNamedDeclaration: [Object],
//       ImportDeclaration: [Object],
//       _exploded: {},
//       _verified: {},
//       JSXNamespacedName: [Object],
//       JSXSpreadChild: [Object],
//       JSXElement: [Object],
//       JSXFragment: [Object],
//       Program: [Object],
//       JSXAttribute: [Object],
//       PrivateName: [Object],
//       ClassExpression: [Object],
//       ClassDeclaration: [Object],
//       OptionalCallExpression: [Object],
//       OptionalMemberExpression: [Object],
//       BlockStatement: [Object],
//       TSModuleBlock: [Object]
//     },
//     priorityQueue: []
//   },
//   container: [
//     Node {
//       type: 'ImportDeclaration',
//       start: 0,
//       end: 45,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ImportDeclaration',
//       start: 46,
//       end: 81,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ImportDeclaration',
//       start: 82,
//       end: 115,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ImportDeclaration',
//       start: 116,
//       end: 321,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ImportDeclaration',
//       start: 322,
//       end: 345,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       trailingComments: [Array],
//       leadingComments: undefined,
//       innerComments: undefined
//     },
//     Node {
//       type: 'ClassDeclaration',
//       start: 390,
//       end: 4247,
//       loc: [SourceLocation],
//       id: [Node],
//       superClass: [Node],
//       body: [Node],
//       leadingComments: [Array],
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExpressionStatement',
//       start: 4249,
//       end: 4529,
//       loc: [SourceLocation],
//       expression: [Node],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportDefaultDeclaration',
//       start: 4531,
//       end: 4550,
//       loc: [SourceLocation],
//       declaration: [Node],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     }
//   ],
//   listKey: 'body',
//   key: 0,
//   node: Node {
//     type: 'ImportDeclaration',
//     start: 0,
//     end: 45,
//     loc: SourceLocation { start: [Position], end: [Position] },
//     specifiers: [ [Node], [Node] ],
//     source: Node {
//       type: 'StringLiteral',
//       start: 37,
//       end: 44,
//       loc: [SourceLocation],
//       extra: [Object],
//       value: 'react',
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     leadingComments: undefined,
//     innerComments: undefined,
//     trailingComments: undefined
//   },
//   scope: Scope {
//     uid: 329,
//     block: Node {
//       type: 'Program',
//       start: 0,
//       end: 4551,
//       loc: [SourceLocation],
//       sourceType: 'module',
//       interpreter: null,
//       body: [Array],
//       directives: [],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     path: NodePath {
//       parent: [Node],
//       hub: [Object],
//       contexts: [Array],
//       data: null,
//       _traverseFlags: 0,
//       state: undefined,
//       opts: [Object],
//       skipKeys: null,
//       parentPath: null,
//       context: [TraversalContext],
//       container: [Node],
//       listKey: undefined,
//       key: 'program',
//       node: [Node],
//       scope: [Circular],
//       type: 'Program'
//     },
//     labels: Map {},
//     inited: true,
//     references: [Object: null prototype] {
//       React: true,
//       PureComponent: true,
//       PropTypes: true,
//       fengmapSDK: true,
//       FengmapBase: true,
//       FengmapNavigation: true,
//       FengmapFloorControl: true,
//       Fengmap3DControl: true,
//       FengmapCompassControl: true,
//       FengmapResetControl: true,
//       FengmapZoomControl: true,
//       FengmapRotateControl: true,
//       _: true,
//       Map: true,
//       props: true,
//       prevProps: true,
//       prevState: true,
//       snapshot: true,
//       width: true,
//       height: true,
//       authMapFeat: true,
//       navigation: true,
//       mapOptionsNoPack: true,
//       mapOptionsToMapPack: true,
//       startPoint: true,
//       endPoint: true,
//       v: true
//     },
//     bindings: [Object: null prototype] {
//       React: [Binding],
//       PureComponent: [Binding],
//       PropTypes: [Binding],
//       fengmapSDK: [Binding],
//       FengmapBase: [Binding],
//       FengmapNavigation: [Binding],
//       FengmapFloorControl: [Binding],
//       Fengmap3DControl: [Binding],
//       FengmapCompassControl: [Binding],
//       FengmapResetControl: [Binding],
//       FengmapZoomControl: [Binding],
//       FengmapRotateControl: [Binding],
//       _: [Binding],
//       Map: [Binding]
//     },
//     globals: [Object: null prototype] { setTimeout: [Node] },
//     uids: [Object: null prototype] {},
//     data: [Object: null prototype] {},
//     crawling: false
//   },
//   type: 'ImportDeclaration'
// }

// NodePath {
//   parent: Node {
//     type: 'Program',
//     start: 0,
//     end: 748,
//     loc: SourceLocation { start: [Position], end: [Position] },
//     sourceType: 'module',
//     interpreter: null,
//     body: [
//       [Node], [Node],
//       [Node], [Node],
//       [Node], [Node],
//       [Node], [Node],
//       [Node], [Node]
//     ],
//     directives: [],
//     leadingComments: undefined,
//     innerComments: undefined,
//     trailingComments: undefined
//   },
//   hub: {
//     file: File {
//       _map: [Map],
//       declarations: {},
//       path: [NodePath],
//       ast: [Node],
//       metadata: {},
//       code: "export { default as FengmapBase } from './FengmapBase'\n" +
//         "export { default as FengmapFloors } from './FengmapFloors'\n" +
//         '\n' +
//         "export { default as FengmapZoomControl } from './controls/FengmapZoomControl'\n" +
//         "export { default as FengmapRotateControl } from './controls/FengmapRotateControl'\n" +
//         "export { default as FengmapFloorControl } from './controls/FengmapFloorControl'\n" +
//         "export { default as Fengmap3DControl } from './controls/Fengmap3DControl'\n" +
//         "export { default as FengmapCompassControl } from './controls/FengmapCompassControl'\n" +
//         "export { default as FengmapResetControl } from './controls/FengmapResetControl'\n" +
//         '\n' +
//         "export { default as FengmapImageMarker } from './overlays/FengmapImageMarker'\n" +
//         "export { default as FengmapNavigation } from './overlays/FengmapNavigation'\n",
//       inputMap: null,
//       hub: [Circular],
//       opts: [Object],
//       scope: [Scope]
//     },
//     getCode: [Function: getCode],
//     getScope: [Function: getScope],
//     addHelper: [Function: bound addHelper],
//     buildError: [Function: bound buildCodeFrameError]
//   },
//   contexts: [
//     TraversalContext {
//       queue: [Array],
//       parentPath: [NodePath],
//       scope: [Scope],
//       state: undefined,
//       opts: [Object],
//       priorityQueue: []
//     }
//   ],
//   data: null,
//   _traverseFlags: 0,
//   state: undefined,
//   opts: {
//     ExportDefaultDeclaration: { enter: [Array] },
//     ExportNamedDeclaration: { enter: [Array] },
//     ImportDeclaration: { enter: [Array] },
//     _exploded: {},
//     _verified: {},
//     JSXNamespacedName: { enter: [Array] },
//     JSXSpreadChild: { enter: [Array] },
//     JSXElement: { exit: [Array] },
//     JSXFragment: { exit: [Array] },
//     Program: { enter: [Array], exit: [Array] },
//     JSXAttribute: { enter: [Array] },
//     PrivateName: { enter: [Array] },
//     ClassExpression: { enter: [Array] },
//     ClassDeclaration: { enter: [Array] },
//     OptionalCallExpression: { enter: [Array] },
//     OptionalMemberExpression: { enter: [Array] },
//     BlockStatement: { exit: [Array] },
//     TSModuleBlock: { exit: [Array] }
//   },
//   skipKeys: null,
//   parentPath: NodePath {
//     parent: Node {
//       type: 'File',
//       start: 0,
//       end: 748,
//       loc: [SourceLocation],
//       errors: [],
//       program: [Node],
//       comments: [],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     hub: {
//       file: [File],
//       getCode: [Function: getCode],
//       getScope: [Function: getScope],
//       addHelper: [Function: bound addHelper],
//       buildError: [Function: bound buildCodeFrameError]
//     },
//     contexts: [ [TraversalContext] ],
//     data: null,
//     _traverseFlags: 0,
//     state: undefined,
//     opts: {
//       ExportDefaultDeclaration: [Object],
//       ExportNamedDeclaration: [Object],
//       ImportDeclaration: [Object],
//       _exploded: {},
//       _verified: {},
//       JSXNamespacedName: [Object],
//       JSXSpreadChild: [Object],
//       JSXElement: [Object],
//       JSXFragment: [Object],
//       Program: [Object],
//       JSXAttribute: [Object],
//       PrivateName: [Object],
//       ClassExpression: [Object],
//       ClassDeclaration: [Object],
//       OptionalCallExpression: [Object],
//       OptionalMemberExpression: [Object],
//       BlockStatement: [Object],
//       TSModuleBlock: [Object]
//     },
//     skipKeys: null,
//     parentPath: null,
//     context: TraversalContext {
//       queue: [Array],
//       parentPath: undefined,
//       scope: [Scope],
//       state: undefined,
//       opts: [Object],
//       priorityQueue: []
//     },
//     container: Node {
//       type: 'File',
//       start: 0,
//       end: 748,
//       loc: [SourceLocation],
//       errors: [],
//       program: [Node],
//       comments: [],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     listKey: undefined,
//     key: 'program',
//     node: Node {
//       type: 'Program',
//       start: 0,
//       end: 748,
//       loc: [SourceLocation],
//       sourceType: 'module',
//       interpreter: null,
//       body: [Array],
//       directives: [],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     scope: Scope {
//       uid: 0,
//       block: [Node],
//       path: [Circular],
//       labels: Map {},
//       inited: true,
//       references: [Object: null prototype] {},
//       bindings: [Object: null prototype] {},
//       globals: [Object: null prototype],
//       uids: [Object: null prototype] {},
//       data: [Object: null prototype] {},
//       crawling: false
//     },
//     type: 'Program'
//   },
//   context: TraversalContext {
//     queue: [
//       [NodePath], [NodePath],
//       [NodePath], [NodePath],
//       [NodePath], [NodePath],
//       [NodePath], [NodePath],
//       [NodePath], [Circular]
//     ],
//     parentPath: NodePath {
//       parent: [Node],
//       hub: [Object],
//       contexts: [Array],
//       data: null,
//       _traverseFlags: 0,
//       state: undefined,
//       opts: [Object],
//       skipKeys: null,
//       parentPath: null,
//       context: [TraversalContext],
//       container: [Node],
//       listKey: undefined,
//       key: 'program',
//       node: [Node],
//       scope: [Scope],
//       type: 'Program'
//     },
//     scope: Scope {
//       uid: 0,
//       block: [Node],
//       path: [NodePath],
//       labels: Map {},
//       inited: true,
//       references: [Object: null prototype] {},
//       bindings: [Object: null prototype] {},
//       globals: [Object: null prototype],
//       uids: [Object: null prototype] {},
//       data: [Object: null prototype] {},
//       crawling: false
//     },
//     state: undefined,
//     opts: {
//       ExportDefaultDeclaration: [Object],
//       ExportNamedDeclaration: [Object],
//       ImportDeclaration: [Object],
//       _exploded: {},
//       _verified: {},
//       JSXNamespacedName: [Object],
//       JSXSpreadChild: [Object],
//       JSXElement: [Object],
//       JSXFragment: [Object],
//       Program: [Object],
//       JSXAttribute: [Object],
//       PrivateName: [Object],
//       ClassExpression: [Object],
//       ClassDeclaration: [Object],
//       OptionalCallExpression: [Object],
//       OptionalMemberExpression: [Object],
//       BlockStatement: [Object],
//       TSModuleBlock: [Object]
//     },
//     priorityQueue: []
//   },
//   container: [
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 0,
//       end: 54,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 55,
//       end: 113,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 115,
//       end: 192,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 193,
//       end: 274,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 275,
//       end: 354,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 355,
//       end: 428,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 429,
//       end: 512,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 513,
//       end: 592,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 594,
//       end: 671,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     Node {
//       type: 'ExportNamedDeclaration',
//       start: 672,
//       end: 747,
//       loc: [SourceLocation],
//       specifiers: [Array],
//       source: [Node],
//       declaration: null,
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     }
//   ],
//   listKey: 'body',
//   key: 9,
//   node: Node {
//     type: 'ExportNamedDeclaration',
//     start: 672,
//     end: 747,
//     loc: SourceLocation { start: [Position], end: [Position] },
//     specifiers: [ [Node] ],
//     source: Node {
//       type: 'StringLiteral',
//       start: 717,
//       end: 747,
//       loc: [SourceLocation],
//       extra: [Object],
//       value: './overlays/FengmapNavigation',
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     declaration: null,
//     leadingComments: undefined,
//     innerComments: undefined,
//     trailingComments: undefined
//   },
//   scope: Scope {
//     uid: 0,
//     block: Node {
//       type: 'Program',
//       start: 0,
//       end: 748,
//       loc: [SourceLocation],
//       sourceType: 'module',
//       interpreter: null,
//       body: [Array],
//       directives: [],
//       leadingComments: undefined,
//       innerComments: undefined,
//       trailingComments: undefined
//     },
//     path: NodePath {
//       parent: [Node],
//       hub: [Object],
//       contexts: [Array],
//       data: null,
//       _traverseFlags: 0,
//       state: undefined,
//       opts: [Object],
//       skipKeys: null,
//       parentPath: null,
//       context: [TraversalContext],
//       container: [Node],
//       listKey: undefined,
//       key: 'program',
//       node: [Node],
//       scope: [Circular],
//       type: 'Program'
//     },
//     labels: Map {},
//     inited: true,
//     references: [Object: null prototype] {},
//     bindings: [Object: null prototype] {},
//     globals: [Object: null prototype] { default: [Node] },
//     uids: [Object: null prototype] {},
//     data: [Object: null prototype] {},
//     crawling: false
//   },
//   type: 'ExportNamedDeclaration'
// }