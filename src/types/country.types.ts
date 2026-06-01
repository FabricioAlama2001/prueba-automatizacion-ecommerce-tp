export type Continent =
    | 'LATAM'
    | 'NORTH_AMERICA'
    | 'EUROPE'
    | 'OCEANIA';

export interface Country {
    name: string;
    isoCode: string;
    continent: Continent;
    phonePrefix: string;
    timezone: string;
}