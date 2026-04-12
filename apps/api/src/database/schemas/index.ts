import * as authSchema from './auth.schema'
import * as bookmarkSchema from './bookmark.schema'

export const schema = { ...authSchema, ...bookmarkSchema }
