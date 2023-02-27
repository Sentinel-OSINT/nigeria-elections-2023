import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'
import { IrevHttpApi } from './services/irev_api'

dotenv.config()

/**
 * "State" 15 is FCT. Just testing by writing it out to a file.
 * 
 * Should move this to an actual test module.
 */
async function testFCT() {
    const api = new IrevHttpApi({ authTokens: [process.env.IREV_AUTH_TOKEN!] })
    const electionTypes = await api.getElectionTypes()
    const presidential = electionTypes.find((type) => type.code === 'PRES')

    if (!presidential) throw new Error('Presidential election type not found')

    const elections = await api.getElections(presidential._id)
    const election = elections[0]
    const stateResponse = await api.getLGAsByState(election._id, 15)

    const cacheDir = path.join('.cache', stateResponse[0].state._id)
    fs.mkdirSync(cacheDir, { recursive: true })

    for (let lgaResponse of stateResponse) {
        const file = path.join(cacheDir, lgaResponse.lga._id)

        fs.writeFileSync(file, JSON.stringify(lgaResponse, undefined, 4))
    }
}

testFCT().catch((err) => console.error(err))
