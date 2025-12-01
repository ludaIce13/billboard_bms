import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Ensure we always load the backend .env file, even if machine env vars exist
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
});

const BASE_URL = process.env.REVMIS_API_URL || 'https://rev-mis-server.onrender.com/api/v1/bms';

// Debug: Log what we're actually reading
console.log('[REVMIS] Environment check:', {
  API_KEY_length: process.env.REVMIS_API_KEY?.length,
  API_KEY_prefix: process.env.REVMIS_API_KEY?.substring(0, 20),
  API_URL: process.env.REVMIS_API_URL,
  COUNCIL_ID: process.env.REVMIS_COUNCIL_ID,
});

function getHeaders() {
  const apiKey = process.env.REVMIS_API_KEY;
  if (!apiKey) {
    throw new Error('REVMIS_API_KEY not configured');
  }
  return {
    'X-API-KEY': apiKey,
  };
}

export interface RevmisCouncilResponse {
  success: boolean;
  message: string;
  data: Array<{ id: number; name: string }>;
}

export interface RevmisInvoiceCreatePayload {
  councilId: number;
  operatorId: string;
  operatorName: string;
  operatorAddress: string;
  operatorPhone: string;
  operatorEmail: string;
  invoiceDate: string; // YYYY-MM-DD
  licenseNo: string;
  locationTypes: string[];
  plusCodes: string[];
  surfaceAreas: string[];
  amount: number;
}

export async function fetchRevmisCouncils(): Promise<RevmisCouncilResponse> {
  if (!BASE_URL) {
    throw new Error('REVMIS_API_URL not configured');
  }
  const res = await axios.get(`${BASE_URL}/councils`, { headers: getHeaders() });
  return res.data as RevmisCouncilResponse;
}

export async function postInvoiceToRevmis(payload: RevmisInvoiceCreatePayload) {
  if (!BASE_URL) {
    throw new Error('REVMIS_API_URL not configured');
  }

  const body = {
    ...payload,
  };
  const url = `${BASE_URL}/invoices`;

  console.log('[REVMIS] Sending invoice to REV-MIS', {
    url,
    councilId: body.councilId,
    operatorId: body.operatorId,
    amount: body.amount,
  });

  try {
    const res = await axios.post(url, body, {
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
    });

    console.log('[REVMIS] Invoice sent successfully', {
      status: res.status,
      data: res.data,
    });

    return res.data;
  } catch (err: any) {
    if (err?.response) {
      console.error('[REVMIS] Error response from REV-MIS', {
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      console.error('[REVMIS] Failed to call REV-MIS', {
        message: err?.message,
      });
    }
    throw err;
  }
}

// Retain a helper used by the preview endpoint; it is now just a thin wrapper
// around the official invoice payload shape for local inspection.
export function buildRevmisInvoicePayload(data: Partial<RevmisInvoiceCreatePayload>): RevmisInvoiceCreatePayload {
  const today = new Date().toISOString().slice(0, 10);
  return {
    councilId: data.councilId ?? Number(process.env.REVMIS_COUNCIL_ID || 0),
    operatorId: data.operatorId || '',
    operatorName: data.operatorName || '',
    operatorAddress: data.operatorAddress || '',
    operatorPhone: data.operatorPhone || '',
    operatorEmail: data.operatorEmail || '',
    invoiceDate: data.invoiceDate || today,
    licenseNo: data.licenseNo || '',
    locationTypes: data.locationTypes || [],
    plusCodes: data.plusCodes || [],
    surfaceAreas: data.surfaceAreas || [],
    amount: typeof data.amount === 'number' ? data.amount : 0,
  };
}
