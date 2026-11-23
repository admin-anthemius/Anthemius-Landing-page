"use client";

// LegalDialog — shows one legal document in place.
//
// A dialog rather than a route: these links sit inside the sign-up flow, and
// navigating away from a half-filled form to read ten pages loses the form.
// Opening over it means the user closes the dialog and carries on where they
// were.
//
// The two documents are separate. Each link opens its own dialog showing only
// that document — there is no tab or control to switch between them, because
// agreeing to one is not agreeing to the other and the UI should not blur that.
//
// Each document is the original signed PDF, rendered by the browser's own
// viewer. Nothing is added around it: no effective date, no contact details,
// no version banner, no summary. The PDF is the artefact that was actually
// executed, so it is shown as-is.
import { useEffect, useState } from "react";
import styles from "./LegalDialog.module.css";

export type LegalDocId = "privacy" | "terms";

/**
 * Where each document lives.
 *
 * Paths point into public/, so Next.js serves them as real static files: a
 * missing path is a genuine 404, not an app route. The filename carries the
 * document version (LV310726) instead of a content hash, so a re-issue is a
 * new URL rather than a silently swapped file sitting behind a cache.
 */
const DOCS: Record<LegalDocId, { title: string; pdf: string }> = {
  privacy: { title: "PRIVACY POLICY", pdf: "/legal/privacy-policy-LV310726.pdf" },
  terms: { title: "TERMS OF USE", pdf: "/legal/terms-of-use-LV310726.pdf" },
};

interface Props {
  /** Which document to show, or null to close. */
  doc: LegalDocId | null;
  onClose: () => void;
}

export function LegalDialog({ doc, onClose }: Props) {
  const active = doc ? DOCS[doc] : null;

  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, onClose]);

  if (!doc || !active) return null;

  // #toolbar=0&navpanes=0 asks the browser's built-in PDF viewer to drop its
  // chrome, which is where the download and print buttons live.
  //
  // This is presentation, not protection. The file sits at a public URL under
  // public/, so anyone who opens devtools or types the path can fetch it —
  // and the fragment is a viewer hint that some embedded viewers ignore
  // outright. It removes the obvious one-click download for an ordinary
  // reader; it does not and cannot prevent one.
  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.dialog}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={active.title}
      >
        <div className={styles.head}>
          <h2 className={styles.title}>{active.title}</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Right-click is suppressed for the same reason as the toolbar flags:
            it removes "Save as…" from the common path. Same caveat applies. */}
        <div className={styles.pdfWrap} onContextMenu={(e) => e.preventDefault()}>
          {/* Keyed by pdf so switching documents mounts a fresh instance —
              each one starts at "checking" on its own rather than needing an
              effect to reset state left over from the previous document. */}
          <PdfPane key={active.pdf} pdf={active.pdf} title={active.title} />
        </div>

        <div className={styles.actions}>
          <button className={styles.btn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Confirms the URL really serves a PDF before handing it to an <iframe>,
// rather than trusting a bare 200. Checking content-type (not just r.ok) is
// the point: a 200 with the wrong content-type still means the expected file
// isn't there. Mounted fresh per `pdf` (see the `key` at the call site), so
// "checking" is just its initial state rather than something an effect has
// to reset — the effect here only ever calls setStatus from its async
// callbacks, never synchronously in the body.
function PdfPane({ pdf, title }: { pdf: string; title: string }) {
  const [status, setStatus] = useState<"checking" | "ready" | "missing">("checking");

  useEffect(() => {
    let cancelled = false;
    fetch(pdf, { method: "HEAD" })
      .then((r) => {
        const isPdf = r.ok && (r.headers.get("content-type") ?? "").toLowerCase().includes("pdf");
        if (!cancelled) setStatus(isPdf ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [pdf]);

  if (status === "ready") {
    return (
      <iframe
        className={styles.pdf}
        src={`${pdf}#toolbar=0&navpanes=0&statusbar=0&view=FitH`}
        title={title}
      />
    );
  }

  if (status === "checking") {
    return <p className={styles.note}>Loading…</p>;
  }

  // Says the document is unavailable rather than pretending it is merely
  // slow — a spinner that never resolves hides the fact that a legal
  // document isn't being shown.
  return <p className={styles.note}>This document is not available yet.</p>;
}

/**
 * Wiring helper: gives you the dialog element plus an `open` function, so a
 * screen adds two lines instead of managing its own state.
 *
 * One dialog instance serves both documents, but only ever shows the one
 * that was opened — `open("terms")` and `open("privacy")` are independent
 * entry points with no way to cross from one to the other.
 */
export function useLegalDialog() {
  const [doc, setDoc] = useState<LegalDocId | null>(null);
  return {
    open: (which: LegalDocId) => setDoc(which),
    dialog: <LegalDialog doc={doc} onClose={() => setDoc(null)} />,
  };
}
