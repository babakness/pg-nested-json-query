const { entries } = Object
const identity = x => x

export const getTableFields = ( table, fields ) => entries( fields ).map(
  ([ name , field ]) =>`'${ name }', ${ table }.${ field }`
)

export const getTableName = ( table, props ) => props.name || table

export const getAllFields = ( table, props, level ) => [ 
    ...getTableFields( table, props.fields ), 
    ...getTable( props.children || [], { level: level+1, parentTable: table, parentId: props.fields.id } )
  ]
    .join(`,\n          `) 

export const getFlattenConditions = ( parentTable, conditions ) => entries( conditions )
  .map( ([ field, condition ]) => [ 
      field.includes( '.' ) 
        ? field.trim() 
        : parentTable+'.'+field.trim(), 
      String( condition ).match( /^\s*[^a-z0-9_]/i ) 
        ? String( condition ).trim() 
        : '= '+String( condition ).trim()
    ]
      .join( ' ' ) 
  )
    .join( ' and ' )

export const wrapWhereClause = str => str.trim() ? `where ${ str.trim() }` : ''

export const getConditions = ( table, props, parentTable, parentId, level ) => wrapWhereClause(
  [ 
    ( parentTable && parentId && props.fields && props.fields.id ) 
      && `${ table }.${ props.fields.id } = ${ parentTable }.${ parentId }`,
    ( props.conditions ) 
      && getFlattenConditions( table, props.conditions ), 
    props.conditionString
  ]
    .filter( identity )
    .join(' and ')
)

export const getTable = ( query, { parentTable = null, parentId = null, level = 0 ,} = {} ) => entries( query )
  .map(
    ([ table, props ]) => `
      '${ getTableName( table, props ) }', array(
        select json_build_object(
          ${ getAllFields( table, props, level ) }
        ) from ${ table } ${ getConditions( table, props, parentTable, parentId, level ) }
      )`
        .replace( /\n/g, `\n    ` )
  )

export const getQuery = ( query ) => `
        select json_build_object(
          ${ getTable( query ).join(",") }
        )
`
  .replace( /\n        /g, "\n" )
  .replace( /\n[ ]*\n/g, "\n" )

export default getQuery