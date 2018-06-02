const {
  entries,
} = Object
const identity = x => x

export const getTableFields = ( tableInternalName, fields ) => entries( fields ).map(
  ( [ name, field ] ) => `'${ name }', ${ tableInternalName }.${ field }`
)

export const getTableExternalName = ( table, props ) => table || props.name
export const getTableInternalName = ( table, props ) => props.name || table
export const getTableInternalId = ( props ) => props.id || props.fields.id || 'id'
export const getAllFields = ( {
  tableInternalName,
  tableInternalId,
  fields,
  children,
  level,
} ) => [
  ...getTableFields( tableInternalName, fields ),
  ...getTable( children || [], {
    level: level + 1,
    parentTable: tableInternalName,
    parentId: tableInternalId,
  } ),
]
  .join( `,\n          ` )

export const getFlattenConditions = ( parentTable, conditions ) => entries( conditions )
  .map( ( [ field, condition ] ) => [
    field.includes( '.' )
      ? field.trim()
      : parentTable + '.' + field.trim(),
    String( condition ).match( /^\s*[^a-z0-9_]/i )
      ? String( condition ).trim()
      : '= ' + String( condition ).trim(),
  ]
    .join( ' ' )
  )
  .join( ' and ' )

export const wrapWhereClause = str => str.trim() ? `where ${ str.trim() }` : ''

export const getConditions = ( {
  tableInternalName,
  tableInternalId,
  conditions,
  conditionString,
  parentForeignKeyId,
  parentTable,
  parentId,
  level,
} ) => wrapWhereClause(
  [
    ( parentTable && parentId )
    && `${ tableInternalName }.${ parentForeignKeyId } = ${ parentTable }.${ parentId }`,
    ( conditions )
    && getFlattenConditions( tableInternalName, conditions ),
    conditionString,
  ]
    .filter( identity )
    .join( ' and ' )
)

export const getForeignKeyId = ( parentForeignKeyId, parentId ) => parentForeignKeyId || parentId

export const getTable = ( query, {
  parentTable = null,
  parentId = null,
  level = 0,
} = {} ) => entries( query )
  .map(
    // `table` is the outward name, the key of the key-value pair
    // `props.name` contains the internal table name, if different
    // `props.id` contains the name of the internal primary key of
    //  the table if different than 'id'. This name can also be
    //  infered from the queries `field` key-value pairs
    ( [ table, props ] ) => `
      '${ getTableExternalName( table, props ) }', array(
        select json_build_object(
          ${ getAllFields( {
    tableInternalName: getTableInternalName( table, props ),
    tableInternalId: getTableInternalId( props ),
    fields: props.fields,
    children: props.children,
    level,
  } ) }
        ) from ${ getTableInternalName( table, props ) } ${
  getConditions( {
    tableInternalName: getTableInternalName( table, props ),
    tableInternalId: getTableInternalId( props ),
    conditions: props.conditions,
    conditionString: props.conditionString || '',
    parentForeignKeyId: getForeignKeyId( props.parentId, parentId ),
    parentTable,
    parentId,
    level,
  } )
}
      )`
      .replace( /\n/g, `\n    ` )
  )

export const getQuery = ( query ) => `
        select json_build_object(
          ${ getTable( query ).join( ',' ) }
        )
`
  .replace( /\n {8}/g, '\n' )
  .replace( /\n[ ]*\n/g, '\n' )

export default getQuery