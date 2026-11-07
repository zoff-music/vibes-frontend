import {
  type CompiledRule,
  type CompiledSheet,
  compileSheet,
  encodePlan,
} from 'beasties/compiler';
import type { Plugin } from 'vite';
import { criticalCssPlanFile } from './criticalCss.ts';

// States and transitions cannot be visible before the full stylesheet replaces the critical subset.
// Focus states can, when the document autofocuses a control, so a second plan keeps them.
const interactiveSelector = /:(?:hover|active)\b|::view-transition/;
const focusSelector = /:focus(?:-visible|-within)?\b/;
const interactiveWrapper = /hover:hover/;
// Transition utilities go together: keeping a duration without its property would animate `all`.
// The `transition` shorthand stays, so guards such as `transition:none` still apply.
// `view-transition-name` and `will-change` stay: both create stacking contexts that change painting.
const nonPaintBody =
  /^\{(?:(?:transition-(?:property|duration|timing-function|delay|behavior)|--tw-(?:duration|ease)):[^;]*;?)+\}$/;

function isInteractive(selector: string, focus: boolean) {
  return (
    interactiveSelector.test(selector) ||
    (!focus && focusSelector.test(selector))
  );
}

function paintRule(rule: CompiledRule, focus: boolean): CompiledRule | null {
  if (rule.wrap?.some((wrapper) => interactiveWrapper.test(wrapper))) {
    return null;
  }

  if (rule.css) {
    const prelude = rule.css.slice(0, rule.css.indexOf('{'));
    return isInteractive(prelude, focus) ? null : rule;
  }

  if (!rule.selectors) return rule;
  if (rule.body && nonPaintBody.test(rule.body)) return null;

  const kept = rule.selectors.flatMap((selector, index) =>
    isInteractive(selector, focus)
      ? []
      : [{ selector, match: rule.match?.[index] }],
  );
  if (kept.length === 0) return null;
  if (kept.length === rule.selectors.length) return rule;

  return {
    ...rule,
    selectors: kept.map(({ selector }) => selector),
    // `match` is parallel to `selectors` whenever it is present.
    ...(rule.match && {
      match: kept.flatMap(({ match }) => (match ? [match] : [])),
    }),
  };
}

// The inline subset must fix cascade layer order before the full stylesheet declares more layers.
function layerOrder(css: string) {
  const names = new Set<string>();
  for (const [, list] of css.matchAll(
    /@layer ([\w-]+(?:,\s*[\w-]+)*)\s*[;{]/g,
  )) {
    for (const name of list?.split(',') ?? []) names.add(name.trim());
  }

  return names.size > 0 ? `@layer ${[...names].join(',')};` : '';
}

// Beasties drops rules whose whole selector is `:where(...)`, such as Tailwind's `space-*` and
// `divide-*`. Compile the inner selector so it can be matched, then restore `:where()` so the
// inline rule keeps its zero specificity.
function unwrapWhere(css: string) {
  const wrapped = new Set<string>();
  let output = '';
  let index = 0;
  let start = css.indexOf(':where(');
  while (start !== -1) {
    let depth = 0;
    let end = start + ':where'.length;
    for (; end < css.length; end++) {
      if (css[end] === '(') depth++;
      if (css[end] === ')' && --depth === 0) break;
    }
    const before = css.slice(0, start).trimEnd().at(-1);
    const after = css[end + 1];
    const standalone =
      (before === undefined || '{};,'.includes(before)) &&
      (after === '{' || after === ',');
    if (standalone) {
      const inner = css.slice(start + ':where('.length, end);
      wrapped.add(inner);
      output += css.slice(index, start) + inner;
    } else {
      output += css.slice(index, end + 1);
    }
    index = end + 1;
    start = css.indexOf(':where(', index);
  }

  return { css: output + css.slice(index), wrapped };
}

function restoreWhere(rule: CompiledRule, wrapped: Set<string>): CompiledRule {
  const restore = (selector: string) =>
    wrapped.has(selector) ? `:where(${selector})` : selector;

  if (rule.selectors) {
    return { ...rule, selectors: rule.selectors.map(restore) };
  }
  if (!rule.css) return rule;

  const open = rule.css.indexOf('{');
  const prelude = rule.css.slice(0, open);
  return wrapped.has(prelude)
    ? { ...rule, css: restore(prelude) + rule.css.slice(open) }
    : rule;
}

function compilePaintSheet(source: string, href: string) {
  const { css, wrapped } = unwrapWhere(source);
  const sheet = compileSheet(css, { href });
  const paint = (focus: boolean): CompiledSheet => ({
    ...sheet,
    rules: sheet.rules.flatMap((rule) => {
      const kept = paintRule(rule, focus);
      return kept ? [restoreWhere(kept, wrapped)] : [];
    }),
  });

  return { plan: encodePlan(paint(false)), focusPlan: encodePlan(paint(true)) };
}

/** Compiles emitted stylesheets into the plan read by `createCriticalCss()`. */
export function criticalCss(): Plugin {
  let base = '/';

  return {
    name: 'vibes-critical-css',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    generateBundle(_options, bundle) {
      const sheets = Object.values(bundle).flatMap((asset) =>
        asset.type === 'asset' && asset.fileName.endsWith('.css')
          ? [{ fileName: asset.fileName, source: String(asset.source) }]
          : [],
      );
      if (sheets.length === 0) return;

      const layers = sheets.map((asset) => layerOrder(asset.source)).join('');
      const compiled = sheets.map((asset) =>
        compilePaintSheet(asset.source, `${base}${asset.fileName}`),
      );
      const plans = compiled.map(({ plan }) => plan);
      const focusPlans = compiled.map(({ focusPlan }) => focusPlan);

      this.emitFile({
        type: 'asset',
        fileName: criticalCssPlanFile,
        source: JSON.stringify({ layers, plans, focusPlans }),
      });
    },
  };
}
