import test from 'ava';
import getQuery from "../lib/get-query"
import childProcess from "child_process";
import path from 'path'

const expectedKitchenSyncOutput = `
select json_build_object(
  'table_name', array(
    select json_build_object(
      'id', table_name.table_id,
      'other_table', array(
        select json_build_object(
          'id', other_table.other_id
        ) from other_table where other_table.other_id = table_name.table_id
      )
    ) from table_name where table_name.boolean_field = true and table_name.number_field > 5 and example_number = 1
  )
)
`.trim()

const expectedSampleOutput = `
select json_build_object(
  'pages', array(
    select json_build_object(
      'id', pages.page_id,
      'name', pages.page_name,
      'contents', array(
        select json_build_object(
          'id', page_content.page_content_id,
          'name', page_content.page_content_name
        ) from page_content where page_content.page_content_id = pages.page_id
      )
    ) from pages where pages.active = true
  ),
  'galleries', array(
    select json_build_object(
      'id', galleries.gallery_id,
      'name', galleries.gallery_name
    ) from galleries where galleries.active = true
  )
)
`.trim()

const page_contents = {
  page_content: {
    name: 'contents',
    fields: {
      id: 'page_content_id',
      name: 'page_content_name',
    }
  }
}

const query = {
  pages: {
    fields: {
      id: 'page_id',
      name: 'page_name',
    },
    children: page_contents,
    conditions: { active: true},
  },
  galleries: {
    fields: {
      id: 'gallery_id',
      name: 'gallery_name',
    },
    conditions: { active: true}
  } 
}

const basePath = process.cwd()
const kitchenSyncQueryPath = `${ basePath }/test/small-kitchen-sink-query.yaml`
const jsonQueryPath = `${ basePath }/test/query.json`
const yamlQueryPath = `${ basePath }/test/query.yaml`
const cliPath = `${ basePath }/bin/pg-nested-json-query`


test('Test sample query', t => {
	t.deepEqual(getQuery(query).trim(), expectedSampleOutput)
});


test('Test kitchen sink YAML example using CLI using `/usr/bin/env node`', t => {
	t.deepEqual(
    childProcess.execSync(`/usr/bin/env node ${ cliPath } ${ kitchenSyncQueryPath }`).toString().trim(), 
    expectedKitchenSyncOutput
  )
});


test('Test sample JSON query with CLI using `/usr/bin/env node`', t => {
	t.deepEqual(
    childProcess.execSync(`/usr/bin/env node ${ cliPath } ${ jsonQueryPath }`).toString().trim(), 
    expectedSampleOutput
  )
});

test('Test sample YAML query with CLI using `/usr/bin/env node`', t => {
	t.deepEqual(
    childProcess.execSync(`/usr/bin/env node ${ cliPath } ${ yamlQueryPath }`).toString().trim(), 
    expectedSampleOutput
  )
});


