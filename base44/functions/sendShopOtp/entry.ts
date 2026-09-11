import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { generateCode, normalizePhone, isValidPhone, isValidEmail } from "../../shared/otp.ts";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const channel = body.channel;
    let value = (body.value || "").trim();

    if (channel === "email") {
      if (!value) value = user.email || "";
      if (!isValidEmail(value)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    } else if (channel === "phone") {
      value = normalizePhone(value);
      if (!isValidPhone(value)) return Response.json({ error: "Enter a valid phone number (01XXXXXXXXX)." }, { status: 400 });
    } else {
      return Response.json({ error: "Choose phone or email." }, { status: 400 });
    }

    // Rate limit: max 5 codes per target in 10 minutes
    const recent = await base44.asServiceRole.entities.OtpCode.filter({ target: value }, "-created_date", 50);
    const cutoff = Date.now() - 10 * 60 * 1000;
    const recentCount = recent.filter(r => r.created_date && new Date(r.created_date).getTime() > cutoff).length;
    if (recentCount >= 5) return Response.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429 });

    // Cleanup expired codes for this target
    try {
      await base44.asServiceRole.entities.OtpCode.deleteMany({ target: value, expires_at: { $lt: new Date().toISOString() } });
    } catch (e) { /* ignore */ }

    const code = generateCode();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await base44.asServiceRole.entities.OtpCode.create({ channel, target: value, code, expires_at, attempts: 0, used: false });

    if (channel === "email") {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: value,
        subject: "Your হাটবাজার shop verification code",
        body: `Your verification code is ${code}. It expires in 5 minutes. If you did not request this, you can ignore this email.`
      });
      return Response.json({ sent: true, channel, target: value, expires_at });
    }

    // Phone: no SMS provider connected → return code for on-screen display (demo mode)
    return Response.json({ sent: true, channel, target: value, expires_at, dev_code: code });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}