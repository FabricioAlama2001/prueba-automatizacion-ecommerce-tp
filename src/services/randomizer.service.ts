import { Country } from '../types/country.types';
import { COUNTRIES } from '../../config/test-data/countries.data';
import { getBooleanEnv, getOptionalEnv } from '../utils/env.util';

export class RandomizerService {
    getRandomCountry(): Country {
        const isRandomEnabled = getBooleanEnv('COUNTRY_RANDOM_ENABLED', true);
        const defaultCountryName = getOptionalEnv('COUNTRY_DEFAULT', 'Ecuador');

        if (!isRandomEnabled) {
            return this.getCountryByName(defaultCountryName);
        }

        const randomIndex = Math.floor(Math.random() * COUNTRIES.length);
        return COUNTRIES[randomIndex];
    }

    getCountryByName(countryName: string): Country {
        const country = COUNTRIES.find(
            (item) => item.name.toLowerCase() === countryName.toLowerCase(),
        );

        if (!country) {
            throw new Error(`Country not found in test catalog: ${countryName}`);
        }

        return country;
    }
}