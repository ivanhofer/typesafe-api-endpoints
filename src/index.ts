import { createTypesafeApiEndpointsClient } from './connectors/connector.client'
import { createTypesafeApiEndpointsServer } from './connectors/connector.server'
import { ApiError, EndpointNotFoundError } from './errors'
import type { CreateTypesafeApiEndpointsSchema, MethodsFromSchema, EndpointStringsFromSchema } from './types/types'
import type { ApiResponse } from './types/types.client'
import { ServerHandler, StatusResponse } from './types/types.server'

export { createTypesafeApiEndpointsClient, createTypesafeApiEndpointsServer, ApiError, EndpointNotFoundError, StatusResponse }
export type { CreateTypesafeApiEndpointsSchema, MethodsFromSchema, EndpointStringsFromSchema, ApiResponse, ServerHandler }

