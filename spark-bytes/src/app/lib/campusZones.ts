export const CAMPUS_ZONES = [
    {
      name: 'Charles River Campus',
      bounds: {
        latMin: 42.345,
        latMax: 42.355,
        lngMin: -71.115,
        lngMax: -71.090,
      },
    },
    {
      name: 'BU Medical Campus',
      bounds: {
        latMin: 42.332,
        latMax: 42.338,
        lngMin: -71.077,
        lngMax: -71.070,
      },
    },
    {
      name: 'Fenway Campus',
      bounds: {
        latMin: 42.336,
        latMax: 42.340,
        lngMin: -71.106,
        lngMax: -71.100,
      },
    },
  ];
  
  export function detectCampus(lat: number, lng: number): string {
    for (const campus of CAMPUS_ZONES) {
      const { latMin, latMax, lngMin, lngMax } = campus.bounds;
      if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
        return campus.name;
      }
    }
    return 'Other';
  }
  