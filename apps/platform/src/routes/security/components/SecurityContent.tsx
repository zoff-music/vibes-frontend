import {
  LegalDocument,
  LegalSection,
} from '../../../components/legal/LegalDocument';

interface SecurityContentProps {
  securityEmail: string;
}

export function SecurityContent({ securityEmail }: SecurityContentProps) {
  return (
    <LegalDocument
      description="This policy explains how to report a potential security vulnerability in Zoff and the rules for good-faith security research."
      title="Security Policy"
      updatedAt="25 July 2026"
    >
      <LegalSection title="Reporting a vulnerability">
        <p>
          If you believe you have found a security vulnerability in Zoff, email{' '}
          <a
            className="text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-theme"
            href={`mailto:${securityEmail}`}
          >
            {securityEmail}
          </a>
          . Include a clear description, the affected URL or component,
          reproducible steps, potential impact, and any supporting evidence that
          does not expose personal or confidential data.
        </p>
        <p>
          Please report vulnerabilities privately and allow a reasonable amount
          of time for investigation and remediation before making information
          public.
        </p>
      </LegalSection>

      <LegalSection title="Good-faith research">
        <p>When investigating or reporting a potential vulnerability:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Test only accounts, rooms, and data that you own or control.</li>
          <li>
            Use the minimum interaction needed to demonstrate the issue, and
            stop once the vulnerability is confirmed.
          </li>
          <li>
            Do not access, copy, retain, alter, destroy, or disclose another
            person&apos;s data.
          </li>
          <li>
            Do not perform denial-of-service testing, automated high-volume
            scanning, social engineering, phishing, spam, physical attacks, or
            attacks against third-party providers.
          </li>
          <li>
            Do not disrupt Zoff, bypass rate limits, establish persistence, or
            use a vulnerability for any purpose beyond reporting it.
          </li>
        </ul>
        <p>
          Zoff will not pursue action against research performed in good faith
          and in accordance with this policy. This does not authorize activity
          that is unlawful, harmful, outside the listed scope, or inconsistent
          with third-party terms.
        </p>
      </LegalSection>

      <LegalSection title="Scope">
        <p>
          This policy covers the public Zoff service at zoff.me and the
          open-source Zoff repositories maintained by the Zoff Music
          organization. Third-party services, music providers, hosting
          providers, and accounts or systems belonging to other people are
          outside scope.
        </p>
      </LegalSection>

      <LegalSection title="No bug bounty">
        <p>
          Zoff does not operate a bug-bounty program and does not offer or
          promise payment, rewards, compensation, gifts, or public recognition
          for vulnerability reports. Submitting a report does not create a
          contract or entitlement to compensation.
        </p>
      </LegalSection>

      <LegalSection title="Response">
        <p>
          Zoff will make a reasonable effort to acknowledge actionable reports,
          investigate them, and keep the reporter informed when practical.
          Response times and remediation timelines are not guaranteed.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
