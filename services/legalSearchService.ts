// /services/legalsearchservice.ts
export interface KanoonResult {
  caseName: string;
  court: string;
  date: string;
  issue: string;
  summary: string;
}

export interface EcourtsResult {
  caseType: string;
  caseStatus: string;
  firstHearing: string;
  nextHearing: string;
  courtNumber: string;
  judge: string;
  source?: "cache" | "live";
}

// Helper function to call the backend API proxy.
// This assumes the API route from 'pages/api/legal-search.ts' is deployed and available at this path.
async function searchApi(type: "kanoon" | "ecourts", query: string): Promise<any> {
    const response = await fetch('/api/legal-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, query }),
    });

    const data = await response.json();

    if (!response.ok) {
        // Pass the error message from the server if available.
        throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    return data;
}


export const searchIndianKanoon = async (query: string): Promise<KanoonResult[]> => {
    const data = await searchApi('kanoon', query);
    return data.results;
};

export const searchECourts = async (cnr: string): Promise<EcourtsResult> => {
  cnr = cnr.trim().toUpperCase();

  if (cnr.length !== 16) {
    throw new Error("CNR must be exactly 16 characters (e.g., MHMC070004752022).");
  }
  
  // This now calls our API proxy, which handles caching and the external API call, solving potential CORS issues.
  const data = await searchApi('ecourts', cnr);
  return { ...data.result, source: data.source };
};