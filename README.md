# Intro

This library exports a function `getQuery` which takes a JSON query and returns an Postgres SQL query to retrieve nested data in JSON form.

# JSON Query

Here is an example of a JSON query

```javascript
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
```
# Description
  
  `table_name` - is the name of the table querying

  `children` - is an embedded query neste under the current table

  `conditions` - contains field keys with values that the field 
                  should equal. A leading '=' is implied if an
                  operator is not specified.

  `conditionString` - raw unprocessed condition.

# Example

```javascript

import getQuery from 'pg-nested-json-query'

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

```

Output

```sql

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

```
# CLI Tool

This package provides a CLI in `bin` directory that takes JSON6 file as a query and writes and Postgres SQL query to STDIN.

# MIT License (As-Is No Warranty Open License)

Copyright 2018 Babak Badaei

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.