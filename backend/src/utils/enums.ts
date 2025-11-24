export const LOCATION_TYPES = [
  'Peri-Urban Highways',
  'Main Artery Road',
  'Public Trunk Road',
  'Community Access Road',
] as const;

export const SURFACE_AREA_BUCKETS = [
  '<2m2',
  '2m2-5m2',
  '5m2-10m2',
  '>10m2',
] as const;

export type LocationType = typeof LOCATION_TYPES[number];
export type SurfaceAreaBucket = typeof SURFACE_AREA_BUCKETS[number];

export function isValidLocationType(v: string): v is LocationType {
  return LOCATION_TYPES.includes(v as LocationType);
}

export function isValidSurfaceAreaBucket(v: string): v is SurfaceAreaBucket {
  return SURFACE_AREA_BUCKETS.includes(v as SurfaceAreaBucket);
}
