'use client';

export function PageHeader() {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Salary Navigator</p>
        <h1>Understand your compensation arc at a glance.</h1>
      </div>
      <p className="description">
        Capture each compensation update, compare it against your band, and surface the insights that power smarter salary
        conversations.
      </p>
      <style jsx>{`
        .page-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2.4rem;
        }

        .eyebrow {
          font-size: 0.85rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(148, 163, 184, 0.75);
        }

        h1 {
          font-size: clamp(1.75rem, 5vw, 2.6rem);
          line-height: 1.2;
          color: #f8fafc;
        }

        .description {
          color: rgba(226, 232, 240, 0.75);
          font-size: 1rem;
          max-width: 60ch;
        }
      `}</style>
    </header>
  );
}
