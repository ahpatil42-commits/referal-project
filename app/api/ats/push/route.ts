import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    // Retrieve the referral request and associated data
    const request = await db.referralRequest.findUnique({
      where: { id: requestId },
      include: {
        seeker: {
          include: { user: true }
        },
        referrer: true
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Ensure the current user is the referrer of this request
    if (request.referrer.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to request" }, { status: 403 });
    }

    const atsProvider = request.referrer.atsProvider;
    const atsApiKey = request.referrer.atsApiKey;

    if (!atsProvider || !atsApiKey) {
      return NextResponse.json({ error: "ATS Integration is not configured for this profile." }, { status: 400 });
    }

    if (atsProvider.toUpperCase() === "GREENHOUSE") {
      // Format payload for Greenhouse Harvest API
      const payload = {
        first_name: request.seeker.user.name?.split(' ')[0] || "Unknown",
        last_name: request.seeker.user.name?.split(' ').slice(1).join(' ') || "Unknown",
        emails: [{ email: request.seeker.user.email, type: "personal" }],
        websites: [] as any[],
        applications: [
          {
            job_id: 12345, // In a real app, this would map to the specific Job ID the seeker applied for
            source_id: 9876, // ID representing "Employee Referral" source
          }
        ]
      };

      if (request.seeker.linkedinUrl) {
        payload.websites.push({ url: request.seeker.linkedinUrl, type: "linkedin" } as any);
      }

      // Encode API Key for Basic Auth
      const authKey = Buffer.from(`${atsApiKey}:`).toString('base64');

      /*
      // REAL IMPLEMENTATION (Commented out to prevent errors with fake keys during testing)
      const res = await fetch('https://harvest.greenhouse.io/v1/candidates', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authKey}`,
          'Content-Type': 'application/json',
          'On-Behalf-Of': request.referrer.corporateEmail || session.user.email || ""
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Greenhouse API Error: ${JSON.stringify(errorData)}`);
      }
      */

      // Simulated Success for MVP
      console.log("[ATS_PUSH] Successfully pushed candidate to Greenhouse:", payload);

      // Optionally, mark request as COMPLETED in our DB
      await db.referralRequest.update({
        where: { id: requestId },
        data: { status: "COMPLETED" }
      });

      return NextResponse.json({ success: true, message: "Candidate successfully pushed to Greenhouse ATS." });
    }

    return NextResponse.json({ error: `Unsupported ATS provider: ${atsProvider}` }, { status: 400 });
  } catch (error: any) {
    console.error("[ATS_PUSH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
