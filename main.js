//@ts-check
import { getQuery } from './lib/get-query'
// import { trace } from './lib/functional'

// const trace = data => console.log(data)

// String.prototype.map = function(func) {
//   return func(this)
// }

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
    // conditionString: 'foobar = 99',
    // conditions: { page_active_checkbox: true },
  },
  galleries: {
    fields: {
      id: 'gallery_id',
      name: 'gallery_name',
    },
    // conditions: { gallery_active_checkbox: true, },
  } 
}
const trace = ( data ) => ( console.log(data), data )

trace( getQuery( query ) ) 