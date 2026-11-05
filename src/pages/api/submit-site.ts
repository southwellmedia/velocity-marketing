import type { APIRoute } from 'astro';
import { RESEND_API_KEY, SHOWCASE_EMAIL_FROM, SHOWCASE_EMAIL_TO } from 'astro:env/server';
import { buildSubmissionEmail, submissionSchema } from '@/lib/showcase';

// The one page that runs on the server. Everything else stays prerendered.
export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData().catch(() => null);
  if (!form) return json({ success: false, error: 'Please try again.' }, 400);

  // Bots fill this hidden field. Report success so they don't retry.
  if (form.get('company')) return json({ success: true });

  const result = submissionSchema.safeParse({
    siteUrl: form.get('siteUrl')?.toString().trim(),
    siteName: form.get('siteName')?.toString(),
    name: form.get('name')?.toString(),
    email: form.get('email')?.toString().trim(),
    notes: form.get('notes')?.toString() || undefined,
    permission: form.get('permission')?.toString(),
  });

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0]);
      errors[field] ??= issue.message;
    }
    return json({ success: false, errors }, 400);
  }

  if (!RESEND_API_KEY) {
    console.error('[submit-site] RESEND_API_KEY is not set');
    return json({ success: false, error: 'Submissions are unavailable right now.' }, 503);
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildSubmissionEmail(result.data, SHOWCASE_EMAIL_FROM, SHOWCASE_EMAIL_TO)),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error('[submit-site] Resend returned', response.status, await response.text());
      return json({ success: false, error: 'Something went wrong. Please try again.' }, 502);
    }
    return json({ success: true });
  } catch (error) {
    console.error('[submit-site] Request failed', error);
    return json({ success: false, error: 'Something went wrong. Please try again.' }, 502);
  }
};
