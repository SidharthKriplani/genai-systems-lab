import { useState } from 'react';
import { companyDomain } from './companyDomains.js';

// Small, rounded company logo. Resolves a domain via companyDomain() and renders
// the Google favicon service. On any load error (or when no domain exists),
// it falls back to a themed initial badge.
//
// Props:
//   company — the canonical company name
//   size    — square px size for the logo / badge (default 20)
//
// Adopted from HQ/shared/CompanyLogo.jsx.
export function CompanyLogo({ company, size = 20 }) {
  const [failed, setFailed] = useState(false);
  const domain = companyDomain(company);

  const initial = (String(company || '').trim()[0] || '?').toUpperCase();
  const badge = (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, flexShrink: 0,
        borderRadius: Math.max(3, Math.round(size * 0.22)) + 'px',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.45)', fontWeight: 700,
        fontSize: Math.max(9, Math.round(size * 0.5)) + 'px', lineHeight: 1,
        overflow: 'hidden',
      }}
    >
      {initial}
    </span>
  );

  if (!domain || failed) return badge;

  return (
    <img
      src={'https://www.google.com/s2/favicons?domain=' + domain + '&sz=64'}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: Math.max(3, Math.round(size * 0.22)) + 'px',
        objectFit: 'cover', display: 'inline-block',
        background: 'rgba(255,255,255,0.08)',
      }}
    />
  );
}
