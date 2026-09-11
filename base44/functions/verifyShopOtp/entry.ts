import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { normalizePhone } from "../../shared/otp.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const channel = body.channel;
    let value = (body.value || "").trim();
    const code = (body.code || "").trim();
    if (!code) return Response.json({ error: "Enter the 6-digit code." }, { status: 400 });

    if (channel === "phone") value = normalizePhone(value);
    else if (channel !== "email") return Response.json({ error: "Invalid channel." }, { status: 400 });

    const records = await base44.asServiceRole.entities.OtpCode.filter({ target: value }, "-created_date", 10);
    const latest = records.find(r => !r.used);
    if (!latest) return Response.json({ error: "No active code. Request a new one." }, { status: 400 });
    if (new Date(latest.expires_at).getTime() < Date.now()) return Response.json({ error: "Code expired. Request a new one." }, { status: 400 });
    if ((latest.attempts || 0) >= 5) return Response.json({ error: "Too many attempts. Request a new code." }, { status: 400 });

    if (latest.code !== code) {
      await base44.asServiceRole.entities.OtpCode.update(latest.id, { attempts: (latest.attempts || 0) + 1 });
      return Response.json({ error: "Wrong code. Try again." }, { status: 400 });
    }

    await base44.asServiceRole.entities.OtpCode.update(latest.id, { used: true });
    return Response.json({ verified: true, channel, target: value });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}