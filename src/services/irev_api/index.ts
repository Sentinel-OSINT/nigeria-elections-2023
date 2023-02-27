import { entities } from "../../core"

/**
 * Extracted from the INEC IReV JS application on 2023-02-26
 */
const DEFAULT_HOSTS = [
    'https://lv001-g.inecelectionresults.ng',
    'https://lv001-r.inecelectionresults.ng',
    'https://irev-v2.herokuapp.com',
]

const SAFARI_BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15'

function nonEmpty<T>(value: T | undefined, defaultValue?: T): T {
    if (!!value) {
        if (!Array.isArray(value)) return value

        if (value.length > 0) return value
    }

    if (!!defaultValue) return defaultValue

    throw new Error('A non-empty value is required for this argument')
}

function sample<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export type LgaApiResult = {
    wards: entities.Ward[],
    lga: entities.LGA,
    state: entities.State,
}

export type PUApiResult = {
    polling_unit: entities.PollingUnit,
    document: entities.Document,
    old_documents: entities.Document[],
}

export interface IrevApi {
    getElectionTypes(): Promise<entities.ElectionType[]>,

    getElections(election_type: string): Promise<entities.Election[]>,

    getElection(id: string): Promise<entities.Election>,

    getElectionStats(id: string): Promise<entities.ElectionPollStats>,

    getLGAsByState(election: string, state_id: number): Promise<LgaApiResult[]>,

    getLGA(election: string, lga: string): Promise<LgaApiResult>,

    getPollingUnitsByWard(election: string, ward: string): Promise<PUApiResult[]>,

    getPollingUnit(election: string, polling_unit: string): Promise<PUApiResult>,
}

export class IrevApiError extends Error {
    constructor(public response: Response) {
        // TODO: More specific error messages
        super('An error occurred while accessing the IReV API')
    }
}

export class IrevHttpApi implements IrevApi {
    /**
     * Bearer tokens for the API. Can be obtained by inspecting any request in the
     * browser after logging in.
     * 
     * TODO: Document how to extract it from local storage, and perhaps how to
     * negotiate for it with email and password.
     */
    private authTokens: string[]

    /**
     * User agent for API requests. From testing, non-browser user agents get blocked.
     */
    private userAgent: string

    /**
     * A list of API hosts to rotate requests between.
     */
    private hosts: string[]

    constructor(props: { authTokens: string[], userAgent?: string, hosts?: string[] }) {
        this.authTokens = nonEmpty(props.authTokens)
        this.hosts = nonEmpty(props.hosts, DEFAULT_HOSTS)
        this.userAgent = nonEmpty(props.userAgent, SAFARI_BROWSER)
    }

    getElectionTypes(): Promise<entities.ElectionType[]> {
        return this.request('/election-types')
    }

    getElections(election_type: string): Promise<entities.Election[]> {
        return this.request('/elections', { election_type })
    }

    getElection(id: string): Promise<entities.Election> {
        return this.request(`/election-reports/election/${id}`)
    }

    async getElectionStats(id: string): Promise<entities.ElectionPollStats> {
        const irevStats = await this.request(`/elections/${id}/result/stats`)

        return {
            total: irevStats.pus,
            submitted: irevStats.documents
        }
    }

    getLGAsByState(election: string, state_id: number): Promise<LgaApiResult[]> {
        // TODO: Is this assertion worth it? 36 states + FCT
        if (state_id < 1 || state_id > 37) {
            throw new Error('State ID should be a number between 1 and 37 inclusive')
        }

        return this.request(`/elections/${election}/lga/state/${state_id}`)
    }

    getLGA(election: string, lga: string): Promise<LgaApiResult> {
        return this.request(`/elections/${election}/lga/${lga}`)
    }

    async getPollingUnitsByWard(election: string, ward: string): Promise<PUApiResult[]> {
        // For some reason this endpoint returns the full ward object instead of
        // just the string ID. So we filter it out here.
        const rawData = await this.request(`/elections/${election}/pus`, { ward })

        rawData.forEach((data: any) => {
            data.polling_unit = this.flattenPollingUnitWard(data.polling_unit)
        })

        return rawData
    }

    async getPollingUnit(election: string, polling_unit: string): Promise<PUApiResult> {
        const rawData = await this.request(`/elections/${election}/pu/${polling_unit}`)

        rawData.polling_unit = this.flattenPollingUnitWard(rawData.polling_unit)

        return rawData
    }

    private async request(path: string, queryParams?: { [key: string]: string }) {
        const authToken = sample(this.authTokens)
        const host = sample(this.hosts)
        const params = new URLSearchParams(queryParams)

        // TODO: Implement caching. Maybe just move this to network utils type thing?
        const response = await fetch(`${host}/api/v1${path}?${params}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'User-Agent': this.userAgent,
            },
            keepalive: true
        })

        if (response.ok) {
            const json = await response.json().catch((_) => {
                throw new IrevApiError(response)
            })

            if (json.success) {
                return json.data
            }

            throw new IrevApiError(response)
        }
        else {
            throw new IrevApiError(response)
        }
    }

    private flattenPollingUnitWard(pu: Omit<entities.PollingUnit, 'ward'> & { ward: entities.Ward }) {
        return {
            ...pu,
            ward: pu.ward._id,
        }
    }
}
