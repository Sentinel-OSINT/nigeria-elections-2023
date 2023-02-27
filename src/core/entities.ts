interface Entity {
    _id: string,
    created_at: string,
    updated_at: string,
}

interface Named {
    name: string,
    code: string,
}

export enum Status {
    Active = "ACTIVE"
}

export interface ElectionType extends Entity, Named {
    election_type_id: number,
}

export interface Election extends Entity {
    full_name: string,
    election_date: string,
    election_id: number,
    election_type: string,
    election_type_id: number,
}

export interface ElectionPollStats {
    total: number,
    submitted: number,
}

export interface State extends Entity, Named {
    state_id: number,
}

export interface LGA extends Entity, Named {
    lga_id: number,
    state: string,
    state_id: number,
}

export interface Ward extends Entity, Named {
    ward_id: number,
    old_name: string,
    state: string,
    state_id: number,
    lga: string,
    lga_id: number,
    state_constituency: string,
    state_constituency_id: number,
    federal_constituency: string,
    federal_constituency_id: number,
    senatorial_district: string,
    senatorial_district_id: number,
}

export interface PollingUnit extends Entity, Named {
    polling_unit_id: number,
    old_name: string,
    is_accredited: boolean,
    ward_id: number,
    ward: string,
    pu_code: string,
    pu_code_string: string,
    batch: number,
}

export interface Document {
    external: boolean,
    status: number,
    _id: string,
    size: number,
    url: string,
    updated_at: string,
}
