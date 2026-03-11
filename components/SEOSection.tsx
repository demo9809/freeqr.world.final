import React, { useState } from 'react';

// ─── SEO Landing Section ───────────────────────────────────────────────────
// Fully crawlable, keyword-rich content section that lives below the main tool.
// Uses semantic HTML (section / article / h2 / h3) for Google & AI search engines.
// ──────────────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="#4f46e5" fillOpacity="0.12" />
    <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="#4f46e5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="#ef4444" fillOpacity="0.1" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#ef4444" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const QR_TYPES = [
  { emoji: '🔗', name: 'URL / Website', slug: 'url', desc: 'Turn any website link into a scannable QR code. Works with all URLs — blogs, landing pages, affiliate links, portfolios.' },
  { emoji: '📶', name: 'WiFi Network', slug: 'wifi', desc: 'Share WiFi credentials by scanning. No password typing — guests connect instantly to your home or office network.' },
  { emoji: '👤', name: 'vCard / Contact', slug: 'vcard', desc: 'Digital business card. Scan to instantly save name, phone, email, company and website to contacts app.' },
  { emoji: '📧', name: 'Email', slug: 'email', desc: 'Pre-filled email QR code with recipient, subject and body. Perfect for support links and newsletter signups.' },
  { emoji: '💬', name: 'WhatsApp', slug: 'whatsapp', desc: 'Open a WhatsApp chat with a pre-filled message. Great for customer support and business inquiries.' },
  { emoji: '✈️', name: 'Telegram', slug: 'telegram', desc: 'Direct link to a Telegram profile, channel or group. Share your Telegram presence on print materials.' },
  { emoji: '📱', name: 'SMS', slug: 'sms', desc: 'Pre-filled SMS message QR code. One scan sends a text — useful for shortcodes and contests.' },
  { emoji: '📞', name: 'Phone Number', slug: 'phone', desc: 'Tap-to-call QR code. Place on business cards, flyers and menus so customers call with one scan.' },
  { emoji: '💸', name: 'UPI Payment', slug: 'upi', desc: 'Collect UPI payments via Google Pay, PhonePe, Paytm and all UPI apps. Ideal for shopkeepers and freelancers in India.' },
  { emoji: '🅿️', name: 'PayPal', slug: 'paypal', desc: 'Accept PayPal payments or donations by QR code. Share your PayPal.me link as a scannable code.' },
  { emoji: '₿', name: 'Cryptocurrency', slug: 'crypto', desc: 'Bitcoin, Ethereum and other crypto wallet address QR codes. Standard BIP-21 format.' },
  { emoji: '📅', name: 'Calendar Event', slug: 'event', desc: 'Add events to any calendar app by scanning. Encodes title, date, time, location and description.' },
  { emoji: '📍', name: 'Location / Maps', slug: 'geo', desc: 'Open a pinned location in Google Maps on scan. Perfect for restaurants, venues and storefronts.' },
  { emoji: '🍎', name: 'iOS App Store', slug: 'appstore', desc: 'Direct link to your iPhone app on the Apple App Store. Scan opens the app page instantly on any iPhone.' },
  { emoji: '🤖', name: 'Google Play Store', slug: 'playstore', desc: 'Direct link to your Android app on Google Play. Great for app marketing flyers and packaging.' },
  { emoji: '📊', name: 'Barcode QR', slug: 'barcode', desc: 'Encode barcode data (Code128, EAN, UPC) inside a QR code. Scan the QR to view the barcode on any device.' },
  { emoji: '🌐', name: 'Social Media', slug: 'social', desc: 'Twitter/X, Instagram, LinkedIn, Facebook, YouTube — create a QR code for any social media profile.' },
];

const FAQ_ITEMS = [
  {
    q: 'Is FreeQR completely free — no hidden fees?',
    a: 'Yes. FreeQR is 100% free with absolutely no hidden costs, no subscription plans, and no credit card required. Every QR code type, design option, and download format (PNG, SVG, JPG, PDF) is available to everyone at no charge.',
  },
  {
    q: 'Do I need to create an account or sign up?',
    a: 'No. FreeQR requires zero signup, no email, and no account creation. Open the website in any browser and start generating QR codes immediately — nothing blocks you from using the full tool.',
  },
  {
    q: 'Do the QR codes ever expire?',
    a: 'Never. FreeQR creates static QR codes that encode your data directly into the pattern. There is no server, no redirect, and no subscription keeping them alive — they work forever as long as the destination (e.g. your website) exists.',
  },
  {
    q: 'Are there watermarks on downloaded QR codes?',
    a: 'No watermarks at all. The PNG, SVG, JPG or PDF you download is completely clean — no logos, no watermarks, no attribution required. You own the QR code image outright.',
  },
  {
    q: 'Can I add my own logo to the QR code?',
    a: 'Yes. Switch to the Design tab and upload any PNG, JPG or SVG as the center logo. FreeQR also has a logo library with brand presets for WhatsApp, Instagram, YouTube, PayPal, Bitcoin and many more — all one-click.',
  },
  {
    q: 'What download formats are supported?',
    a: 'You can download your QR code as PNG (up to 4K resolution), SVG (infinitely scalable — best for print), JPG, or PDF. SVG is recommended for packaging, banners and signage because it never pixelates at any size.',
  },
  {
    q: 'How do I create a WiFi QR code?',
    a: 'Click "Change" → select WiFi. Enter your WiFi network name (SSID), the password, and choose the security type (WPA2 is most common). Your QR code appears instantly. Anyone who scans it connects automatically — no password typing needed.',
  },
  {
    q: 'Can I customise the colors and design?',
    a: 'Fully. The Design panel lets you set any foreground color, background color, or gradient. You can choose from four dot styles (Square, Rounded, Dots, Diamond), three eye corner styles (Square, Circle, Leaf), and add a custom logo with adjustable size.',
  },
  {
    q: 'Is my data private? Does FreeQR store my QR code data?',
    a: 'FreeQR is completely privacy-first. All QR code generation happens in your browser using JavaScript — your URLs, WiFi passwords, contact details and payment info are never sent to any server. Nothing is stored, logged or tracked.',
  },
  {
    q: 'Can I use FreeQR QR codes for commercial purposes?',
    a: 'Yes. QR codes generated by FreeQR can be used freely for any purpose — product packaging, business cards, marketing campaigns, menus, events, or resale in client projects. No attribution or license is required.',
  },
  {
    q: 'What is the difference between a static and dynamic QR code?',
    a: 'A static QR code (like FreeQR creates) encodes the data directly in the pattern. It never expires and needs no server. A dynamic QR code redirects through a server, which lets you change the destination later but requires a paid subscription and can expire. For most use cases, static is better.',
  },
  {
    q: 'How do I create a QR code for Instagram, LinkedIn or other social media?',
    a: 'Click "Change" → scroll to Social Media in the type selector. Enter your profile URL or handle. FreeQR auto-brands the QR code with the platform\'s color and logo for instant recognition.',
  },
];

const COMPARE = [
  { feature: '100% Free', freeqr: true, monkey: false, canva: false, qrio: false },
  { feature: 'No account required', freeqr: true, monkey: true, canva: false, qrio: false },
  { feature: 'No watermarks', freeqr: true, monkey: false, canva: false, qrio: false },
  { feature: 'SVG download (free)', freeqr: true, monkey: false, canva: false, qrio: false },
  { feature: 'Custom logo (free)', freeqr: true, monkey: false, canva: false, qrio: false },
  { feature: 'QR codes never expire', freeqr: true, monkey: true, canva: false, qrio: false },
  { feature: '15+ QR code types', freeqr: true, monkey: true, canva: false, qrio: true },
  { feature: 'Privacy-first (no server)', freeqr: true, monkey: false, canva: false, qrio: false },
  { feature: 'Batch CSV generator', freeqr: true, monkey: false, canva: false, qrio: false },
  { feature: 'UPI / PayPal / Crypto QR', freeqr: true, monkey: false, canva: false, qrio: false },
  { feature: 'UTM Builder tool', freeqr: true, monkey: false, canva: false, qrio: false },
  { feature: '4K resolution download', freeqr: true, monkey: false, canva: false, qrio: false },
];

const USE_CASES = [
  {
    icon: '🏪',
    title: 'Restaurants & Cafés',
    keyword: 'qr code for restaurant menu',
    desc: 'Link your digital menu, accept UPI/PayPal payments at the counter, and let customers connect to your WiFi — all with QR codes printed on table cards or receipts.',
  },
  {
    icon: '💼',
    title: 'Business Cards & Networking',
    keyword: 'qr code for business card',
    desc: 'Add a vCard QR code to your business card. When scanned, it instantly saves your name, phone, email and company to the contact list — no typing required.',
  },
  {
    icon: '📣',
    title: 'Marketing & Advertising',
    keyword: 'qr code for marketing campaign',
    desc: 'Put QR codes on flyers, banners, packaging and billboards. Use UTM parameters to track which offline campaigns drive the most website traffic.',
  },
  {
    icon: '🎪',
    title: 'Events & Conferences',
    keyword: 'qr code for events',
    desc: 'Share event details, add calendar invites by scanning, or collect contact info from attendees. Create WiFi QR codes for venue guest networks.',
  },
  {
    icon: '📦',
    title: 'Product Packaging',
    keyword: 'qr code for product packaging',
    desc: 'Link product pages, manuals, warranty registration, tutorial videos, or customer reviews. Download SVG for perfect print quality at any size.',
  },
  {
    icon: '🛒',
    title: 'E-Commerce & Payments',
    keyword: 'payment qr code generator',
    desc: 'Accept UPI, PayPal and crypto payments with a QR code on your checkout page, invoice, or storefront. No payment gateway setup required.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SEOSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [embedCopied, setEmbedCopied] = useState(false);

  const embedCode = `<a href="https://www.freeqr.world/" title="Free QR Code Generator — No Signup" rel="nofollow">
  <img src="https://www.freeqr.world/badge.svg" alt="FreeQR — Free QR Code Generator" width="160" height="40" />
</a>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  return (
    <div className="bg-[#F5F5F7] font-sans text-slate-900">

      {/* ─── TRUST BAR ──────────────────────────────────────────────────── */}
      <section aria-label="Key facts about FreeQR" className="bg-white border-t border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: '15+', label: 'QR Code Types' },
            { stat: '100%', label: 'Free — Always' },
            { stat: '0', label: 'Signup Required' },
            { stat: '∞', label: 'QR Code Expiry' },
          ].map(({ stat, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{stat}</span>
              <span className="text-sm text-slate-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HERO CONTENT ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Free · No Ads · No Watermark · No Expiry
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight mb-6">
          The Best Free QR Code<br className="hidden md:block" /> Generator — No Signup Needed
        </h2>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-10">
          FreeQR is a completely free QR code maker that supports 15+ types including URL, WiFi, vCard, WhatsApp, UPI, PayPal, Crypto, and Barcode. Download as PNG, SVG, JPG or PDF. No account, no watermark, no expiry — ever.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {['#free qr code', '#no signup', '#no watermark', '#no expiry', '#svg download', '#custom logo', '#wifi qr', '#upi payment', '#vcard qr'].map(tag => (
            <span key={tag} className="bg-white border border-slate-200 text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-default">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ─── QR TYPES GRID ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 md:pb-20" aria-labelledby="qr-types-heading">
        <div className="text-center mb-10">
          <h2 id="qr-types-heading" className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
            All QR Code Types — Completely Free
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            FreeQR supports more QR code types than any other free generator — no type is locked behind a paywall.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QR_TYPES.map(({ emoji, name, slug, desc }) => (
            <article key={slug} className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl" role="img" aria-label={name}>{emoji}</span>
                <h3 className="font-bold text-slate-900 text-base">{name} QR Code</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/60 py-16 md:py-20" aria-labelledby="how-to-heading">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 id="how-to-heading" className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              How to Create a Free QR Code in 4 Steps
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              No account needed. Generate, customise and download your QR code in under 60 seconds.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Choose QR Type', desc: 'Click "Change" on the Content panel and pick from 15+ types — URL, WiFi, vCard, WhatsApp, UPI, Barcode, and more.' },
              { step: '02', title: 'Enter Your Data', desc: 'Fill in your URL, WiFi password, contact details, or payment info. The QR code preview updates in real-time as you type.' },
              { step: '03', title: 'Customise Design', desc: 'Open the Design tab to change colors, add a logo, apply gradients, or switch to one of the auto-branded styles for instant visual identity.' },
              { step: '04', title: 'Download Free', desc: 'Hit Save. Choose PNG, SVG (best for print), JPG or PDF. No watermark, no signup, no waiting — your QR code is ready immediately.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-3">
                <span className="text-5xl font-black text-slate-100 select-none leading-none">{step}</span>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── KEY FEATURES ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20" aria-labelledby="features-heading">
        <div className="text-center mb-12">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Why FreeQR is the Best Free QR Code Generator
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Most "free" QR code generators have watermarks, require accounts, limit downloads, or expire your codes. FreeQR has none of those restrictions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '🔓',
              title: 'Zero Account Required',
              keyword: 'qr code generator no login',
              desc: 'Open FreeQR and start immediately. No email address, no password, no profile. The full tool is available without any registration.',
            },
            {
              icon: '💧',
              title: 'No Watermarks, Ever',
              keyword: 'qr code generator no watermark free',
              desc: 'Every downloaded QR code is completely clean. The PNG, SVG or PDF you save has no FreeQR branding, no attribution required, and no watermarks.',
            },
            {
              icon: '♾️',
              title: 'Static QR Codes That Never Expire',
              keyword: 'static qr code generator free',
              desc: 'Your QR code data is baked directly into the image — not stored on a server. No subscription means no "code expired" surprises.',
            },
            {
              icon: '🎨',
              title: 'Full Design Customisation',
              keyword: 'qr code generator with logo and colors',
              desc: 'Custom colors, gradients, dot styles (Square, Rounded, Dots, Diamond), eye styles (Square, Circle, Leaf), custom logo or brand presets — design freedom for free.',
            },
            {
              icon: '📐',
              title: 'SVG & 4K PNG Download',
              keyword: 'qr code generator svg download free',
              desc: 'Download print-ready SVG (infinite scale) or PNG at 1K, 2K or 4K resolution. PDF export also available for sending QR codes in documents.',
            },
            {
              icon: '🔒',
              title: 'Privacy-First — 100% Client-Side',
              keyword: 'private qr code generator no tracking',
              desc: 'All QR code generation runs locally in your browser. Your URLs, passwords, payment details and contact info are never uploaded to any server.',
            },
            {
              icon: '🗂️',
              title: 'Batch QR Generator from CSV',
              keyword: 'batch qr code generator csv free',
              desc: 'Need hundreds of QR codes? Upload a CSV file with your URLs or data and download a ZIP of all QR codes in seconds — no per-unit limits.',
            },
            {
              icon: '📊',
              title: 'UTM Builder + QR Code',
              keyword: 'utm qr code generator free',
              desc: 'Build complete UTM-tagged campaign URLs in the UTM Builder tool, then hit "Create QR Code" to turn any campaign link into a scannable code instantly.',
            },
            {
              icon: '📱',
              title: 'Works on All Devices',
              keyword: 'qr code generator online free mobile',
              desc: 'FreeQR is a responsive web app that works on desktop, tablet and mobile. No app download or installation required — just open your browser.',
            },
          ].map(({ icon, title, desc }) => (
            <article key={title} className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
              <span className="text-3xl block mb-3" role="img" aria-label={title}>{icon}</span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── COMPARISON TABLE ───────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/60 py-16 md:py-20" aria-labelledby="compare-heading">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 id="compare-heading" className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              FreeQR vs Other QR Code Generators
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              See why FreeQR is the top choice for users who want a free QR code generator with no signup and no watermarks.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
            <table className="w-full text-sm border-collapse" role="table" aria-label="QR code generator comparison">
              <thead>
                <tr className="bg-slate-50">
                  <th scope="col" className="text-left font-bold text-slate-700 px-5 py-4 border-b border-slate-200/60">Feature</th>
                  <th scope="col" className="text-center font-bold text-indigo-700 px-5 py-4 border-b border-slate-200/60 bg-indigo-50/50">
                    <span className="flex flex-col items-center gap-0.5">
                      <span>FreeQR</span>
                      <span className="text-[10px] font-semibold text-indigo-400 normal-case tracking-wide">freeqr.world</span>
                    </span>
                  </th>
                  <th scope="col" className="text-center font-semibold text-slate-500 px-5 py-4 border-b border-slate-200/60">QR Code<br/>Monkey</th>
                  <th scope="col" className="text-center font-semibold text-slate-500 px-5 py-4 border-b border-slate-200/60">Canva<br/>QR</th>
                  <th scope="col" className="text-center font-semibold text-slate-500 px-5 py-4 border-b border-slate-200/60">QR.io</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(({ feature, freeqr, monkey, canva, qrio }, i) => (
                  <tr key={feature} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-5 py-3.5 text-slate-700 font-medium border-b border-slate-100">{feature}</td>
                    <td className="px-5 py-3.5 text-center border-b border-slate-100 bg-indigo-50/30">
                      {freeqr ? <CheckIcon /> : <XIcon />}
                    </td>
                    <td className="px-5 py-3.5 text-center border-b border-slate-100">
                      {monkey ? <CheckIcon /> : <XIcon />}
                    </td>
                    <td className="px-5 py-3.5 text-center border-b border-slate-100">
                      {canva ? <CheckIcon /> : <XIcon />}
                    </td>
                    <td className="px-5 py-3.5 text-center border-b border-slate-100">
                      {qrio ? <CheckIcon /> : <XIcon />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">Comparison based on free tier features. Information accurate as of early 2026.</p>
        </div>
      </section>

      {/* ─── USE CASES ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20" aria-labelledby="usecases-heading">
        <div className="text-center mb-12">
          <h2 id="usecases-heading" className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
            QR Code Use Cases for Every Industry
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            From restaurants to e-commerce — FreeQR has the right QR code type for every need.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map(({ icon, title, desc }) => (
            <article key={title} className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
              <span className="text-4xl block mb-4" role="img" aria-label={title}>{icon}</span>
              <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/60 py-16 md:py-20" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 id="faq-heading" className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-lg">
              Everything you need to know about free QR code generation.
            </p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }, i) => (
              <div key={i} className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-slate-900 text-sm md:text-base">{q}</span>
                  <svg
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                    className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BACKLINK / EMBED SECTION ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20" aria-labelledby="link-heading">
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/60 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 id="link-heading" className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">
                Share FreeQR with Your Audience
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Found FreeQR useful? Share it with your blog readers, Twitter followers or community. We appreciate every mention — it helps us stay free for everyone.
              </p>
              <div className="space-y-3">
                {[
                  { platform: 'Twitter / X', color: 'bg-black text-white', text: '🐦 Share on X', url: 'https://twitter.com/intent/tweet?text=I%20found%20a%20completely%20free%20QR%20code%20generator%20%E2%80%94%20no%20signup%2C%20no%20watermarks%2C%20no%20expiry%21%20%F0%9F%94%97&url=https%3A%2F%2Fwww.freeqr.world%2F' },
                  { platform: 'LinkedIn', color: 'bg-[#0a66c2] text-white', text: '💼 Share on LinkedIn', url: 'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.freeqr.world%2F' },
                  { platform: 'WhatsApp', color: 'bg-[#25D366] text-white', text: '💬 Share on WhatsApp', url: 'https://wa.me/?text=Check%20out%20FreeQR%20%E2%80%94%20free%20QR%20code%20generator%20with%20no%20signup%20or%20watermarks%3A%20https%3A%2F%2Fwww.freeqr.world%2F' },
                ].map(({ platform, color, text, url }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold mr-3 mb-2 ${color} hover:opacity-90 transition-opacity`}
                    aria-label={`Share FreeQR on ${platform}`}
                  >
                    {text}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Embed a Link on Your Website</h3>
              <p className="text-sm text-slate-500 mb-4">
                Copy and paste this HTML snippet to add a link to FreeQR on your blog or website:
              </p>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed mb-3 overflow-x-auto">
                <pre>{`<a href="https://www.freeqr.world/" \n   title="Free QR Code Generator">\n  Free QR Code Generator — FreeQR\n</a>`}</pre>
              </div>
              <button
                onClick={copyEmbed}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${embedCopied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {embedCopied ? (
                  <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> Copied!</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="white" strokeWidth="1.4"/><path d="M2 9.5V2.5h7" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg> Copy HTML</>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400" role="contentinfo">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="6" height="6" rx="1" fill="white"/>
                    <rect x="10" y="2" width="6" height="6" rx="1" fill="white"/>
                    <rect x="2" y="10" width="6" height="6" rx="1" fill="white"/>
                    <rect x="10" y="10" width="3" height="3" rx="0.5" fill="white"/>
                    <rect x="15" y="10" width="1" height="6" rx="0.5" fill="white"/>
                    <rect x="10" y="15" width="6" height="1" rx="0.5" fill="white"/>
                  </svg>
                </div>
                <span className="text-white font-bold text-lg tracking-tight">FreeQR</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                The best free QR code generator online. No signup, no ads, no watermarks, no expiry. Generate QR codes for URL, WiFi, vCard, WhatsApp, UPI, PayPal, Crypto and 15+ types. Download as PNG, SVG, JPG or PDF.
              </p>
              <p className="text-xs text-slate-600">
                Free QR Code Generator · QR Code Maker · WiFi QR Code · vCard QR · UPI QR Code · Batch QR Generator
              </p>
            </div>

            {/* QR Types column */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">QR Code Types</h4>
              <ul className="space-y-2 text-sm" role="list">
                {['URL / Website', 'WiFi Network', 'vCard Contact', 'WhatsApp', 'UPI Payment', 'Email', 'SMS', 'Phone'].map(t => (
                  <li key={t}>
                    <span className="hover:text-white transition-colors cursor-default">{t} QR Code</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools column */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Free Tools</h4>
              <ul className="space-y-2 text-sm" role="list">
                {[
                  'QR Code Generator',
                  'Barcode Generator',
                  'UTM Builder',
                  'Batch QR from CSV',
                  'QR Code Scanner',
                  'Image to WebP',
                  'Mesh Gradient Generator',
                  'WhatsApp Link Generator',
                ].map(t => (
                  <li key={t}>
                    <span className="hover:text-white transition-colors cursor-default">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 text-center md:text-left">
              © {new Date().getFullYear()} FreeQR.world — Free QR Code Generator. All rights reserved. All QR code generation happens locally in your browser — your data is never uploaded or stored.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <a href="https://www.freeqr.world/" className="hover:text-white transition-colors" rel="nofollow">Home</a>
              <span className="text-slate-700">·</span>
              <a href="https://www.freeqr.world/sitemap.xml" className="hover:text-white transition-colors" rel="nofollow">Sitemap</a>
              <span className="text-slate-700">·</span>
              <a href="https://www.freeqr.world/llms.txt" className="hover:text-white transition-colors" rel="nofollow">llms.txt</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
