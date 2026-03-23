import Link from 'next/link';

export const metadata = {
  title: 'الاتفاقيات والسياسات | دريبدو',
  description: 'كل الاتفاقيات والسياسات التي تنظم استخدام دريبدو، من الاستخدام والمحتوى إلى الخصوصية والأمان.',
  alternates: { canonical: '/agreements' },
};

const lastUpdated = new Intl.DateTimeFormat('ar-MA', { dateStyle: 'long' }).format(new Date());

function Icon({ name, className = 'h-5 w-5' }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    className,
  };

  switch (name) {
    case 'document':
      return (
        <svg {...commonProps}>
          <path d="M6 3h7l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M13 3v4h4" />
          <path d="M9 11h6" />
          <path d="M9 15h6" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...commonProps}>
          <path d="M12 3c3.866 0 7 3.134 7 7 0 4.636-3.921 9.643-6.17 12.221a1 1 0 0 1-1.66 0C8.921 19.643 5 14.636 5 10c0-3.866 3.134-7 7-7z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...commonProps}>
          <path d="M12 3 4 6v5c0 5.25 3.5 9.75 8 10 4.5-.25 8-4.75 8-10V6z" />
          <path d="M12 11v6" />
          <path d="M8 13h8" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...commonProps}>
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <path d="M4 9l8 6 8-6" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...commonProps}>
          <path d="M7 5h2l1 4-2 2a11 11 0 0 0 5 5l2-2 4 1v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
        </svg>
      );
    default:
      return null;
  }
}

function Section({ number, title, children }) {
  return (
    <section className="rounded-3xl border border-gray-200/60 bg-white/80 px-6 py-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-400">{number}</span>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
}

function SubSection({ label, title, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-red-600">{label}</span>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">{title}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function NotePanel({ title, children }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-dashed border-gray-300/90 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-white/5">
      <Icon name="pin" className="h-6 w-6 text-red-600" />
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white">{title}</p>
        <div className="text-sm text-gray-600 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
}

export default function AgreementsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <Icon name="document" className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-600">Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠØ§Øª ÙˆØ§Ù„Ø³ÙŠØ§Ø³Ø§Øª</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">ÙƒÙ„ Ù…Ø§ ØªØ­ØªØ§Ø¬ Ù…Ø¹Ø±ÙØªÙ‡ Ù‚Ø¨Ù„ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¯Ø±ÙŠØ¨Ø¯Ùˆ</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: {lastUpdated}</p>
          <p className="max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300">
            Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© ØªØ¬Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠØ§Øª ÙˆØ§Ù„Ø³ÙŠØ§Ø³Ø§Øª Ø§Ù„ØªÙŠ ØªØ­ÙƒÙ… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…Ù†ØµØ© Ø¯Ø±ÙŠØ¨Ø¯Ùˆ. Ø§Ù„Ù‡Ø¯Ù Ù…Ù†Ù‡Ø§ Ù‡Ùˆ ØªÙˆØ¶ÙŠØ­ Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø¹Ø§Ù…Ø© Ø§Ù„ØªÙŠ ÙŠØ¹ØªÙ…Ø¯
            Ø¹Ù„ÙŠÙ‡Ø§ Ø§Ù„Ù†Ø¸Ø§Ù… Ù„Ø¶Ù…Ø§Ù† ØªØ¬Ø±Ø¨Ø© Ù…Ø³ØªÙ‚Ø±Ø©ØŒ Ø¢Ù…Ù†Ø©ØŒ ÙˆØ¹Ø§Ø¯Ù„Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300">
            Ø¯Ø±ÙŠØ¨Ø¯Ùˆ Ù„ÙŠØ³ Ù…Ø¬Ø±Ø¯ ØªØ·Ø¨ÙŠÙ‚ØŒ Ø¨Ù„ Ù†Ø¸Ø§Ù… Ù…ØªÙƒØ§Ù…Ù„ ÙÙŠÙ‡ ØªÙØ§Ø¹Ù„ØŒ Ù…Ø­ØªÙˆÙ‰ØŒ ÙˆØ¨ÙŠØ§Ù†Ø§ØªØŒ Ù„Ø°Ù„Ùƒ ØªÙ… ÙˆØ¶Ø¹ Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠØ§Ø³Ø§Øª Ù„ØªÙ†Ø¸ÙŠÙ… ÙƒÙ„ Ù‡Ø°Ù‡ Ø§Ù„Ø¬ÙˆØ§Ù†Ø¨ Ø¨Ø´ÙƒÙ„ ÙˆØ§Ø¶Ø­.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <Section number="1." title="Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©">
            <p className="text-gray-700 dark:text-gray-300">
              Ù…Ù„ÙØ§Øª Ø§Ù„Ø§ØªÙØ§Ù‚ÙŠØ§Øª ÙˆØ§Ù„Ø³ÙŠØ§Ø³Ø§Øª ØªØ¬Ù…Ø¹ Ø§Ù„Ù…ØªØ·Ù„Ø¨Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ÙˆØ§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØ© Ù„Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙˆØ§Ù„Ø§Ù‚ØªØµØ§Ø¯ Ø§Ù„Ø±Ù‚Ù…ÙŠ Ù„Ø¯Ø±ÙŠØ¨Ø¯Ùˆ.
            </p>
          </Section>

          <Section number="2." title="Ø§ØªÙØ§Ù‚ÙŠØ© Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù†ØµØ©">
            <BulletList
              items={[
                'Ø§Ø­ØªØ±Ø§Ù… Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ù…Ø¹Ù…ÙˆÙ„ Ø¨Ù‡Ø§',
                'Ø¹Ø¯Ù… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù†ØµØ© Ù„Ø£ØºØ±Ø§Ø¶ Ø¶Ø§Ø±Ø© Ø£Ùˆ ØºÙŠØ± Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©',
                'Ø¹Ø¯Ù… Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ø³ØªØºÙ„Ø§Ù„ Ø§Ù„Ù†Ø¸Ø§Ù… Ø£Ùˆ Ø§Ù„ØªÙ„Ø§Ø¹Ø¨ Ø¨Ù‡',
              ]}
            />
            <NotePanel title="ØªÙ†Ø¨ÙŠÙ‡ Ø­ÙˆÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨">
              Ø£ÙŠ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø®Ø§Ø±Ø¬ Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø·Ø§Ø± Ù‚Ø¯ ÙŠØ¤Ø¯ÙŠ Ø¥Ù„Ù‰ ØªÙ‚ÙŠÙŠØ¯ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø£Ùˆ Ø¥ÙŠÙ‚Ø§ÙÙ‡.
            </NotePanel>
          </Section>

          <Section number="3." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰">
            <SubSection label="3.1" title="Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø³Ù…ÙˆØ­">
              <BulletList
                items={['Ù…Ù†Ø´ÙˆØ±Ø§Øª Ù†ØµÙŠØ©', 'ØµÙˆØ± ÙˆÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª', 'Ù…Ø­ØªÙˆÙ‰ ØªØ±ÙÙŠÙ‡ÙŠ Ø£Ùˆ ØªØ¹Ù„ÙŠÙ…ÙŠ', 'Ø¢Ø±Ø§Ø¡ Ø´Ø®ØµÙŠØ©']}
              />
            </SubSection>
            <SubSection label="3.2" title="Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ØºÙŠØ± Ø§Ù„Ù…Ø³Ù…ÙˆØ­">
              <BulletList
                items={[
                  'Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø®Ø§Ù„Ù Ù„Ù„Ù‚Ø§Ù†ÙˆÙ†',
                  'Ø§Ù„ØªØ­Ø±ÙŠØ¶ Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ù†Ù Ø£Ùˆ Ø§Ù„ÙƒØ±Ø§Ù‡ÙŠØ©',
                  'Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø¶Ù„Ù„ Ø£Ùˆ Ø§Ù„Ù…Ø²ÙŠÙ',
                  'Ø§Ù†ØªÙ‡Ø§Ùƒ Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ø¢Ø®Ø±ÙŠÙ†',
                ]}
              />
            </SubSection>
            <SubSection label="3.3" title="Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰">
              <BulletList
                items={[
                  'ÙŠÙ…ÙƒÙ† Ù„Ù„Ù†Ø¸Ø§Ù… Ø£Ùˆ ÙØ±ÙŠÙ‚ Ø§Ù„Ø¥Ø´Ø±Ø§Ù Ø­Ø°Ù Ø£ÙŠ Ù…Ø­ØªÙˆÙ‰ Ù…Ø®Ø§Ù„Ù',
                  'Ø¨Ø¹Ø¶ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù‚Ø¯ ÙŠØªÙ… ØªÙ‚Ù„ÙŠØµ Ø§Ù†ØªØ´Ø§Ø±Ù‡ Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù† Ø­Ø°ÙÙ‡',
                  'ÙŠÙ…ÙƒÙ† Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø£ÙŠ Ù…Ø­ØªÙˆÙ‰',
                ]}
              />
            </SubSection>
          </Section>

          <Section number="4." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ù†Ø´Ø±">
            <BulletList
              items={[
                'ØªÙ… ØªØµÙ…ÙŠÙ… Ù†Ø¸Ø§Ù… Ø§Ù„Ù†Ø´Ø± ÙÙŠ Ø¯Ø±ÙŠØ¨Ø¯Ùˆ Ù„ÙŠÙƒÙˆÙ† Ù…Ø±Ù†: ÙŠÙ…ÙƒÙ†Ùƒ Ù†Ø´Ø± ØµÙˆØ±ØŒ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§ØªØŒ GIFØŒ ÙˆØ§Ø³ØªØ·Ù„Ø§Ø¹Ø§Øª',
                'ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¥Ø´Ø§Ø±Ø© Ø¥Ù„Ù‰ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø£Ùˆ Ø¥Ø¶Ø§ÙØ© Ù…ÙˆÙ‚Ø¹',
                'ÙŠÙ…ÙƒÙ†Ùƒ ØªÙ…ÙŠÙŠØ² Ø§Ù„Ù…Ù†Ø´ÙˆØ±Ø§Øª (Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ / Ù…Ø­ØªÙˆÙ‰ Ø­Ø³Ø§Ø³)',
              ]}
            />
            <NotePanel title="Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ©">
              Ø£ÙŠ Ù…Ù†Ø´ÙˆØ± ØªÙ‚ÙˆÙ… Ø¨Ù‡ Ù‡Ùˆ Ù…Ø³Ø¤ÙˆÙ„ÙŠØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ©.
            </NotePanel>
          </Section>

          <Section number="5." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„ØªÙØ§Ø¹Ù„">
            <SubSection label="5.1" title="Ø§Ù„ØªÙØ§Ø¹Ù„ Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„">
              <BulletList
                items={['Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª Ø§Ù„Ù…Ø­ØªØ±Ù…Ø©', 'Ø§Ù„Ù†Ù‚Ø§Ø´ Ø§Ù„Ø¨Ù†Ø§Ø¡', 'Ø§Ù„ØªÙØ§Ø¹Ù„ Ø§Ù„Ø¥ÙŠØ¬Ø§Ø¨ÙŠ']}
              />
            </SubSection>
            <SubSection label="5.2" title="Ø§Ù„ØªÙØ§Ø¹Ù„ ØºÙŠØ± Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„">
              <BulletList
                items={['Ø§Ù„Ø³Ø¨ Ø£Ùˆ Ø§Ù„Ø¥Ù‡Ø§Ù†Ø©', 'Ø§Ù„ØªØ­Ø±Ø´ Ø£Ùˆ Ø§Ù„Ù…Ø¶Ø§ÙŠÙ‚Ø©', 'Ù†Ø´Ø± Ø±ÙˆØ§Ø¨Ø· Ù…Ø²Ø¹Ø¬Ø© (Spam)']}
              />
            </SubSection>
            <NotePanel title="Ø¹Ù‚ÙˆØ¨Ø§Øª Ø§Ù„Ø³Ù„ÙˆÙƒ ØºÙŠØ± Ø§Ù„Ù…Ù‚Ø¨ÙˆÙ„">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Ø­Ø¸Ø± Ù…Ø¤Ù‚Øª</li>
                <li>Ø­Ø¸Ø± Ø¯Ø§Ø¦Ù…</li>
              </ul>
            </NotePanel>
          </Section>

          <Section number="6." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª">
            <SubSection label="6.1" title="Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ø¨Ù‡Ø§">
              <BulletList items={['Ø­Ø³Ø§Ø¨ Ø´Ø®ØµÙŠ Ø­Ù‚ÙŠÙ‚ÙŠ', 'Ø­Ø³Ø§Ø¨ Ù„Ù…Ø´Ø±ÙˆØ¹ Ø£Ùˆ Ù‚Ù†Ø§Ø©']} />
            </SubSection>
            <SubSection label="6.2" title="Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ØºÙŠØ± Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ø¨Ù‡Ø§">
              <BulletList
                items={['Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„ÙˆÙ‡Ù…ÙŠØ© Ø£Ùˆ Ø§Ù„Ù…Ø²ÙŠÙØ©', 'Ø§Ù†ØªØ­Ø§Ù„ Ø´Ø®ØµÙŠØ© Ø´Ø®Øµ Ø¢Ø®Ø±', 'Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ø¢Ù„ÙŠØ© (Bots) Ø¨Ø¯ÙˆÙ† ØªØµØ±ÙŠØ­']}
              />
            </SubSection>
            <SubSection label="6.3" title="Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø­Ø³Ø§Ø¨">
              <BulletList
                items={['ÙŠØ­Ù‚ Ù„Ø¯Ø±ÙŠØ¨Ø¯Ùˆ ØªØ¹Ù„ÙŠÙ‚ Ø§Ù„Ø­Ø³Ø§Ø¨', 'Ø­Ø°ÙÙ‡', 'ØªÙ‚ÙŠÙŠØ¯ Ø¨Ø¹Ø¶ Ø§Ù„Ù…ÙŠØ²Ø§Øª']}
              />
            </SubSection>
          </Section>

          <Section number="7." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ© (Ù…Ù„Ø®Øµ)">
            <BulletList
              items={['Ù†Ø­ØªØ±Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†', 'Ù„Ø§ Ù†Ø¨ÙŠØ¹ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù„Ø£ÙŠ Ø¬Ù‡Ø©', 'ÙŠØªÙ… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙÙ‚Ø· Ù„ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø®Ø¯Ù…Ø©']}
            />
            <NotePanel title="Ø§Ù„Ù…Ø²ÙŠØ¯">
              Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ù…ÙˆØ¬ÙˆØ¯Ø© ÙÙŠ ØµÙØ­Ø©{' '}
              <Link className="font-semibold text-red-600 hover:underline" href="/privacy">
                Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©
              </Link>
              .
            </NotePanel>
          </Section>

          <Section number="8." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø£Ù…Ø§Ù†">
            <BulletList
              items={['Ø­Ù…Ø§ÙŠØ© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„', 'Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ø£Ù†Ø´Ø·Ø© Ø§Ù„Ù…Ø´Ø¨ÙˆÙ‡Ø©', 'ØªÙ‚Ù„ÙŠÙ„ Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„Ø§Ø®ØªØ±Ø§Ù‚']}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ù„ÙƒÙ†: Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù†Ø¸Ø§Ù… Ø¢Ù…Ù† Ø¨Ù†Ø³Ø¨Ø© 100%ØŒ Ù„Ø°Ù„Ùƒ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¤ÙˆÙ„ Ø£ÙŠØ¶Ø§Ù‹ Ø¹Ù† Ø­Ù…Ø§ÙŠØ© Ø­Ø³Ø§Ø¨Ù‡.
            </p>
          </Section>

          <Section number="9." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø­Ø¸Ø± ÙˆØ§Ù„Ø¥Ø¨Ù„Ø§Øº">
            <BulletList
              items={['Ø­Ø¸Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†', 'Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø§Ù„Ù…Ø­ØªÙˆÙ‰', 'Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ù…Ù†Ø´ÙˆØ±Ø§Øª']}
            />
            <NotePanel title="Ø¹Ù†Ø¯ Ø§Ù„Ø¥Ø¨Ù„Ø§Øº">
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>ÙŠØªÙ… Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø­Ø§Ù„Ø©</li>
                <li>Ø§ØªØ®Ø§Ø° Ø§Ù„Ù‚Ø±Ø§Ø± Ø­Ø³Ø¨ Ø§Ù„Ù…Ø®Ø§Ù„ÙØ©</li>
              </ul>
            </NotePanel>
          </Section>

          <Section number="10." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ù‚Ù†ÙˆØ§Øª ÙˆØ§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª">
            <SubSection label="Ø§Ù„Ù‚Ù†ÙˆØ§Øª" title="Ù†ÙˆØ¹ Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…">
              <BulletList
                items={['Ù…Ø®ØµØµØ© Ù„ØµÙ†Ø§Ø¹ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙˆØ§Ù„Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©', 'ÙŠØ¬Ø¨ Ø§Ø­ØªØ±Ø§Ù… Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ù†Ø´Ø±']}
              />
            </SubSection>
            <SubSection label="Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª" title="Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø¬ØªÙ…Ø¹">
              <BulletList
                items={['ÙŠÙ…ÙƒÙ† Ø¥Ù†Ø´Ø§Ø¤Ù‡Ø§ Ø¨Ø­Ø±ÙŠØ©', 'ØµØ§Ø­Ø¨ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© Ù…Ø³Ø¤ÙˆÙ„ Ø¹Ù† Ø¥Ø¯Ø§Ø±ØªÙ‡Ø§']}
              />
            </SubSection>
          </Section>

          <Section number="11." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„ÙÙŠØ¯ÙŠÙˆ ÙˆØ§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø±Ø¦ÙŠ">
            <BulletList
              items={[
                'Ø¹Ø±Ø¶ Ø§Ù„ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª ÙŠØªÙ… Ø¨Ø´ÙƒÙ„ Ù…Ù†Ø¸Ù… (Feed + ØªØ³Ù„Ø³Ù„ÙŠ)',
                'ÙŠÙ…Ù†Ø¹ Ù†Ø´Ø± ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ù…Ø®Ø§Ù„ÙØ©',
                'ÙŠÙ…ÙƒÙ† ØªÙ‚ÙŠÙŠØ¯ Ø£Ùˆ Ø­Ø°Ù Ø§Ù„ÙÙŠØ¯ÙŠÙˆ',
              ]}
            />
          </Section>

          <Section number="12." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª">
            <BulletList
              items={['ÙŠØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø¥Ø´Ø¹Ø§Ø±Ø§Øª Ù„Ù„ØªÙØ§Ø¹Ù„Ø§Øª ÙˆØ§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª', 'ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ­ÙƒÙ… ÙÙŠÙ‡Ø§ Ù…Ù† Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª']}
            />
          </Section>

          <Section number="13." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª">
            <BulletList
              items={[
                'Ø¯Ø±ÙŠØ¨Ø¯Ùˆ Ù‚Ø¯ ÙŠØ¶ÙŠÙ Ø£Ùˆ ÙŠØºÙŠØ± Ù…ÙŠØ²Ø§Øª ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª',
                'ÙŠØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø³ÙŠØ§Ø³Ø§Øª Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ø¬Ø©',
                'Ø§Ø³ØªÙ…Ø±Ø§Ø± Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… ÙŠØ¹Ù†ÙŠ Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©',
              ]}
            />
          </Section>

          <Section number="14." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©">
            <BulletList
              items={['Ù‚Ø¯ ÙŠØ¹ØªÙ…Ø¯ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù„Ù‰ Ø®Ø¯Ù…Ø§Øª Ù…Ø«Ù„ Ø§Ù„ØªØ®Ø²ÙŠÙ† ÙˆØ§Ù„Ø­Ù…Ø§ÙŠØ©']}
            />
            <NotePanel title="Ø­Ø¯ÙˆØ¯ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ©">
              Ù„ÙƒÙ† Ø¨Ø¯ÙˆÙ† Ù…Ø´Ø§Ø±ÙƒØ© Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± Ø¶Ø±ÙˆØ±ÙŠØ©.
            </NotePanel>
          </Section>

          <Section number="15." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø£Ø¯Ø§Ø¡ ÙˆØ§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¹Ø§Ø¯Ù„">
            <BulletList
              items={['ÙŠÙ…Ù†Ø¹ Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…ÙØ±Ø· Ø£Ùˆ ØºÙŠØ± Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠ', 'ÙŠÙ…Ù†Ø¹ Ø§Ø³ØªØºÙ„Ø§Ù„ Ø§Ù„Ø«ØºØ±Ø§Øª', 'ÙŠØªÙ… Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø¨Ø´ÙƒÙ„ Ø¹Ø§Ù…']}
            />
          </Section>

          <Section number="16." title="Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©">
            <BulletList
              items={[
                'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¤ÙˆÙ„ Ø¹Ù† Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø°ÙŠ ÙŠÙ†Ø´Ø±Ù‡',
                'Ø¯Ø±ÙŠØ¨Ø¯Ùˆ ØºÙŠØ± Ù…Ø³Ø¤ÙˆÙ„ Ø¹Ù† ØªØµØ±ÙØ§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†',
                'Ø£ÙŠ Ù…Ø®Ø§Ù„ÙØ© Ù‚Ø¯ ØªØ¹Ø±Ø¶ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù„Ù„Ù…Ø³Ø§Ø¡Ù„Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©',
              ]}
            />
          </Section>

          <Section number="17." title="Ø¥Ù†Ù‡Ø§Ø¡ Ø§Ù„Ø®Ø¯Ù…Ø©">
            <BulletList
              items={['ÙŠÙ…ÙƒÙ† Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø­Ø°Ù Ø­Ø³Ø§Ø¨Ù‡', 'Ù„Ø¯Ø±ÙŠØ¨Ø¯Ùˆ Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø®Ø§Ù„Ù']}
            />
          </Section>

          <Section number="18." title="Ø§Ù„ØªÙˆØ§ÙÙ‚ Ù…Ø¹ Ø§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ†">
            <BulletList
              items={['Ø¯Ø±ÙŠØ¨Ø¯Ùˆ ÙŠØ¹Ù…Ù„ Ø¹Ù„Ù‰ Ø§Ø­ØªØ±Ø§Ù… Ø§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ø¹Ø§Ù…Ø©', 'Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†', 'ØªÙˆÙÙŠØ± Ø¨ÙŠØ¦Ø© Ø¢Ù…Ù†Ø©']}
            />
          </Section>

          <Section number="19." title="Ø®Ù„Ø§ØµØ©">
            <p>
              Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠØ§Ø³Ø§Øª Ù„ÙŠØ³Øª Ù…Ø¬Ø±Ø¯ Ù‚ÙˆØ§Ø¹Ø¯ØŒ Ø¨Ù„ Ù‡ÙŠ Ø£Ø³Ø§Ø³ Ø¹Ù…Ù„ Ø§Ù„Ù…Ù†ØµØ©. Ø§Ù„Ù‡Ø¯Ù Ù‡Ùˆ Ø®Ù„Ù‚ Ø¨ÙŠØ¦Ø© Ø¢Ù…Ù†Ø©ØŒ Ù…Ù†Ø¸Ù…Ø©ØŒ ÙˆØ¹Ø§Ø¯Ù„Ø©.
            </p>
            <BulletList items={['Ø¢Ù…Ù†Ø©', 'Ù…Ù†Ø¸Ù…Ø©', 'Ø¹Ø§Ø¯Ù„Ø©']} />
          </Section>

          <Section number="20." title="Ø§Ù„ØªÙˆØ§ØµÙ„">
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <Icon name="mail" className="h-6 w-6 text-red-600" />
                <a className="font-semibold text-red-600 hover:underline" href="mailto:support@dribdo.com">
                  support@dribdo.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="phone" className="h-6 w-6 text-red-600" />
                <a className="font-semibold text-red-600 hover:underline" href="tel:+212638813823">
                  +212638813823
                </a>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}


