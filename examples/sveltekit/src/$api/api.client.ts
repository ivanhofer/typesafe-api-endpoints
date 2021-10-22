import { createTypesafeApiEndpointsClient } from 'typesafe-api-endpoints'
import type { Schema } from './schema'

// client -------------------------------------------------------------------------------------------------------------

export const api = createTypesafeApiEndpointsClient<Schema>('api', fetch)
