export const metadata = {
  title: 'سياسة حقوق النشر (DMCA) | دريبدو',
  description: 'إجراءات دريبدو للتعامل مع إشعارات التعدي على حقوق النشر والإشعار المضاد وحالات التكرار.',
  alternates: { canonical: '/dmca' },
};
const lastUpdated = new Intl.DateTimeFormat('ar-MA', { dateStyle: 'long' }).format(new Date());

function Icon({ name, className = 'h-5 w-5' }) {
  const shared = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    className,
  };

  switch (name) {
    case 'document':
      return (
        <svg {...shared}>
          <path d="M6 3h7l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M13 3v4h4" />
          <path d="M9 11h6" />
          <path d="M9 15h6" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...shared}>
          <path d="M12 3 4 6v5c0 5.25 3.5 9.75 8 10 4.5-.25 8-4.75 8-10V6z" />
          <path d="M12 11v6" />
          <path d="M8 13h8" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...shared}>
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <path d="M4 9l8 6 8-6" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...shared}>
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
      <Icon name="shield" className="h-6 w-6 text-red-600" />
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white">{title}</p>
        <div className="text-sm text-gray-600 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
}

export default function DmcaPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <Icon name="document" className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-600">Ø³ÙŠØ§Ø³Ø© Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù†Ø´Ø± (DMCA)</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø¯Ø±ÙŠØ¨Ø¯Ùˆ ØªØ¬Ø§Ù‡ Ø§Ù†ØªÙ‡Ø§ÙƒØ§Øª Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù†Ø´Ø±</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: {lastUpdated}</p>
          <p className="max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300">
            ÙÙŠ Ø¯Ø±ÙŠØ¨Ø¯ÙˆØŒ Ù†Ø­ØªØ±Ù… Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ© ÙˆÙ†ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù†ØªÙ‡Ø§ÙƒØ§Øª Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù†Ø´Ø± Ø¨Ø´ÙƒÙ„ Ø¬Ø¯ÙŠ. Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠØ§Ø³Ø© ØªØ´Ø±Ø­ ÙƒÙŠÙÙŠØ© Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø°ÙŠ Ù‚Ø¯
            ÙŠÙ†ØªÙ‡Ùƒ Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ø·Ø¨Ø¹ ÙˆØ§Ù„Ù†Ø´Ø±ØŒ ÙˆØ§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù…ØªØ¨Ø¹Ø© Ø¹Ù†Ø¯ ØªÙ‚Ø¯ÙŠÙ… Ø´ÙƒÙˆÙ‰ØŒ ÙˆÙÙ‚ Ù…Ø¨Ø§Ø¯Ø¦ Ù‚Ø§Ù†ÙˆÙ† DMCA Ù…Ø¹ ØªÙƒÙŠÙŠÙÙ‡Ø§ Ù„Ù…Ù†ØµØ© Ø¯Ø±ÙŠØ¨Ø¯Ùˆ.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <Section number="1." title="Ù…Ù‚Ø¯Ù…Ø©">
            <p>
              ØªÙ… Ø¥Ø¹Ø¯Ø§Ø¯ Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© ÙˆÙÙ‚ Ù…Ø¨Ø§Ø¯Ø¦ Ù‚Ø§Ù†ÙˆÙ† Digital Millennium Copyright Act (DMCA)ØŒ Ù…Ø¹ ØªÙƒÙŠÙŠÙÙ‡Ø§ Ù„ØªÙ†Ø§Ø³Ø¨ Ø·Ø¨ÙŠØ¹Ø© Ù…Ù†ØµØ© Ø¯Ø±ÙŠØ¨Ø¯Ùˆ.
            </p>
          </Section>

          <Section number="2." title="Ø§Ø­ØªØ±Ø§Ù… Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù†Ø´Ø±">
            <BulletList
              items={[
                'Ù†Ø´Ø± Ù…Ø­ØªÙˆÙ‰ ÙŠÙ…Ù„ÙƒÙˆÙ† Ø­Ù‚ÙˆÙ‚Ù‡ Ø£Ùˆ Ù„Ø¯ÙŠÙ‡Ù… Ø¥Ø°Ù† Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡',
                'Ø¹Ø¯Ù… Ø¥Ø¹Ø§Ø¯Ø© Ù†Ø´Ø± Ù…Ø­ØªÙˆÙ‰ Ù…Ø­Ù…ÙŠ Ø¨Ø¯ÙˆÙ† ØªØµØ±ÙŠØ­',
                'Ø§Ø­ØªØ±Ø§Ù… Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù…Ø¨Ø¯Ø¹ÙŠÙ† ÙˆØ§Ù„Ø¬Ù‡Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙƒØ© Ù„Ù„Ù…Ø­ØªÙˆÙ‰',
              ]}
            />
            <NotePanel title="ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„Ø­Ù‚ÙˆÙ‚">
              Ø£ÙŠ Ø§Ù†ØªÙ‡Ø§Ùƒ Ù‚Ø¯ ÙŠØ¤Ø¯ÙŠ Ø¥Ù„Ù‰ Ø­Ø°Ù Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø£Ùˆ Ø§ØªØ®Ø§Ø° Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø­Ø³Ø§Ø¨.
            </NotePanel>
          </Section>

          <Section number="3." title="Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ø§Ù†ØªÙ‡Ø§ÙƒØ§Øª">
            <BulletList
              items={[
                'Ø¥Ø¹Ø§Ø¯Ø© Ù†Ø´Ø± ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ø£Ùˆ ØµÙˆØ± Ø¨Ø¯ÙˆÙ† Ø¥Ø°Ù†',
                'Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…Ø­ØªÙˆÙ‰ Ù…Ø­Ù…ÙŠ (Ù…ÙˆØ³ÙŠÙ‚Ù‰ØŒ ØµÙˆØ±ØŒ Ù†ØµÙˆØµ) Ø¨Ø¯ÙˆÙ† ØªØ±Ø®ÙŠØµ',
                'Ø§Ù†ØªØ­Ø§Ù„ Ø£Ø¹Ù…Ø§Ù„ Ø¥Ø¨Ø¯Ø§Ø¹ÙŠØ© ÙˆÙ†Ø³Ø¨Ù‡Ø§ Ù„Ù†ÙØ³Ùƒ',
                'Ø¥Ø¹Ø§Ø¯Ø© Ø±ÙØ¹ Ù…Ø­ØªÙˆÙ‰ ØªÙ…Øª Ø¥Ø²Ø§Ù„ØªÙ‡ Ø³Ø§Ø¨Ù‚Ø§Ù‹ Ø¨Ø³Ø¨Ø¨ Ø§Ù†ØªÙ‡Ø§Ùƒ',
              ]}
            />
          </Section>

          <Section number="4." title="ÙƒÙŠÙÙŠØ© ØªÙ‚Ø¯ÙŠÙ… Ø¥Ø´Ø¹Ø§Ø± DMCA">
            <BulletList
              items={[
                'Ø§Ø³Ù…Ùƒ Ø§Ù„ÙƒØ§Ù…Ù„ ÙˆÙ…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„',
                'ÙˆØµÙ Ø¯Ù‚ÙŠÙ‚ Ù„Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø­Ù…ÙŠ',
                'Ø±Ø§Ø¨Ø· Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø¯Ø§Ø®Ù„ Ø¯Ø±ÙŠØ¨Ø¯Ùˆ',
                'ØªØµØ±ÙŠØ­ Ø¨Ø£Ù†Ùƒ Ø§Ù„Ù…Ø§Ù„Ùƒ Ø£Ùˆ Ù…Ø®ÙˆÙ„ Ù‚Ø§Ù†ÙˆÙ†ÙŠØ§Ù‹',
                'ØªØµØ±ÙŠØ­ Ø¨Ø£Ù† Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ù…Ø© ØµØ­ÙŠØ­Ø©',
                'ØªÙˆÙ‚ÙŠØ¹ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ Ø§Ø³Ù…Ùƒ Ø§Ù„ÙƒØ§Ù…Ù„',
              ]}
            />
            <NotePanel title="Ø³Ø±Ø¹Ø© Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©">
              ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙˆØ§Ø¶Ø­Ø© Ù„ØªØ³Ø±ÙŠØ¹ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©.
            </NotePanel>
          </Section>

          <Section number="5." title="Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø´ÙƒØ§ÙˆÙ‰">
            <BulletList
              items={[
                'ÙŠØªÙ… Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø·Ù„Ø¨ ØªÙ‚Ù†ÙŠØ§Ù‹',
                'Ù‚Ø¯ ÙŠØªÙ… Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù…Ø¤Ù‚ØªØ§Ù‹ Ø£Ùˆ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹',
                'ÙŠØªÙ… Ø¥Ø´Ø¹Ø§Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø°ÙŠ Ù†Ø´Ø± Ø§Ù„Ù…Ø­ØªÙˆÙ‰',
              ]}
            />
            <NotePanel title="ÙÙŠ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„ÙˆØ§Ø¶Ø­Ø©">
              ÙŠØªÙ… Ø§Ù„Ø­Ø°Ù Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø¯ÙˆÙ† ØªØ£Ø®ÙŠØ±.
            </NotePanel>
          </Section>

          <Section number="6." title="Ø§Ù„Ø¥Ø´Ø¹Ø§Ø± Ø§Ù„Ù…Ø¶Ø§Ø¯">
            <BulletList
              items={[
                'Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙƒ Ø§Ù„ÙƒØ§Ù…Ù„Ø©',
                'Ø±Ø§Ø¨Ø· Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø­Ø°ÙˆÙ',
                'ØªÙˆØ¶ÙŠØ­ Ø³Ø¨Ø¨ Ø§Ù„Ø§Ø¹ØªØ±Ø§Ø¶',
                'ØªØµØ±ÙŠØ­ Ø¨Ø£Ù†Ùƒ ØªØ¹ØªÙ‚Ø¯ Ø¨Ø­Ø³Ù† Ù†ÙŠØ© Ø£Ù† Ø§Ù„Ø­Ø°Ù ÙƒØ§Ù† Ø®Ø·Ø£',
              ]}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ø³ÙŠØªÙ… Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø·Ù„Ø¨ ÙˆÙ‚Ø¯ ÙŠØªÙ… Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø¥Ø°Ø§ ÙƒØ§Ù† Ù…Ø¨Ø±Ø±Ø§Ù‹.
            </p>
          </Section>

          <Section number="7." title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„ØªÙƒØ±Ø§Ø±">
            <BulletList
              items={[
                'Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„ØªÙŠ ØªÙ‚ÙˆÙ… Ø¨Ø§Ù†ØªÙ‡Ø§Ùƒ Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù†Ø´Ø± Ø¨Ø´ÙƒÙ„ Ù…ØªÙƒØ±Ø± Ù‚Ø¯ ØªØªØ¹Ø±Ø¶ Ù„ØªÙ‚ÙŠÙŠØ¯ Ø§Ù„Ù…ÙŠØ²Ø§Øª',
                'Ù‚Ø¯ ÙŠØªÙ… ØªØ¹Ù„ÙŠÙ‚ Ø§Ù„Ø­Ø³Ø§Ø¨',
                'Ù‚Ø¯ ÙŠØªÙ… Ø­Ø°Ù Ø§Ù„Ø­Ø³Ø§Ø¨ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹',
              ]}
            />
          </Section>

          <Section number="8." title="Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…">
            <BulletList
              items={[
                'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¤ÙˆÙ„ Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ Ø¹Ù† Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø°ÙŠ ÙŠÙ†Ø´Ø±Ù‡',
                'Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù…ØªÙ„Ø§ÙƒÙ‡ Ù„Ù„Ø­Ù‚ÙˆÙ‚',
                'Ø¹Ø¯Ù… Ø§Ù†ØªÙ‡Ø§Ùƒ Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ©',
              ]}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ø¯Ø±ÙŠØ¨Ø¯Ùˆ Ù„Ø§ ÙŠØªØ­Ù…Ù„ Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø°ÙŠ ÙŠÙ†Ø´Ø±Ù‡ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ†ØŒ Ù„ÙƒÙ†Ù‡ ÙŠØªØ¯Ø®Ù„ Ø¹Ù†Ø¯ Ø§Ù„ØªØ¨Ù„ÙŠØº.
            </p>
          </Section>

          <Section number="9." title="Ø¯ÙˆØ± Ø¯Ø±ÙŠØ¨Ø¯Ùˆ">
            <BulletList
              items={[
                'Ø¯Ø±ÙŠØ¨Ø¯Ùˆ ÙŠÙˆÙØ± Ù…Ù†ØµØ© Ù„Ù†Ø´Ø± Ø§Ù„Ù…Ø­ØªÙˆÙ‰',
                'Ù„Ø§ ÙŠÙ‚ÙˆÙ… Ø¨Ù…Ø±Ø§Ø¬Ø¹Ø© ÙƒÙ„ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù…Ø³Ø¨Ù‚Ø§Ù‹',
                'ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø§Ù„ØªØ¨Ù„ÙŠØºØ§Øª Ù„Ø§ÙƒØªØ´Ø§Ù Ø§Ù„Ø§Ù†ØªÙ‡Ø§ÙƒØ§Øª',
              ]}
            />
            <NotePanel title="Ù†Ù‡Ø¬ Ø¹Ù…Ù„ÙŠ">
              Ù‡Ø°Ø§ Ù†Ù‡Ø¬ Ø¹Ù…Ù„ÙŠ ÙÙŠ Ø§Ù„Ø£Ù†Ø¸Ù…Ø© Ø§Ù„ÙƒØ¨ÙŠØ±Ø©.
            </NotePanel>
          </Section>

          <Section number="10." title="Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…ØªÙƒØ±Ø±">
            <BulletList
              items={[
                'ÙÙŠ Ø­Ø§Ù„Ø© Ø¥Ø¹Ø§Ø¯Ø© Ù†Ø´Ø± Ù…Ø­ØªÙˆÙ‰ ØªÙ…Øª Ø¥Ø²Ø§Ù„ØªÙ‡ØŒ ÙŠØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù…Ø¨Ø§Ø´Ø±Ø©',
                'Ù‚Ø¯ ÙŠØªÙ… Ø§ØªØ®Ø§Ø° Ø¥Ø¬Ø±Ø§Ø¡ Ø£Ø³Ø±Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ø­Ø³Ø§Ø¨',
              ]}
            />
          </Section>

          <Section number="11." title="Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø³Ù…ÙˆØ­ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡">
            <BulletList
              items={[
                'Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø±Ø®Øµ',
                'Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ø¥Ø°Ù†',
                'Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¹Ø§Ø¯Ù„ (Ø­Ø³Ø¨ Ø§Ù„Ù‚ÙˆØ§Ù†ÙŠÙ† Ø§Ù„Ù…Ø¹Ù…ÙˆÙ„ Ø¨Ù‡Ø§)',
              ]}
            />
          </Section>

          <Section number="12." title="Ù…Ø¯Ø© Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©">
            <BulletList
              items={[
                'ØªØªÙ… Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø·Ù„Ø¨Ø§Øª ÙÙŠ Ø£Ù‚Ø±Ø¨ ÙˆÙ‚Øª Ù…Ù…ÙƒÙ†',
                'Ø§Ù„ÙˆÙ‚Øª ÙŠØ®ØªÙ„Ù Ø­Ø³Ø¨ ÙˆØ¶ÙˆØ­ Ø§Ù„Ø´ÙƒÙˆÙ‰',
              ]}
            />
            <NotePanel title="Ù…Ø³ØªÙ†Ø¯ ÙƒØ§Ù…Ù„">
              Ø§Ù„Ø·Ù„Ø¨Ø§Øª ØºÙŠØ± Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø© Ù‚Ø¯ ÙŠØªÙ… ØªØ¬Ø§Ù‡Ù„Ù‡Ø§.
            </NotePanel>
          </Section>

          <Section number="13." title="Ø¥Ø³Ø§Ø¡Ø© Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù†Ø¸Ø§Ù…">
            <BulletList
              items={[
                'Ø£ÙŠ Ø´Ø®Øµ ÙŠÙ‚Ø¯Ù… Ø¨Ù„Ø§ØºØ§Øª ÙƒØ§Ø°Ø¨Ø© Ø£Ùˆ Ù…Ø¶Ù„Ù„Ø© Ù‚Ø¯ ÙŠØªÙ… ØªØ¬Ø§Ù‡Ù„ Ø·Ù„Ø¨Ø§ØªÙ‡',
                'Ù‚Ø¯ ÙŠØªÙ… Ø§ØªØ®Ø§Ø° Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø¹Ù„Ù‰ Ø­Ø³Ø§Ø¨Ù‡',
              ]}
            />
          </Section>

          <Section number="14." title="Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙŠØ§Ø³Ø©">
            <p>
              Ù‚Ø¯ ÙŠØªÙ… ØªØ­Ø¯ÙŠØ« Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠØ§Ø³Ø© Ø­Ø³Ø¨ Ø§Ù„Ø­Ø§Ø¬Ø© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© Ø£Ùˆ Ø§Ù„ØªÙ‚Ù†ÙŠØ©. Ø§Ø³ØªÙ…Ø±Ø§Ø± Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù†ØµØ© ÙŠØ¹Ù†ÙŠ Ù‚Ø¨ÙˆÙ„ Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª.
            </p>
          </Section>

          <Section number="15." title="Ø§Ù„ØªÙˆØ§ØµÙ„">
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


