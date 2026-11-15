import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReadAloudProvider } from "../../apps/demo/src/read-aloud/ReadAloudProvider";
import { ReadAloudPanel } from "../../apps/demo/src/read-aloud/ReadAloudPanel";
import type { ReadAloudLocale } from "../../apps/demo/src/read-aloud/messages";

/**
 * Renders the read-aloud panel in its open state without a browser. The
 * accessibility audit can then inspect labels, landmarks, fieldsets, and
 * controls that are normally hidden behind the launcher.
 */
export function renderReadAloudPanel(locale: ReadAloudLocale = "en"): string {
  return renderToStaticMarkup(
    <ReadAloudProvider locale={locale}>
      <ReadAloudPanel locale={locale} initialOpen />
    </ReadAloudProvider>
  );
}
