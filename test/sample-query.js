import test from 'ava';
import getQuery from "../lib/get-query"






const expectedOutput = `
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
    conditions: { active: true },
  },
  galleries: {
    fields: {
      id: 'gallery_id',
      name: 'gallery_name',
    },
    conditions: { active: true}
  } 
}

// TODO: Tets
test('Test sample query', t => {
	t.deepEqual(getQuery(query).trim(), expectedOutput)
});


