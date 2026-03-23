export const metadata = {
  title: 'أمان البيانات | دريبدو',
  description: 'تعرّف على كيفية حماية دريبدو لبيانات المستخدمين والحسابات والتعامل مع الحوادث الأمنية ببنية موثوقة.',
  alternates: { canonical: '/security' },
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
    case 'shield':
      return (
        <svg {...shared}>
          <path d="M12 3 4 6v5c0 5.25 3.5 9.75 8 10 4.5-.25 8-4.75 8-10V6z" />
          <path d="M12 11v6" />
          <path d="M8 13h8" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...shared}>
          <path d="M6 11V8a6 6 0 0 1 12 0v3" />
          <rect x="6" y="11" width="12" height="9" rx="2" />
        </svg>
      );
    case 'monitor':
      return (
        <svg {...shared}>
          <rect x="4" y="5" width="16" height="11" rx="2" />
          <path d="M8 20h8" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...shared}>
          <path d="M12 2 4 6v5c0 4.5 2 8 8 10 6-2 8-6 8-10V6z" />
          <path d="M12 9v4" />
          <circle cx="12" cy="17" r="1" />
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
      <Icon name="alert" className="h-6 w-6 text-red-600" />
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white">{title}</p>
        <div className="text-sm text-gray-600 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-12 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <Icon name="shield" className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-600">Ø£Ù…Ø§Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Ù…Ù‚Ø§Ø±Ø¨Ø© Ø¯Ø±ÙŠØ¨Ø¯Ùˆ Ø§Ù„Ø´Ø§Ù…Ù„Ø© Ù„Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: {lastUpdated}</p>
          <p className="max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300">
            ÙÙŠ Ø¯Ø±ÙŠØ¨Ø¯ÙˆØŒ Ø£Ù…Ø§Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù„ÙŠØ³ Ù…ÙŠØ²Ø© Ø¥Ø¶Ø§ÙÙŠØ©ØŒ Ø¨Ù„ Ø¬Ø²Ø¡ Ø£Ø³Ø§Ø³ÙŠ Ù…Ù† ØªØµÙ…ÙŠÙ… Ø§Ù„Ù†Ø¸Ø§Ù…. Ù…Ù† Ø£ÙˆÙ„ Ù…Ø±Ø­Ù„Ø© ÙÙŠ Ø¨Ù†Ø§Ø¡ Ø§Ù„Ù…Ù†ØµØ© ØªØªØ¨Ø¹Ù†Ø§ Ù…Ù‚Ø§Ø±Ø¨Ø© ØªÙ‚Ù„Ù„ Ø§Ù„Ù…Ø®Ø§Ø·Ø±ØŒ ØªØ¹Ø²Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§ØªØŒ ÙˆØªØ¶Ø¨Ø· Ø§Ù„ÙˆØµÙˆÙ„.
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-gray-700 dark:text-gray-300">
            Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© ØªØ´Ø±Ø­ ÙƒÙŠÙ ÙŠØªÙ… ØªØ£Ù…ÙŠÙ† Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø¹Ù„Ù‰ Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø¨Ù†ÙŠØ© Ø§Ù„ØªÙ‚Ù†ÙŠØ© ÙˆØ§Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„ÙŠÙˆÙ…ÙŠ.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <Section number="1." title="Ù…Ù‚Ø¯Ù…Ø©">
            <p>
              ÙÙŠ Ø¯Ø±ÙŠØ¨Ø¯ÙˆØŒ Ø£Ù…Ø§Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù‡Ùˆ Ø¬Ø²Ø¡ Ø£Ø³Ø§Ø³ÙŠ Ù…Ù† ØªØµÙ…ÙŠÙ… Ø§Ù„Ù†Ø¸Ø§Ù… ÙˆÙ„ÙŠØ³ Ù…ÙŠØ²Ø© Ø§Ø®ØªÙŠØ§Ø±ÙŠØ©. ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ Ù…Ù‚Ø§Ø±Ø¨Ø© ØªØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ù…Ø®Ø§Ø·Ø±ØŒ Ø¹Ø²Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§ØªØŒ ÙˆØ§Ù„ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„ÙˆØµÙˆÙ„.
            </p>
          </Section>

          <Section number="2." title="ÙÙ„Ø³ÙØ© Ø§Ù„Ø£Ù…Ø§Ù† ÙÙŠ Ø¯Ø±ÙŠØ¨Ø¯Ùˆ">
            <BulletList
              items={[
                'ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø³Ø© Ù‚Ø¯Ø± Ø§Ù„Ø¥Ù…ÙƒØ§Ù†',
                'ØªÙ‚Ù„ÙŠÙ„ Ù†Ù‚Ø§Ø· Ø§Ù„ÙˆØµÙˆÙ„',
                'Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ø£Ù†Ø´Ø·Ø© Ø¨Ø¯Ù„ Ø§Ù„Ø«Ù‚Ø© Ø§Ù„Ù…Ø·Ù„Ù‚Ø©',
                'ÙƒÙ„ Ø´ÙŠØ¡ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù… Ù…Ø¨Ù†ÙŠ Ø¹Ù„Ù‰ ØªÙ‚Ù„ÙŠÙ„ Ø§Ø­ØªÙ…Ø§Ù„ÙŠØ© Ø§Ù„Ø®Ø·Ø£ Ù‚Ø¨Ù„ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹Ù‡',
              ]}
            />
          </Section>

          <Section number="3." title="Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª">
            <SubSection label="3.1" title="ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„">
              <BulletList
                items={[
                  'ÙŠØªÙ… ØªØ£Ù…ÙŠÙ† ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„Ø§Øª Ø­Ø¯ÙŠØ«Ø©',
                  'ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø±ÙˆØ± Ù„Ø§ ÙŠØªÙ… ØªØ®Ø²ÙŠÙ†Ù‡Ø§ Ø¨Ø´ÙƒÙ„ Ù…Ø¨Ø§Ø´Ø±ØŒ Ø¨Ù„ ÙŠØªÙ… ØªØ´ÙÙŠØ±Ù‡Ø§',
                  'ÙŠØªÙ… Ù…Ø±Ø§Ù‚Ø¨Ø© Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø§Ù„Ù…ØªÙƒØ±Ø±Ø© Ø£Ùˆ ØºÙŠØ± Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ©',
                ]}
              />
            </SubSection>
            <SubSection label="3.2" title="Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¬Ù„Ø³Ø§Øª">
              <BulletList
                items={[
                  'ÙŠØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø¬Ù„Ø³Ø§Øª Ø¢Ù…Ù†Ø© Ù„ÙƒÙ„ Ù…Ø³ØªØ®Ø¯Ù…',
                  'ÙŠØªÙ… Ø¥Ù†Ù‡Ø§Ø¡ Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø¹Ù†Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬',
                  'ÙŠØªÙ… ØªÙ‚Ù„ÙŠÙ„ Ù…Ø¯Ø© ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„Ø¬Ù„Ø³Ø§Øª ÙÙŠ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø³Ø©',
                ]}
              />
            </SubSection>
          </Section>

          <Section number="4." title="ØªØ´ÙÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª">
            <SubSection label="4.1" title="Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ù†Ù‚Ù„">
              <BulletList
                items={[
                  'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø±Ø³Ù„Ø© Ø¨ÙŠÙ† Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ ÙˆØ§Ù„Ø®ÙˆØ§Ø¯Ù… Ù…Ø´ÙØ±Ø© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… HTTPS',
                  'Ù‡Ø°Ø§ ÙŠÙ…Ù†Ø¹ Ø§Ø¹ØªØ±Ø§Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø§ØªØµØ§Ù„',
                ]}
              />
            </SubSection>
            <SubSection label="4.2" title="Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„ØªØ®Ø²ÙŠÙ†">
              <BulletList
                items={[
                  'ÙŠØªÙ… ØªØ´ÙÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø³Ø© Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø©',
                  'ÙŠØªÙ… ÙØµÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø³Ø© Ø¹Ù† Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…',
                ]}
              />
            </SubSection>
          </Section>

          <Section number="5." title="Ø§Ù„Ø¨Ù†ÙŠØ© Ø§Ù„ØªØ­ØªÙŠØ©">
            <BulletList
              items={[
                'ÙŠØªÙ… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø®ÙˆØ§Ø¯Ù… Ù…ÙˆØ«ÙˆÙ‚Ø© ÙˆÙ…Ø­Ù…ÙŠØ©',
                'ÙŠØªÙ… ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù„ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ù…Ø®Ø§Ø·Ø±',
                'ÙŠØªÙ… Ø¹Ø²Ù„ Ø§Ù„Ø®Ø¯Ù…Ø§Øª (Auth / Storage / API)',
              ]}
            />
            <NotePanel title="Ø§Ù„Ù‡Ø¯Ù">
              Ø¥Ø°Ø§ Ø­Ø¯Ø« Ø®Ù„Ù„ ÙÙŠ Ø¬Ø²Ø¡ØŒ Ù„Ø§ ÙŠØ¤Ø«Ø± Ø¹Ù„Ù‰ Ø§Ù„Ù†Ø¸Ø§Ù… Ø¨Ø§Ù„ÙƒØ§Ù…Ù„.
            </NotePanel>
          </Section>

          <Section number="6." title="Ø§Ù„ØªØ­ÙƒÙ… ÙÙŠ Ø§Ù„ÙˆØµÙˆÙ„">
            <BulletList
              items={[
                'Ù„ÙŠØ³ ÙƒÙ„ Ø¬Ø²Ø¡ Ù…Ù† Ø§Ù„Ù†Ø¸Ø§Ù… ÙŠÙ…ÙƒÙ†Ù‡ Ø§Ù„ÙˆØµÙˆÙ„ Ù„ÙƒÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª',
                'ÙŠØªÙ… ØªØ­Ø¯ÙŠØ¯ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù„ÙƒÙ„ Ø®Ø¯Ù…Ø©',
                'ÙŠØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø£ÙŠ Ù…Ø­Ø§ÙˆÙ„Ø© ÙˆØµÙˆÙ„ ØºÙŠØ± Ø¹Ø§Ø¯ÙŠØ©',
              ]}
            />
          </Section>

          <Section number="7." title="Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ù†Ø¸Ø§Ù…">
            <BulletList
              items={[
                'Ø§Ù„Ù†Ø´Ø§Ø·Ø§Øª ØºÙŠØ± Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠØ©',
                'Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„Ø§Ø®ØªØ±Ø§Ù‚',
                'Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… ØºÙŠØ± Ø§Ù„Ù…Ø¹ØªØ§Ø¯',
              ]}
            />
            <NotePanel title="Ø§Ø³ØªØ¬Ø§Ø¨Ø© Ø³Ø±ÙŠØ¹Ø©">
              Ø£ÙŠ Ø³Ù„ÙˆÙƒ ØºÙŠØ± Ø·Ø¨ÙŠØ¹ÙŠ ÙŠØªÙ… Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹Ù‡ Ø¨Ø³Ø±Ø¹Ø©.
            </NotePanel>
          </Section>

          <Section number="8." title="Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ù…Ø­ØªÙˆÙ‰">
            <BulletList
              items={[
                'ÙŠØªÙ… ØªØ®Ø²ÙŠÙ† Ø§Ù„ØµÙˆØ± ÙˆØ§Ù„ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ø¨Ø·Ø±ÙŠÙ‚Ø© Ø¢Ù…Ù†Ø©',
                'ÙŠØªÙ… Ù…Ù†Ø¹ Ø§Ù„ÙˆØµÙˆÙ„ ØºÙŠØ± Ø§Ù„Ù…ØµØ±Ø­ Ø¨Ù‡ Ù„Ù„Ù…Ù„ÙØ§Øª',
                'ÙŠØªÙ… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø±ÙˆØ§Ø¨Ø· Ù…Ø¤Ù‚ØªØ© Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø©',
              ]}
            />
          </Section>

          <Section number="9." title="Ø§Ù„Ø­Ù…Ø§ÙŠØ© Ù…Ù† Ø§Ù„Ù‡Ø¬Ù…Ø§Øª">
            <SubSection label="9.1" title="Ù‡Ø¬Ù…Ø§Øª Ø§Ù„Ù‚ÙˆØ© Ø§Ù„ØºØ§Ø´Ù…Ø©">
              <BulletList
                items={[
                  'ØªØ­Ø¯ÙŠØ¯ Ø¹Ø¯Ø¯ Ù…Ø­Ø§ÙˆÙ„Ø§Øª ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
                  'Ø­Ø¸Ø± Ù…Ø¤Ù‚Øª Ø¹Ù†Ø¯ ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯',
                ]}
              />
            </SubSection>
            <SubSection label="9.2" title="Ø§Ù„Ù‡Ø¬Ù…Ø§Øª Ø§Ù„Ø¢Ù„ÙŠØ© (Bots)">
              <BulletList
                items={[
                  'Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ø£Ù†Ø´Ø·Ø© Ø§Ù„Ù…ØªÙƒØ±Ø±Ø©',
                  'ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø´Ø¨ÙˆÙ‡Ø©',
                ]}
              />
            </SubSection>
            <SubSection label="9.3" title="Ù‡Ø¬Ù…Ø§Øª API">
              <BulletList
                items={[
                  'ØªØ­Ø¯ÙŠØ¯ Ø¹Ø¯Ø¯ Ø§Ù„Ø·Ù„Ø¨Ø§Øª (Rate Limiting)',
                  'Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙƒÙ„ Ø·Ù„Ø¨',
                ]}
              />
            </SubSection>
          </Section>

          <Section number="10." title="Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø«ØºØ±Ø§Øª">
            <BulletList
              items={[
                'ÙŠØªÙ… Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù†Ø¸Ø§Ù… Ø¨Ø´ÙƒÙ„ Ø¯ÙˆØ±ÙŠ',
                'ÙŠØªÙ… Ø¥ØµÙ„Ø§Ø­ Ø§Ù„Ø«ØºØ±Ø§Øª ÙÙˆØ± Ø§ÙƒØªØ´Ø§ÙÙ‡Ø§',
                'ÙŠØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù†Ø¸Ø§Ù… Ø¨Ø§Ø³ØªÙ…Ø±Ø§Ø±',
              ]}
            />
          </Section>

          <Section number="11." title="Ø¯ÙˆØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ Ø§Ù„Ø£Ù…Ø§Ù†">
            <BulletList
              items={[
                'Ø§Ø³ØªØ®Ø¯Ø§Ù… ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ù‚ÙˆÙŠØ©',
                'Ø¹Ø¯Ù… Ù…Ø´Ø§Ø±ÙƒØ© Ø§Ù„Ø­Ø³Ø§Ø¨',
                'ØªØ¬Ù†Ø¨ Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ù…Ø´Ø¨ÙˆÙ‡Ø©',
                'ØªØ­Ø¯ÙŠØ« Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø¨Ø§Ø³ØªÙ…Ø±Ø§Ø±',
              ]}
            />
          </Section>

          <Section number="12." title="Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø­ÙˆØ§Ø¯Ø« Ø§Ù„Ø£Ù…Ù†ÙŠØ©">
            <BulletList
              items={[
                'ÙŠØªÙ… Ø¹Ø²Ù„ Ø§Ù„Ø¬Ø²Ø¡ Ø§Ù„Ù…ØªØ£Ø«Ø±',
                'ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø³Ø¨Ø¨',
                'Ø¥ØµÙ„Ø§Ø­ Ø§Ù„Ø®Ù„Ù„',
                'Ø§ØªØ®Ø§Ø° Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ù„Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø±',
              ]}
            />
            <NotePanel title="Ø´Ø¨ÙƒØ© Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±">
              Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø§Ù„Ù…Ø´ÙƒÙ„Ø© ØªØ¤Ø«Ø± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†ØŒ ÙŠØªÙ… Ø¥Ø´Ø¹Ø§Ø±Ù‡Ù….
            </NotePanel>
          </Section>

          <Section number="13." title="Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø§Ø­ØªÙŠØ§Ø·ÙŠ">
            <BulletList
              items={[
                'ÙŠØªÙ… Ø£Ø®Ø° Ù†Ø³Ø® Ø§Ø­ØªÙŠØ§Ø·ÙŠØ© Ø¨Ø´ÙƒÙ„ Ø¯ÙˆØ±ÙŠ',
                'ÙŠØªÙ… ØªØ®Ø²ÙŠÙ† Ø§Ù„Ù†Ø³Ø® ÙÙŠ Ø¨ÙŠØ¦Ø© Ù…Ù†ÙØµÙ„Ø©',
                'ÙŠÙ…ÙƒÙ† Ø§Ø³ØªØ±Ø¬Ø§Ø¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙÙŠ Ø­Ø§Ù„Ø© Ø§Ù„Ø·ÙˆØ§Ø±Ø¦',
              ]}
            />
          </Section>

          <Section number="14." title="Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ©">
            <BulletList
              items={[
                'ÙÙŠ Ø¨Ø¹Ø¶ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ù†Ø³ØªØ®Ø¯Ù… Ø®Ø¯Ù…Ø§Øª Ø®Ø§Ø±Ø¬ÙŠØ© Ù…Ø«Ù„ Ø§Ù„ØªØ®Ø²ÙŠÙ† ÙˆØ§Ù„Ø­Ù…Ø§ÙŠØ©',
              ]}
            />
            <NotePanel title="Ø§Ø®ØªÙŠØ§Ø± Ø¯Ù‚ÙŠÙ‚">
              ÙŠØªÙ… Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø´Ø±ÙƒØ§Ø¡ Ø¨Ø¹Ù†Ø§ÙŠØ© Ù…Ø¹ ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª.
            </NotePanel>
          </Section>

          <Section number="15." title="ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„Ø£Ù…Ø§Ù†">
            <BulletList
              items={[
                'ÙŠØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù†Ø¸Ø§Ù… Ø¨Ø´ÙƒÙ„ Ù…Ø³ØªÙ…Ø±',
                'Ø£ÙŠ ØªØ­Ø¯ÙŠØ« Ø£Ù…Ù†ÙŠ ÙŠØªÙ… ØªØ·Ø¨ÙŠÙ‚Ù‡ Ù…Ø¨Ø§Ø´Ø±Ø©',
                'ÙŠØªÙ… ØªÙ‚Ù„ÙŠÙ„ ÙˆÙ‚Øª Ø§Ù„ØªØ¹Ø±Ø¶ Ù„Ø£ÙŠ Ø®Ø·Ø±',
              ]}
            />
          </Section>

          <Section number="16." title="Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø£Ù…Ø§Ù†">
            <p>
              Ø¨Ø´ÙƒÙ„ ÙˆØ§Ù‚Ø¹ÙŠØŒ Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù†Ø¸Ø§Ù… Ø¢Ù…Ù† Ø¨Ù†Ø³Ø¨Ø© 100%ØŒ Ù„ÙƒÙ†Ù†Ø§ Ù†Ø¹Ù…Ù„ Ø¹Ù„Ù‰ ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ù…Ø®Ø§Ø·Ø±ØŒ Ù†Ø±Ø§Ù‚Ø¨ Ø§Ù„Ù†Ø¸Ø§Ù… Ø¨Ø´ÙƒÙ„ Ø¯Ø§Ø¦Ù…ØŒ ÙˆÙ†Ø³ØªØ¬ÙŠØ¨ Ø¨Ø³Ø±Ø¹Ø© Ù„Ø£ÙŠ ØªÙ‡Ø¯ÙŠØ¯.
            </p>
          </Section>

          <Section number="17." title="Ø§Ù„ØªÙˆØ§ÙÙ‚ Ù…Ø¹ Ø§Ù„Ø³ÙŠØ§Ø³Ø§Øª">
            <BulletList
              items={[
                'Ù†Ø¸Ø§Ù… Ø§Ù„Ø£Ù…Ø§Ù† ÙÙŠ Ø¯Ø±ÙŠØ¨Ø¯Ùˆ ÙŠØ¹Ù…Ù„ Ø¨Ø§Ù„ØªÙƒØ§Ù…Ù„ Ù…Ø¹ Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©',
                'Ø§Ù„Ø´Ø±ÙˆØ· ÙˆØ§Ù„Ø£Ø­ÙƒØ§Ù…',
                'Ø³ÙŠØ§Ø³Ø§Øª Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…',
              ]}
            />
          </Section>

          <Section number="18." title="Ø§Ù„Ø´ÙØ§ÙÙŠØ©">
            <p>
              Ù†Ø­Ø§ÙˆÙ„ Ø¥Ø¨Ù‚Ø§Ø¡ Ø§Ù„Ø£Ù…ÙˆØ± ÙˆØ§Ø¶Ø­Ø©: Ù„Ø§ Ù†Ø¯Ù‘Ø¹ÙŠ Ø­Ù…Ø§ÙŠØ© Ù…Ø·Ù„Ù‚Ø©ØŒ Ù†ÙˆØ¶Ø­ ÙƒÙŠÙ Ù†Ø´ØªØºÙ„ ÙØ¹Ù„ÙŠØ§Ù‹ØŒ ÙˆÙ†Ø·ÙˆØ± Ø§Ù„Ù†Ø¸Ø§Ù… Ø¨Ø§Ø³ØªÙ…Ø±Ø§Ø±.
            </p>
          </Section>

          <Section number="19." title="Ø§Ù„ØªÙˆØ§ØµÙ„">
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


