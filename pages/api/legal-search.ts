// /pages/api/legal-search.ts
// ✅ REAL eCourts Integration (Akshit API) + Smart Cache
// ✅ Indian Kanoon Search (Simulated Local DB)
// ⚠️ District Court CNRs only — High Court will say "Not Found"

interface SearchRequest {
  type: "kanoon" | "ecourts";
  query: string;
}

declare class Request {
  json(): Promise<any>;
  method: string;
}

const ecourtsCache: Record<string, any> = {};

const kanoonDatabase = [
  {
    caseName: "Kesavananda Bharati vs State Of Kerala And Anr",
    court: "Supreme Court of India",
    date: "24/04/1973",
    issue: "Basic Structure Doctrine",
    summary:
      "The Supreme Court held that Parliament cannot alter the basic structure of the Constitution."
  },
  {
    caseName: "Maneka Gandhi vs Union Of India",
    court: "Supreme Court of India",
    date: "25/01/1978",
    issue: "Article 21 - Right to Life & Liberty",
    summary:
      "The Court ruled that any law affecting life and liberty must be fair, just, and reasonable."
  }
];

// Response helper
class ResponseJson {
  static json(data: any, init?: { status?: number }) {
    return new Response(JSON.stringify(data), {
      status: init?.status ?? 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return ResponseJson.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  const { type, query }: SearchRequest = await req.json();

  if (!query?.trim()) {
    return ResponseJson.json({ error: "Query cannot be empty." }, { status: 400 });
  }

  // ✅ INDIAN KANOON SEARCH
  if (type === "kanoon") {
    const terms = query.toLowerCase().split(/\s+/);
    const results = kanoonDatabase.filter((c) =>
      terms.every((t) =>
        `${c.caseName} ${c.summary} ${c.issue}`.toLowerCase().includes(t)
      )
    );

    return ResponseJson.json({ results });
  }

  // ✅ REAL eCourts Case Status (District Courts Only)
  if (type === "ecourts") {
    const cnr = query.trim().toUpperCase();

    // Check cache
    if (ecourtsCache[cnr]) {
      return ResponseJson.json({ result: ecourtsCache[cnr], source: "cache" });
    }

    try {
      const apiRes = await fetch(
        "https://apis.akshit.net/eciapi/17/district-court/case",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cnr })
        }
      );

      const data = await apiRes.json();

      if (!data || data.error || Object.keys(data).length === 0) {
        return ResponseJson.json(
          {
            error:
              "No case found. If this CNR belongs to a High Court (like yours), we need to enable High Court mode."
          },
          { status: 404 }
        );
      }

      const result = {
        caseType: data.case_type ?? "N/A",
        caseStatus: data.case_status ?? "N/A",
        firstHearing: data.first_hearing_date ?? "N/A",
        nextHearing: data.next_hearing_date ?? "N/A",
        courtNumber: data.court_no ?? "N/A",
        judge: data.judge_name ?? "N/A"
      };

      ecourtsCache[cnr] = result;

      return ResponseJson.json({ result, source: "live" });

    } catch (e) {
      return ResponseJson.json(
        { error: "Court servers are busy. Try again in a moment." },
        { status: 500 }
      );
    }
  }

  return ResponseJson.json({ error: "Invalid search type." }, { status: 400 });
}
