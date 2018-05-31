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

# CLI Tool

This package provides a CLI in `bin` directory that takes JSON6 file as a query and writes and Postgres SQL query to STDIN.

# MIT License (As-Is No Warranty Open License)

Copyright 2018 Babak Badaei

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.