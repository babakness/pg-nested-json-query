import test from 'ava';
import getQuery from "../lib/get-query"
import childProcess from "child_process";
import path from 'path'
import Promise from 'bluebird'

const basePath = process.cwd()
const kitchenSyncQueryPath = `${ basePath }/test/small-kitchen-sink-query.yaml`
const jsonQueryPath = `${ basePath }/test/query.json`
const yamlQueryPath = `${ basePath }/test/query.yaml`
const cliPath = `${ basePath }/bin/pg-nested-json-query`


const exec = Promise.promisify(childProcess.exec)
const cliExec = cliPath => async filePath => (
  (await exec( `/usr/bin/env node ${ cliPath } ${ filePath }` ))
    .toString()
    .trim()
  )

const queryCliExec = cliExec(cliPath)

const expectedKitchenSyncOutput = `
select json_build_object(
  'table_name', array(
    select json_build_object(
      'id', table_name.table_id,
      'other_table', array(
        select json_build_object(
          'id', other_table.other_id
        ) from other_table where other_table.table_id = table_name.table_id
      )
    ) from table_name where table_name.boolean_field = true and table_name.number_field > 5 and example_number = 1
  )
)
`.trim()

const expectedSampleOutput = `
select json_build_object(
  'pages', array(
    select json_build_object(
      'name', database_table_name_for_pages.page_name,
      'contents', array(
        select json_build_object(
          'name', page_contents.page_content_name,
          'content_child', array(
            select json_build_object(
              'test', content_child.test_field
            ) from content_child where content_child.parent_id = page_contents.id
          )
        ) from page_contents where page_contents.custom_foreign_key_id = database_table_name_for_pages.internal_pages_id
      )
    ) from database_table_name_for_pages where database_table_name_for_pages.active = true
  ),
  'galleries', array(
    select json_build_object(
      'id', galleries.gallery_id,
      'name', galleries.gallery_name
    ) from galleries where galleries.active = true
  )
)
`.trim()

test('Test kitchen sink YAML example using CLI using `/usr/bin/env node`', async t => 
	t.deepEqual(
    await queryCliExec(kitchenSyncQueryPath), 
    expectedKitchenSyncOutput
  )
)


test('Test sample JSON query with CLI using `/usr/bin/env node`', async t =>
	t.deepEqual(
    await queryCliExec(jsonQueryPath), 
    expectedSampleOutput
  )
)

test('Test sample YAML query with CLI using `/usr/bin/env node`', async t =>
	t.deepEqual(
    await queryCliExec(yamlQueryPath), 
    expectedSampleOutput
  )
);


