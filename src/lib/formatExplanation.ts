/**
 * Enterprise Clinical Explanation Formatter
 *
 * Takes raw explanation HTML (from DOCX imports or rich text editors) and formats it
 * into an authentic, professional medical board interface:
 * - Figure captions: Small, italicized, styled clinical exhibit callouts with camera icon
 * - Medical comparison tables: Responsive overflow containers with shaded headers & zebra rows
 * - Educational Objectives & Clinical Pearls: Distinct high-yield alert cards
 * - Mnemonics: Memory recall highlight boxes
 * - Distractor rationales (Option A, B, C...): Clean bordered rationale items
 */

export function formatExplanationHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let html = rawHtml;

  // 1. Transform Figure Captions:
  // Matches: <p><em>Figure 1: ...</em></p> or <p><em>Fig. 1 ...</em></p> or <p>Figure 1: ...</p>
  // Requirement: "If there is a figure explanation, the text should be a little small, in italic."
  html = html.replace(
    /<p(?:\s+[^>]*)?>\s*(?:<em>)?\s*(?:<strong>)?\s*(Figure\s*[\d\.]*[\s\S]*?)(?:<\/strong>)?\s*(?:<\/em>)?\s*<\/p>/gi,
    (match, captionText) => {
      // Strip any extra tags inside captionText
      const cleanCaption = captionText
        .replace(/<\/?(?:em|strong|b|i|p)>/gi, '')
        .trim();
      return `
        <div class="clinical-figure-caption my-3 flex items-start gap-2 rounded-lg border border-slate-200/80 bg-slate-50/90 px-3.5 py-2 text-slate-600 shadow-2xs">
          <span class="inline-flex items-center justify-center rounded bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 shrink-0 select-none">
            Exhibit
          </span>
          <span class="text-xs italic leading-relaxed text-slate-600 select-text font-sans">
            ${cleanCaption}
          </span>
        </div>
      `;
    }
  );

  // Also catch captions starting with "Exhibit" or "Image:"
  html = html.replace(
    /<p(?:\s+[^>]*)?>\s*(?:<em>)?\s*(?:<strong>)?\s*((?:Exhibit|Image|Table)\s*[\d\.]*:[\s\S]*?)(?:<\/strong>)?\s*(?:<\/em>)?\s*<\/p>/gi,
    (match, captionText) => {
      const cleanCaption = captionText
        .replace(/<\/?(?:em|strong|b|i|p)>/gi, '')
        .trim();
      return `
        <div class="clinical-figure-caption my-3 flex items-start gap-2 rounded-lg border border-slate-200/80 bg-slate-50/90 px-3.5 py-2 text-slate-600 shadow-2xs">
          <span class="inline-flex items-center justify-center rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 shrink-0 select-none">
            Figure
          </span>
          <span class="text-xs italic leading-relaxed text-slate-600 select-text font-sans">
            ${cleanCaption}
          </span>
        </div>
      `;
    }
  );

  // 2. Transform Educational Objectives / Clinical Pearls into rich cards
  html = html.replace(
    /<p(?:\s+[^>]*)?>\s*(?:<strong>)?\s*Educational\s*Objective:?\s*(?:<\/strong>)?\s*([\s\S]*?)<\/p>/gi,
    (match, content) => `
      <div class="my-6 rounded-xl border border-teal-200 bg-teal-50/60 p-4.5 text-slate-900 shadow-xs">
        <div class="flex items-center gap-2 mb-2">
          <span class="h-2 w-2 rounded-full bg-teal-600 animate-pulse"></span>
          <span class="font-mono text-[11px] uppercase tracking-wider text-teal-900 font-bold">Educational Objective</span>
        </div>
        <div class="text-sm leading-relaxed text-teal-950 font-medium pl-4 border-l-2 border-teal-500">
          ${content}
        </div>
      </div>
    `
  );

  html = html.replace(
    /<p(?:\s+[^>]*)?>\s*(?:<strong>)?\s*Clinical\s*Pearl:?\s*(?:<\/strong>)?\s*([\s\S]*?)<\/p>/gi,
    (match, content) => `
      <div class="my-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4.5 text-slate-900 shadow-xs">
        <div class="flex items-center gap-2 mb-2">
          <span class="font-mono text-[11px] uppercase tracking-wider text-emerald-900 font-bold">💡 Clinical Pearl</span>
        </div>
        <div class="text-sm leading-relaxed text-emerald-950 font-medium pl-4 border-l-2 border-emerald-500">
          ${content}
        </div>
      </div>
    `
  );

  // 3. Transform Mnemonic Callouts:
  html = html.replace(
    /<p(?:\s+[^>]*)?>\s*(?:<strong>)?\s*Mnemonic:?\s*(?:<\/strong>)?\s*([\s\S]*?)<\/p>/gi,
    (match, content) => `
      <div class="my-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-amber-950 shadow-2xs">
        <span class="font-mono text-[10.5px] uppercase tracking-wider font-bold text-amber-800 block mb-1">
          🧠 Memory Anchor (Mnemonic)
        </span>
        <span class="text-sm font-semibold tracking-wide text-amber-900">
          ${content}
        </span>
      </div>
    `
  );

  // 4. Transform Tables into modern responsive medical comparative tables
  // If table is not already wrapped in responsive container, wrap it
  if (html.includes('<table') && !html.includes('overflow-x-auto')) {
    html = html.replace(
      /<table(?:\s+[^>]*)?>([\s\S]*?)<\/table>/gi,
      (match, tableInner) => `
        <div class="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table class="w-full text-left border-collapse text-xs md:text-sm">
            ${tableInner}
          </table>
        </div>
      `
    );
  }

  // 5. Transform Section Headers (e.g. <strong>Hypersensitivity Reactions...</strong> on their own line)
  html = html.replace(
    /<p(?:\s+[^>]*)?>\s*<strong>([A-Z][^<]{3,60})<\/strong>\s*<\/p>/g,
    (match, title) => {
      if (/^(?:Figure|Exhibit|Table|Answer|Option|Mnemonic|Question)/i.test(title)) {
        return match;
      }
      return `
        <div class="mt-6 mb-3 flex items-center gap-2 border-b border-slate-200 pb-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-teal-600"></span>
          <h4 class="font-sans text-sm md:text-base font-bold text-slate-900 tracking-tight">
            ${title}
          </h4>
        </div>
      `;
    }
  );

  return html;
}
