import type { ApiError } from '../errors'
import type { ApiParams, ApiPayload, ApiResult, ApiSchema, EndpointStringsFromSchema, MethodsFromSchema, ParseQuery, ParseSlugs } from './types'

// public -------------------------------------------------------------------------------------------------------------

export type DoesNotEndWithSlash = string // TODO

export type Client<Schema extends ApiSchema> = {
	[Method in MethodsFromSchema<Schema>]: CallApi<Schema, Method>
}

export type GetHeaders<Schema extends ApiSchema> = (method: MethodsFromSchema<Schema>, endpoint: EndpointStringsFromSchema<Schema>[MethodsFromSchema<Schema>]) => Headers | Promise<Headers> // improve endpoint type

// api-response -------------------------------------------------------------------------------------------------------

type ErrorApiResponse = {
	error: ApiError
	data: undefined
}

type SuccessApiResponse<ReturnType> = {
	data: ReturnType
	error: undefined
}

export type ApiResponse<ReturnType> = ErrorApiResponse | SuccessApiResponse<ReturnType>

// params -------------------------------------------------------------------------------------------------------------

export type ParamsForEndpoint<Endpoint extends string> = ApiParams<ParseSlugs<Endpoint>, ParseQuery<Endpoint>>

// handler ------------------------------------------------------------------------------------------------------------

export type CallApi<Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>> = Method extends 'GET' ? CallApiWithoutBody<Schema, Method> : CallApiWithBody<Schema, Method>

type CallApiWithBody<Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>> = <Endpoint extends EndpointStringsFromSchema<Schema>[Method]>(
	endpoint: Endpoint,
	params: ParamsForEndpoint<Endpoint>,
	body: ApiPayload<Schema, Method, Endpoint>,
) => Promise<ApiResponse<ApiResult<Schema, Method, Endpoint>>>

type CallApiWithoutBody<Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>> = <Endpoint extends EndpointStringsFromSchema<Schema>[Method]>(
	endpoint: Endpoint,
	params: ParamsForEndpoint<Endpoint>,
) => Promise<ApiResponse<ApiResult<Schema, Method, Endpoint>>>
