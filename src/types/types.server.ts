import type {
	AnyObject,
	ApiParams,
	ApiPayload,
	ApiResult,
	ApiSchema,
	EndpointStringsFromSchema,
	MethodsFromSchema,
	ParseQuery,
	ParseSlugs
} from './types'

// public ------------------------------------------------------------------------------------------------------------

export type Server<Schema extends ApiSchema> = {
	[Method in MethodsFromSchema<Schema>]: MethodHandler<Schema, Method, EndpointStringsFromSchema<Schema>>
}

// handler ------------------------------------------------------------------------------------------------------------

type WithBody<Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>, Endpoint extends EndpointStringsFromSchema<Schema>[Method], T> = Method extends 'GET'
	? T
	: T & { body: ApiPayload<Schema, Method, Endpoint> }

type FunctionDefinition<
	Schema extends ApiSchema,
	Method extends MethodsFromSchema<Schema>,
	Endpoint extends EndpointStringsFromSchema<Schema>[Method],
	ParamsType,
	ReturnType,
	> = ReturnType extends undefined
	? unknown
	: ParamsType extends AnyObject
	? (args: WithBody<Schema, Method, Endpoint, ParamsType>) => Promise<ReturnType>
	: () => Promise<ReturnType>

type ServerHandlerInner<Schema extends ApiSchema, Methods extends MethodsFromSchema<Schema>, Endpoints extends EndpointStringsFromSchema<Schema>> = {
	[Method in Methods]: {
		[Endpoint in Endpoints[Method]]: Endpoint extends string
		? FunctionDefinition<
			Schema,
			Method,
			Endpoint,
			ApiParams<ParseSlugs<Endpoint>, ParseQuery<Endpoint>>,
			ApiResult<Schema, Method, Endpoint>
		>
		: never
	}
}

export type ServerHandler<Schema extends ApiSchema> = ServerHandlerInner<
	Schema,
	MethodsFromSchema<Schema>,
	EndpointStringsFromSchema<Schema>
>

export type MethodHandler<Schema extends ApiSchema, Method extends MethodsFromSchema<Schema>, EndpointStrings extends EndpointStringsFromSchema<Schema>> = <Endpoint extends EndpointStrings[Method]>(
	endpoint: Endpoint,
	urlSearchParams: URLSearchParams,
	body: ApiPayload<Schema, Method, Endpoint>, // TODO: define 'never' case
) => Promise<ApiResult<Schema, Method, Endpoint>>
