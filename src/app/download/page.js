import Link from 'next/link';
import { downloadContent } from '@/content/download';

export const metadata = {
  title: 'تنزيل دريبدو',
  description: 'نزّل تطبيق دريبدو على Google Play أو App Store أو عبر ملف APK من صفحة التنزيل الرسمية.',
  alternates: { canonical: '/download' },
};
const platforms = [
  {
    id: 'android',
    title: 'Ø§Ù„ØªÙ†Ø²ÙŠÙ„ Ø¹Ù„Ù‰ Ù…ØªØ¬Ø± Play',
    helper: 'Ù†Ø³Ø®Ø© Android Ø§Ù„Ø±Ø³Ù…ÙŠØ©',
    note: 'Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø°ÙŠÙ† ÙŠØ±ÙŠØ¯ÙˆÙ† Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ© ÙˆØ§Ù„Ø§Ø³ØªÙ‚Ø±Ø§Ø± Ø¹Ø¨Ø± Ø§Ù„Ù…ØªØ¬Ø±.',
    href: downloadContent.links.android,
    accent: 'bg-[#111111] text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m7 5 10 7-10 7V5Z" />
      </svg>
    ),
  },
  {
    id: 'ios',
    title: 'Ø§Ù„ØªÙ†Ø²ÙŠÙ„ Ø¹Ø¨Ø± App Store',
    helper: 'Ù†Ø³Ø®Ø© iPhone ÙˆiPad',
    note: 'Ø£ÙØ¶Ù„ Ø®ÙŠØ§Ø± Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠ iOS Ù…Ø¹ ØªØ¬Ø±Ø¨Ø© ØªÙ†Ø²ÙŠÙ„ ÙˆØªØ­Ø¯ÙŠØ«Ø§Øª Ù…ÙˆØ«ÙˆÙ‚Ø© Ù…Ù† Ù…ØªØ¬Ø± Ø¢Ø¨Ù„.',
    href: downloadContent.links.ios,
    accent: 'bg-white text-black',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6.5c.6-.8 1-1.8.9-2.8-.9.1-2 .6-2.6 1.4-.6.7-1 1.7-.9 2.6 1 .1 2-.4 2.6-1.2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.7 12.8c0-2 1.7-3 1.7-3-.9-1.4-2.3-1.6-2.8-1.6-1.2-.1-2.3.7-2.9.7-.7 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.4 2-.9 1.6-.2 4 .7 5.3.5.8 1.1 1.6 1.9 1.6.7 0 1.1-.5 2-.5s1.3.5 2.1.5 1.3-.7 1.9-1.5c.6-.9.8-1.8.8-1.9 0 0-1.3-.5-1.3-2.9Z" />
      </svg>
    ),
  },
  {
    id: 'apk',
    title: 'ØªÙ†Ø²ÙŠÙ„ Ù†Ø³Ø®Ø© Apk Release',
    helper: 'ØªÙ†Ø²ÙŠÙ„ Ù…Ø¨Ø§Ø´Ø± Ø®Ø§Ø±Ø¬ Ø§Ù„Ù…ØªØ¬Ø±',
    note: 'Ù…ÙÙŠØ¯ Ù„Ù„ØªØ«Ø¨ÙŠØª Ø§Ù„ÙŠØ¯ÙˆÙŠ Ø£Ùˆ Ø§Ù„ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ø³Ø±ÙŠØ¹Ø© Ø¹Ù†Ø¯Ù…Ø§ Ù„Ø§ ØªØ±ÙŠØ¯ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ù…ØªØ¬Ø±.',
    href: downloadContent.links.apk,
    accent: 'bg-white text-black',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0 4-4m-4 4-4-4M5 19h14" />
      </svg>
    ),
  },
];

const signals = [
  { title: 'Ù†Ø³Ø®Ø© Ø±Ø³Ù…ÙŠØ©', text: 'Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© Ù‡ÙŠ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„ØªÙ†Ø²ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ ÙˆÙ…Ø±Ø§Ø¬Ø¹Ø© Ù‚Ù†ÙˆØ§Øª Ø§Ù„ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…ØªØ§Ø­Ø©.' },
  { title: 'Ø±ÙˆØ§Ø¨Ø· Ù…ÙˆØ­Ø¯Ø©', text: 'ØªØ¬Ø¯ Ù‡Ù†Ø§ ÙƒÙ„ Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„ØªÙ†Ø²ÙŠÙ„ ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯ Ø¨Ø¯Ù„ Ø§Ù„Ø¨Ø­Ø« Ø¨ÙŠÙ† ØµÙØ­Ø§Øª Ù…ØªØ¹Ø¯Ø¯Ø©.' },
  { title: 'ØªØ¬Ø±Ø¨Ø© ÙˆØ§Ø¶Ø­Ø©', text: 'Ø¹Ø±Ø¶Ù†Ø§ ÙƒÙ„ Ù…Ù†ØµØ© Ø¨Ø´ÙƒÙ„ Ù…Ø¨Ø§Ø´Ø± Ù…Ø¹ ÙˆØµÙ ÙŠØ³Ø§Ø¹Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù„Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø©.' },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#f6f2ef] text-black">
      <section className="border-b border-black/8">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ù„Ù„ØªÙ†Ø²ÙŠÙ„</p>
              <h1 className="text-5xl font-black leading-tight text-black sm:text-6xl">Ø§Ø¨Ø¯Ø£ ØªÙ†Ø²ÙŠÙ„ Ø¯Ø±ÙŠØ¨Ø¯Ùˆ Ø¹Ù„Ù‰ Ø¬Ù‡Ø§Ø²Ùƒ Ø¨Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„ØªÙŠ ØªÙ†Ø§Ø³Ø¨Ùƒ</h1>
              <p className="max-w-2xl text-lg leading-8 text-black/65">
                Ù…Ø±Ø­Ø¨Ù‹Ø§ Ø¨Ùƒ ÙÙŠ ØµÙØ­Ø© ØªÙ†Ø²ÙŠÙ„ Ø¯Ø±ÙŠØ¨Ø¯Ùˆ. Ù‡Ù†Ø§ Ø³ØªØ¬Ø¯ Ø§Ù„Ù†Ø³Ø® Ø§Ù„Ø±Ø³Ù…ÙŠØ© Ø§Ù„Ù…ØªØ§Ø­Ø© Ù„Ù„ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù„Ù‰ Google Play ÙˆApp Store ÙˆÙ†Ø³Ø®Ø©
                `APK Release` Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©ØŒ Ù…Ø¹ Ø´Ø±Ø­ Ù…Ø¨Ø³Ø· Ù„ÙƒÙ„ Ø®ÙŠØ§Ø± Ø­ØªÙ‰ ÙŠØ®ØªØ§Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø£Ù†Ø³Ø¨ Ù„Ù‡ Ø¨Ø³Ù‡ÙˆÙ„Ø©.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {signals.map((signal) => (
                  <article key={signal.title} className="rounded-[24px] border border-black/10 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-black">{signal.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-black/60">{signal.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-black/35">ØªÙ†Ø²ÙŠÙ„ Ù…Ø¨Ø§Ø´Ø±</p>
              <h2 className="mt-4 text-3xl font-black text-black">Ø§Ø®ØªØ± Ù†Ø³Ø®ØªÙƒ ÙˆØ§Ø¨Ø¯Ø£ Ø§Ù„Ø¢Ù†</h2>
              <div className="mt-8 space-y-4">
                <DownloadAction
                  href={downloadContent.links.android}
                  label="Ø§Ù„ØªÙ†Ø²ÙŠÙ„ Ø¹Ù„Ù‰ Ù…ØªØ¬Ø± Play"
                  helper="Ù†Ø³Ø®Ø© Android Ø§Ù„Ø±Ø³Ù…ÙŠØ©"
                  accent="dark"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m7 5 10 7-10 7V5Z" />
                    </svg>
                  }
                />
                <DownloadAction
                  href={downloadContent.links.ios}
                  label="Ø§Ù„ØªÙ†Ø²ÙŠÙ„ Ø¹Ø¨Ø± App Store"
                  helper="Ù†Ø³Ø®Ø© iPhone ÙˆiPad"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6.5c.6-.8 1-1.8.9-2.8-.9.1-2 .6-2.6 1.4-.6.7-1 1.7-.9 2.6 1 .1 2-.4 2.6-1.2Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.7 12.8c0-2 1.7-3 1.7-3-.9-1.4-2.3-1.6-2.8-1.6-1.2-.1-2.3.7-2.9.7-.7 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.4 2-.9 1.6-.2 4 .7 5.3.5.8 1.1 1.6 1.9 1.6.7 0 1.1-.5 2-.5s1.3.5 2.1.5 1.3-.7 1.9-1.5c.6-.9.8-1.8.8-1.9 0 0-1.3-.5-1.3-2.9Z" />
                    </svg>
                  }
                />
                <DownloadAction
                  href={downloadContent.links.apk}
                  label="ØªÙ†Ø²ÙŠÙ„ Ù†Ø³Ø®Ø© Apk Release"
                  helper="ØªÙ†Ø²ÙŠÙ„ Ù…Ø¨Ø§Ø´Ø± Ø®Ø§Ø±Ø¬ Ø§Ù„Ù…ØªØ¬Ø±"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0 4-4m-4 4-4-4M5 19h14" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-right">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-black/35">Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„ØªÙ†Ø²ÙŠÙ„</p>
          <h2 className="mt-3 text-4xl font-black text-black">Ù‚Ù†ÙˆØ§Øª ØªÙ†Ø²ÙŠÙ„ ÙˆØ§Ø¶Ø­Ø© ÙˆÙ…Ø¨Ø§Ø´Ø±Ø©</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
            ØµÙ…Ù…Ù†Ø§ Ù‡Ø°Ù‡ Ø§Ù„Ø¨Ø·Ø§Ù‚Ø§Øª Ù„ØªÙƒÙˆÙ† ÙˆØ§Ø¶Ø­Ø© ÙˆØ³Ø±ÙŠØ¹Ø©ØŒ Ù…Ø¹ ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„Ø­Ø±ÙƒØ© ÙˆØ§Ù„Ø²Ø®Ø±ÙØ© Ø­ØªÙ‰ ØªØ¨Ù‚Ù‰ Ø§Ù„ØµÙØ­Ø© Ø®ÙÙŠÙØ© Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„ØªØµÙØ­ ÙˆØ§Ù„ØªÙ†Ù‚Ù„.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {platforms.map((platform) => {
            const ready = Boolean(platform.href);
            const body = (
              <>
                <div className={`rounded-[1.6rem] border p-6 text-center shadow-sm ${platform.accent} ${platform.accent.includes('bg-white') ? 'border-black/10' : 'border-black/0'}`}>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <span>{platform.icon}</span>
                    <div className="text-center">
                      <p className={`text-sm font-semibold uppercase tracking-[0.35em] ${ready ? (platform.accent.includes('bg-white') ? 'text-black/40' : 'text-white/45') : 'text-black/35'}`}>
                        {ready ? 'Ø¬Ø§Ù‡Ø² Ù„Ù„ØªÙ†Ø²ÙŠÙ„' : 'Ù‚Ø±ÙŠØ¨Ù‹Ø§'}
                      </p>
                      <h3 className="mt-3 text-2xl font-black">{platform.title}</h3>
                      <p className={`mt-2 text-sm ${platform.accent.includes('bg-white') ? 'text-black/60' : 'text-white/70'}`}>{platform.helper}</p>
                    </div>
                  </div>
                  <p className={`mt-6 leading-8 ${platform.accent.includes('bg-white') ? 'text-black/65' : 'text-white/75'}`}>{platform.note}</p>
                  <div className="mt-8 flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                        ready
                          ? platform.accent.includes('bg-white')
                            ? 'bg-red-700 text-white'
                            : 'bg-white text-black'
                          : 'bg-black/10 text-black/45'
                      }`}
                    >
                      {ready ? 'Ø§Ø¨Ø¯Ø£ Ø§Ù„ØªÙ†Ø²ÙŠÙ„' : 'Ø³ÙŠØªÙ… Ø§Ù„ØªÙØ¹ÙŠÙ„ Ù‚Ø±ÙŠØ¨Ù‹Ø§'}
                    </span>
                  </div>
                </div>
              </>
            );

            return ready ? (
              <Link key={platform.id} href={platform.href} className="block transition-transform hover:-translate-y-0.5">
                {body}
              </Link>
            ) : (
              <div key={platform.id}>{body}</div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-black/8 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] bg-[#111111] p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/45">Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ù…Ù‡Ù…Ø©</p>
              <h2 className="mt-4 text-3xl font-black">Ù‚Ø¨Ù„ ØªÙ†Ø²ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚</h2>
              <ul className="mt-6 space-y-3 text-sm leading-8 text-white/75">
                <li>ØªØ£ÙƒØ¯ Ù…Ù† ØªÙ†Ø²ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ù…Ù† Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ø±Ø³Ù…ÙŠØ© ÙÙ‚Ø·.</li>
                <li>Ø±Ø§Ø¬Ø¹ ØªÙˆØ§ÙÙ‚ Ø§Ù„Ù†Ø³Ø®Ø© Ù…Ø¹ Ù†Ø¸Ø§Ù… Ø§Ù„ØªØ´ØºÙŠÙ„ ÙÙŠ Ø¬Ù‡Ø§Ø²Ùƒ.</li>
                <li>Ø¥Ø°Ø§ ÙƒÙ†Øª ØªÙˆØ§Ø¬Ù‡ Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„ØªÙ†Ø²ÙŠÙ„ØŒ Ø§Ø³ØªØ®Ø¯Ù… ØµÙØ­Ø© Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø´ÙŠØ¡ Ù„Ø§ ÙŠØ¹Ù…Ù„.</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-[#faf8f6] p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-black/35">Ù…Ø§Ø°Ø§ Ø¨Ø¹Ø¯ Ø§Ù„ØªÙ†Ø²ÙŠÙ„ØŸ</p>
              <h2 className="mt-4 text-3xl font-black text-black">Ø§Ø¨Ø¯Ø£ ØªØ¬Ø±Ø¨ØªÙƒ Ø§Ù„Ø£ÙˆÙ„Ù‰ Ø¯Ø§Ø®Ù„ Ø¯Ø±ÙŠØ¨Ø¯Ùˆ</h2>
              <p className="mt-4 leading-8 text-black/65">
                Ø¨Ø¹Ø¯ Ø§Ù„ØªØ«Ø¨ÙŠØªØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ØŒ Ø¥Ø¹Ø¯Ø§Ø¯ Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠØŒ Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø£Ø´Ø®Ø§ØµØŒ Ø§Ù„Ù†Ø´Ø±ØŒ Ø§Ø³ØªÙƒØ´Ø§Ù Ø§Ù„ÙÙŠØ¯ÙŠÙˆÙ‡Ø§ØªØŒ
                Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ Ø§Ù„Ù…Ø¬ØªÙ…Ø¹Ø§Øª ÙˆØ§Ù„Ù…Ø³Ø§Ø­Ø§ØªØŒ ÙˆØ§Ù„Ø§Ø³ØªÙØ§Ø¯Ø© Ù…Ù† Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ø¥Ø¶Ø§ÙÙŠØ© Ù…Ø«Ù„ Ø§Ù„Ø³ÙˆÙ‚ ÙˆØ§Ù„ÙˆØ¸Ø§Ø¦Ù ÙˆØ§Ù„Ù…Ø°ÙƒØ±Ø§Øª.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/features" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/90">
                  Ø§Ø³ØªØ¹Ø±Ø¶ Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª
                </Link>
                <Link href="/faq" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/5">
                  Ø§ÙØªØ­ Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ø§Ù„Ø´Ø§Ø¦Ø¹Ø©
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DownloadAction({ href, label, helper, icon, accent = 'light' }) {
  const className =
    accent === 'dark'
      ? 'border-black bg-[#111111] text-white hover:bg-black'
      : 'border-black/10 bg-[#faf8f6] text-black hover:border-black/20 hover:bg-white';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative flex min-h-[5.25rem] items-center justify-center rounded-[1.5rem] border px-16 py-5 text-center transition ${className}`}
    >
      <span className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 ${accent === 'dark' ? 'text-white' : 'text-black'}`}>{icon}</span>
      <span className="mx-auto flex max-w-full flex-col items-center justify-center text-center">
        <span className="block text-lg font-bold">{label}</span>
        <span className={accent === 'dark' ? 'block text-sm text-white/70' : 'block text-sm text-black/55'}>{helper}</span>
      </span>
    </a>
  );
}

