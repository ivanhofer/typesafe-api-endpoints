export class ApiError extends Error {
	#status: number
	#statusText: string

	constructor(status: number, statusText: string) {
		super(`${status} - ${statusText}`)
		this.#status = status
		this.#statusText = statusText
	}

	get status(): number {
		return this.#status
	}

	get statusText(): string {
		return this.#statusText
	}
}

export class EndpointNotFoundError extends ApiError {
	#endpoint: string

	constructor(endpoint: string) {
		super(404, `endpoint '/${endpoint}' not found`)
		this.#endpoint = endpoint
	}

	get endpoint(): string {
		return this.#endpoint
	}
}
