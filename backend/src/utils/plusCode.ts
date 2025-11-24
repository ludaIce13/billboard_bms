// Simple Plus Code / Open Location Code generator
// For production, consider using the official 'open-location-code' npm package

const CODE_ALPHABET = '23456789CFGHJMPQRVWX';
const CODE_LENGTH = 10;
const PAIR_CODE_LENGTH = 10;
const GRID_SIZE_DEGREES = 20;

/**
 * Generates a Plus Code (Open Location Code) from latitude and longitude
 * This is a simplified implementation. For production, use the official library.
 * @param lat Latitude (-90 to 90)
 * @param lng Longitude (-180 to 180)
 * @returns Plus Code string (e.g., "7Q8V+2W")
 */
export function generatePlusCode(lat: number, lng: number): string {
  // Normalize coordinates
  let normalizedLat = Math.max(-90, Math.min(90, lat));
  let normalizedLng = ((lng + 180) % 360) - 180;

  // Adjust to 0-based scale
  const latScale = (normalizedLat + 90) / 180;
  const lngScale = (normalizedLng + 180) / 360;

  let code = '';

  // Generate first 8 characters (4 pairs) - increasingly fine resolution
  let latValue = latScale;
  let lngValue = lngScale;
  
  for (let i = 0; i < 4; i++) {
    const divisor = Math.pow(GRID_SIZE_DEGREES, 4 - i);
    
    const latIndex = Math.floor(latValue * GRID_SIZE_DEGREES);
    const lngIndex = Math.floor(lngValue * GRID_SIZE_DEGREES);
    
    code += CODE_ALPHABET[lngIndex];
    code += CODE_ALPHABET[latIndex];
    
    latValue = (latValue * GRID_SIZE_DEGREES) % 1;
    lngValue = (lngValue * GRID_SIZE_DEGREES) % 1;
  }

  // Add separator
  code = code.slice(0, 4) + code.slice(4, 6) + '+' + code.slice(6);

  return code;
}

/**
 * Validates if a string looks like a Plus Code
 * @param code Plus Code string to validate
 * @returns true if valid format
 */
export function isValidPlusCode(code: string): boolean {
  // Basic format check: 4-6 chars + '+' + 2-3 chars
  const plusCodeRegex = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}$/;
  return plusCodeRegex.test(code);
}
