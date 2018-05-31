#!/usr/bin/env node

require = require('@std/esm')(module)
const JSON6 = require('json-6')
const getSqlQuery = require('../lib/get-query.js').default
const fs = require('fs')
const file = process.argv[2]
const script = process.argv[1].split('/').splice(-1)[0]
// process.exit()

if(!file) {
  console.log(`
  USAGE:

  ${script} JSON6-FILE
  
  JSON6-FILE is JSON6 formatted document. The query should
  be structured as such:

  {
    table_name: {
      fields: {
        'id': 'sample_id'
      },
      children: other_table,
      conditionString: 'example_number = 1',
      conditions: { boolean_field: true, number_field: '> 5' },
    }
  }
  
  'table_name' - is the name of the table querying

  'children' - is an embedded query neste under the current table

  'conditions' - contains field keys with values that the field 
                  should equal. A leading '=' is implied if an
                  operator is not specified.

  'conditionString' - raw unprocessed condition.

  `)
  process.exit()
}


const parseContent = (fileContent) => {
  try {
    const jsonQuery = JSON6.parse(fileContent)
    if(!jsonQuery) {
      console.log('Parse error in '+file)
    }
    return jsonQuery
  } catch (e) {
    console.log('Parse error in '+file)
  }
}

const fileContent = fs.readFileSync(file,'utf8')
const jsonQuery = parseContent(fileContent)

console.log(
  getSqlQuery(jsonQuery)
)