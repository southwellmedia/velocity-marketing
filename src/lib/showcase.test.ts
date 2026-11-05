import { describe, expect, it } from 'vitest';
import { buildSubmissionEmail, submissionSchema } from './showcase';

const valid = {
  siteUrl: 'https://example.com',
  siteName: 'Example',
  name: 'Ana Lima',
  email: 'ana@example.com',
  permission: 'on',
};

const fields = (input: unknown) => {
  const result = submissionSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
};

describe('submissionSchema', () => {
  it('accepts a complete submission', () => {
    expect(fields(valid)).toEqual([]);
  });

  it('rejects links that are not web addresses', () => {
    expect(fields({ ...valid, siteUrl: 'javascript:alert(1)' })).toContain('siteUrl');
    expect(fields({ ...valid, siteUrl: 'example.com' })).toContain('siteUrl');
  });

  it('requires permission and a real email', () => {
    expect(fields({ ...valid, permission: undefined })).toContain('permission');
    expect(fields({ ...valid, email: 'nope' })).toContain('email');
  });
});

describe('buildSubmissionEmail', () => {
  it('replies to the submitter and sends plain text only', () => {
    const email = buildSubmissionEmail(submissionSchema.parse(valid), 'from@x.co', 'to@x.co');
    expect(email.reply_to).toBe('ana@example.com');
    expect(email.to).toEqual(['to@x.co']);
    expect(email).not.toHaveProperty('html');
    expect(email.text).toContain('https://example.com');
  });

  it('keeps line breaks out of the subject', () => {
    const data = submissionSchema.parse({ ...valid, siteName: 'Example\r\nBcc: x@y.co' });
    expect(buildSubmissionEmail(data, 'a@x.co', 'b@x.co').subject).not.toMatch(/[\r\n]/);
  });
});
