import { Link } from '@landing/router';
import { ArrowLeft, ArrowRight, FileCheck2, Scale } from 'lucide-react';
import { useEffect } from 'react';

export function TermsOfUse() {
  useEffect(() => {
    document.title = 'Terms of Use — Node-Blank';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <article className="mx-auto max-w-3xl px-4 pt-24 pb-20 sm:px-6 sm:pt-28">
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 font-mono text-xs text-muted">
        <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-fg">
          <ArrowLeft className="size-3" />
          <span>Home</span>
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-fg">Terms of Use</span>
      </nav>

      {/* Header */}
      <header className="mb-10 border-b border-line pb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 font-mono text-[11px] text-muted">
            <FileCheck2 className="size-3 text-accent" />
            ASD-STE100 Compliant
          </span>
          <span className="font-mono text-[11px] text-muted">Updated: October 20, 2026</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          Node-Blank Terms of Use
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          We write these terms in Simplified Technical English (ASD-STE100). The sentences are direct, active,
          and unambiguous.
        </p>

        {/* Quick Summary Callout */}
        <div className="mt-6 rounded-xl border border-line bg-surface-2/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
              <Scale className="size-4" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-fg">Summary in Plain Words</p>
              <p className="text-muted leading-relaxed">
                Node-Blank is open-source software under the AGPLv3 license. We provide the software without
                warranties. You control your data and you must maintain your own backups.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Terms Sections */}
      <div className="space-y-10 text-[15px] leading-relaxed text-fg">
        {/* Section 1 */}
        <section aria-labelledby="section-agreement" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">01</span>
            <h2 id="section-agreement" className="font-display text-xl font-semibold tracking-tight text-fg">
              Agreement to Terms
            </h2>
          </div>
          <p className="text-muted">
            These terms govern your access to the Node-Blank application and website.
          </p>
          <p className="text-muted">When you use Node-Blank, you accept these terms.</p>
          <p className="text-muted">If you do not accept these terms, do not use the software.</p>
        </section>

        {/* Section 2 */}
        <section aria-labelledby="section-license" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">02</span>
            <h2 id="section-license" className="font-display text-xl font-semibold tracking-tight text-fg">
              Software License
            </h2>
          </div>
          <p className="text-muted">Node-Blank is free and open-source software.</p>
          <p className="text-muted">
            The authors publish the source code under the GNU Affero General Public License (AGPLv3).
          </p>
          <p className="text-muted">
            You can inspect, copy, modify, and distribute the source code under AGPLv3 terms.
          </p>
          <p className="text-muted">
            You can read the complete license text in our official GitHub repository.
          </p>
          <p className="text-muted">Nothing in these terms limits your rights under the AGPLv3 license.</p>
        </section>

        {/* Section 3 */}
        <section aria-labelledby="section-warranty" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">03</span>
            <h2 id="section-warranty" className="font-display text-xl font-semibold tracking-tight text-fg">
              Disclaimer of Warranty ("As-Is" Provision)
            </h2>
          </div>
          <p className="text-muted">
            The authors provide the software "as is", without warranty of any kind.
          </p>
          <p className="text-muted">You use this software at your own risk.</p>
          <p className="text-muted">The authors do not make these guarantees:</p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-muted">
            <li>The software meets your specific operational needs.</li>
            <li>The software operates without interruptions, errors, or bugs.</li>
            <li>The software is compatible with all hardware and operating systems.</li>
            <li>The software prevents all data loss or data corruption.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section aria-labelledby="section-liability" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">04</span>
            <h2 id="section-liability" className="font-display text-xl font-semibold tracking-tight text-fg">
              Limitation of Liability
            </h2>
          </div>
          <p className="text-muted">
            The authors and contributors are not liable for any damages that result from your use of the
            software.
          </p>
          <p className="text-muted">This limitation applies to these conditions:</p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-muted">
            <li>Loss of canvas notes, calculations, or stored files.</li>
            <li>Loss of business revenue, profits, or productivity.</li>
            <li>Computer failure, hardware damage, or software conflicts.</li>
            <li>Security breaches that result from lost passwords or exposed API keys.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section aria-labelledby="section-responsibility" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">05</span>
            <h2
              id="section-responsibility"
              className="font-display text-xl font-semibold tracking-tight text-fg"
            >
              User Responsibilities
            </h2>
          </div>
          <p className="text-muted">You are responsible for your own data and operational security.</p>
          <p className="text-muted">You must follow these practices:</p>
          <ul className="list-inside list-disc space-y-2 pl-2 text-muted">
            <li>
              <strong className="text-fg">Create regular backups:</strong> Export your canvas data to JSON
              files frequently.
            </li>
            <li>
              <strong className="text-fg">Store backups safely:</strong> Keep your backup files on independent
              physical drives or trusted cloud services.
            </li>
            <li>
              <strong className="text-fg">Protect your passwords:</strong> Store your encryption passwords in
              a secure password manager.
            </li>
            <li>
              <strong className="text-fg">Protect your API keys:</strong> Do not share your sync credentials
              or third-party AI keys.
            </li>
          </ul>
          <p className="text-muted">
            We cannot recover lost data or lost passwords because we do not store your keys.
          </p>
        </section>

        {/* Section 6 */}
        <section aria-labelledby="section-acceptable" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">06</span>
            <h2 id="section-acceptable" className="font-display text-xl font-semibold tracking-tight text-fg">
              Acceptable Use
            </h2>
          </div>
          <p className="text-muted">You agree to use Node-Blank in a lawful manner.</p>
          <p className="text-muted">You agree not to perform these prohibited actions:</p>
          <ul className="list-inside list-disc space-y-1.5 pl-2 text-muted">
            <li>Use the software to violate local, national, or international laws.</li>
            <li>Attack, disrupt, or overload our website infrastructure or hosting providers.</li>
            <li>Attempt to gain unauthorized access to our systems or user accounts.</li>
            <li>Transmit malicious code, viruses, or spam through project communication channels.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section aria-labelledby="section-changes" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">07</span>
            <h2 id="section-changes" className="font-display text-xl font-semibold tracking-tight text-fg">
              Changes to Terms
            </h2>
          </div>
          <p className="text-muted">
            We modify these terms when software features or legal requirements change.
          </p>
          <p className="text-muted">We post new versions on this page with an updated revision date.</p>
          <p className="text-muted">
            Your continued use of Node-Blank after updates indicates your agreement to the updated terms.
          </p>
        </section>

        {/* Section 8 */}
        <section aria-labelledby="section-contact" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-accent">08</span>
            <h2 id="section-contact" className="font-display text-xl font-semibold tracking-tight text-fg">
              Contact
            </h2>
          </div>
          <p className="text-muted">
            For questions about these terms, open an issue in our GitHub repository.
          </p>
        </section>
      </div>

      {/* Bottom Navigation Box */}
      <footer className="mt-14 border-t border-line pt-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-sm font-semibold text-fg">Related Document</p>
            <p className="text-xs text-muted">Read our data collection and privacy commitments.</p>
          </div>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3.5 py-2 text-xs font-medium text-fg transition-colors hover:bg-line hover:text-accent"
          >
            <span>Read Privacy Policy</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </footer>
    </article>
  );
}
