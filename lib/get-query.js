const isNully = a => a === undefined || a === null || ( typeof a === 'number' && isNaN( a ) )
const trace = a => ( console.log( a ), a )
class Identity {
  constructor( value ) {
    this.$value = value
  }
  join() {
    return this.$value
  }
  map( fn ) {
    return Identity.of( fn( this.$value ) )
  }
  chain( fn ) {
    return this.map( fn ).join()
  }
}
Identity.of = value => new Identity( value )
const Nothing = {
  map: () => Nothing,
  join: () => Nothing,
  chain: () => Nothing,
}
// Beware Just is instance of Identity
class Just extends Identity {}
Just.of = value => new Just( value )
class Maybe extends Just {
  constructor( value ) {
    return isNully( value ) ? Nothing : Just.of( value )
  }
}
Maybe.of = value => new Maybe( value )
const unWrapMaybe = nothingCallback => maybe => maybe === Nothing ? nothingCallback() : maybe.join()
const mergeEntries = arr => arr.reduce( ( acc, [ k, v ] ) => ( acc[ k ] = v, acc ), {} )

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
  .join( ` and\n            ` )

export const wrapWhereClause = str => str.trim() ? `\n          where\n            ${ str.trim() }` : ''

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
    .join( ` and\n            ` )
)

export const getForeignKeyId = ( parentForeignKeyId, parentId ) => parentForeignKeyId || parentId

const ifType = typeString => callback => val => typeof val === typeString ? callback( val ) : val
const boolToPosNeg = ifType( 'boolean' )( b => b ? 1 : -1 )
const numToAscDesc = ifType( 'number' )( n => n > 0 ? 'asc' : 'desc' )
export const getOrderBy = ( { tableInternalName, orderBys } ) => unWrapMaybe( () => '' )(
  Maybe.of( orderBys )
    .map( Object.entries )
    .chain( arr => arr.length > 0 ? Just.of( arr ) : Nothing )
    .map( arr => arr
      // .map( ( index, pair ) => index )
      .map( ( [ k, v ] ) => [ k, boolToPosNeg( v ) ] )
      .map( ( [ k, v ] ) => [ k, numToAscDesc( v ) ] )
      .map( ( [ k, v ] ) => `${ tableInternalName }.${ k } ${ v }` )
      .join( `,\n            ` )
    )
    .map( str => `\n          order by \n            ` + str )
)


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
    conditions: props.conditions || props.where,
    conditionString: props.conditionString || '',
    parentForeignKeyId: getForeignKeyId( props.parentId, parentId ),
    parentTable,
    parentId,
    level,
  } )
} ${ getOrderBy( {
  tableInternalName: getTableInternalName( table, props ),
  orderBys: props.orderBy,
} ) }
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