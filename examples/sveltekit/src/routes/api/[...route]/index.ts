import { handler } from '$api/api.server'
import { sveltekit } from 'typesafe-api-endpoints/adapters'

const { get, post, patch, put, del } = sveltekit(handler)

export { get, post, patch, put, del }