//@ts-check
import getQuery from './lib/get-query'


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

const trace = ( data ) => ( console.log(data), data )

trace( getQuery( query ) ) 