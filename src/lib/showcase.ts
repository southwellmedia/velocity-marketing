import { z } from 'astro/zod';

/** Field values come straight from the form, so everything is checked here. */
export const submissionSchema = z.object({
  siteUrl: z
    .url('Enter the full URL, starting with https://')
    .max(300)
    .refine((value) => /^https?:\/\//i.test(value), 'Enter the full URL, starting with https://'),
  siteName: z.string().trim().min(2, 'Enter the name of your site').max(100),
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.email('Enter a valid email address').max(200),
  notes: z.string().trim().max(1000, 'Keep your note under 1,000 characters').optional(),
  permission: z.literal('on', { error: 'Confirm we can feature your site' }),
});

export type Submission = z.infer<typeof submissionSchema>;

/** The Resend request body. Plain text only, so nothing submitted can inject markup. */
export function buildSubmissionEmail(submission: Submission, from: string, to: string) {
  const { siteUrl, siteName, name, email, notes } = submission;
  return {
    from,
    to: [to],
    reply_to: email,
    subject: `Showcase submission: ${siteName.replace(/[\r\n]+/g, ' ')}`,
    text: [
      `Site: ${siteName}`,
      `URL: ${siteUrl}`,
      `From: ${name} <${email}>`,
      '',
      notes || 'No note added.',
      '',
      'They confirmed we can feature this site with a screenshot and a credit.',
    ].join('\n'),
  };
}
