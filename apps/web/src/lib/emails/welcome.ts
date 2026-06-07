export interface WelcomeEmail {
  subject: string;
  html: string;
  text: string;
}

export function buildWelcomeEmail(): WelcomeEmail {
  const subject = "you're on the IntegrateAPI OS list.";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0a0a0a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fafafa;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;">
            <tr>
              <td style="padding:40px 40px 24px 40px;">
                <div style="font-family:ui-monospace,'SFMono-Regular',Menlo,monospace;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">
                  IntegrateAPI&nbsp;OS · waitlist
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px 8px 40px;">
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.01em;color:#0a0a0a;">
                  you're in.
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 40px 8px 40px;">
                <p style="margin:0;font-size:16px;line-height:1.6;color:#52525b;">
                  You'll get one email from us when:
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 40px 16px 40px;">
                <ul style="margin:0;padding:0 0 0 20px;font-size:16px;line-height:1.7;color:#0a0a0a;">
                  <li>The first desktop build ships.</li>
                  <li>The integration registry preview opens.</li>
                  <li>The public launch goes live.</li>
                </ul>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 40px 24px 40px;">
                <p style="margin:0;font-size:16px;line-height:1.6;color:#52525b;">
                  That's it. No marketing list resale, no newsletter, no tracking pixels.
                  Your email lives in our Resend audience and nowhere else.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px;">
                <div style="border-top:1px solid #e4e4e7;"></div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 40px 8px 40px;">
                <div style="font-family:ui-monospace,'SFMono-Regular',Menlo,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">
                  while you wait
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:4px 40px 24px 40px;">
                <p style="margin:0;font-size:15px;line-height:1.7;color:#0a0a0a;">
                  Build log on X: <a href="https://x.com/Integrateapi" style="color:#0a0a0a;text-decoration:underline;">@Integrateapi</a><br />
                  Source on GitHub: <a href="https://github.com/Reliathedisco/integrateapios" style="color:#0a0a0a;text-decoration:underline;">Reliathedisco/integrateapios</a><br />
                  Roadmap: <a href="https://github.com/Reliathedisco/integrateapios/blob/main/ROADMAP.md" style="color:#0a0a0a;text-decoration:underline;">github.com/.../ROADMAP.md</a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px 40px 40px;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:#71717a;">
                  Built by Reli (one person, in the open). Reply to this email if you want to share what you're trying to integrate — it shapes the registry.
                </p>
              </td>
            </tr>
          </table>

          <div style="max-width:560px;margin-top:16px;font-size:12px;line-height:1.5;color:#71717a;text-align:center;">
            You're getting this because you signed up at integrateapios.com.<br />
            Reli Music LLC · structure · restraint · depth
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "you're in.",
    "",
    "You'll get one email from us when:",
    "  • The first desktop build ships.",
    "  • The integration registry preview opens.",
    "  • The public launch goes live.",
    "",
    "That's it. No marketing list resale, no newsletter, no tracking pixels.",
    "Your email lives in our Resend audience and nowhere else.",
    "",
    "While you wait:",
    "  Build log on X     https://x.com/Integrateapi",
    "  Source on GitHub   https://github.com/Reliathedisco/integrateapios",
    "  Roadmap            https://github.com/Reliathedisco/integrateapios/blob/main/ROADMAP.md",
    "",
    "Built by Reli (one person, in the open). Reply to this email if you want",
    "to share what you're trying to integrate — it shapes the registry.",
    "",
    "—",
    "You're getting this because you signed up at integrateapios.com.",
    "Reli Music LLC",
  ].join("\n");

  return { subject, html, text };
}
