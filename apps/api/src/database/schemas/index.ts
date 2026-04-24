import * as authSchema from './auth.schema'
import * as bookmarkSchema from './bookmark.schema'
import * as tagSchema from './tag.schema'

export const schema = { ...authSchema, ...bookmarkSchema, ...tagSchema }
