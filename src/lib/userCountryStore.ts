export interface UserCountryData {
  countryCode: string;
  countryName: string;
}

const globalCountryStore = globalThis as unknown as {
  __userCountries?: Map<string, UserCountryData>;
};

if (!globalCountryStore.__userCountries) {
  globalCountryStore.__userCountries = new Map<string, UserCountryData>();
}

export function setUserCountry(userId: string, data: UserCountryData): void {
  globalCountryStore.__userCountries!.set(userId, {
    countryCode: data.countryCode.toUpperCase().trim(),
    countryName: data.countryName.trim(),
  });
}

export function getUserCountry(userId: string): UserCountryData | null {
  return globalCountryStore.__userCountries!.get(userId) || null;
}