import { classNames } from '@vibes/shared';
import { ArrowRightIcon, LinkButton, SearchIcon } from '@vibes/ui/web';
import { useState } from 'preact/compat';
import { SitePage } from '../../../components/layout/SitePage';
import { faqTopics } from '../../../seo/pages/faq';
import { FaqItem } from './FaqItem';

function matches(query: string, text: string) {
  return text.toLowerCase().includes(query);
}

export function FaqPage() {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const topics = faqTopics
    .map((topic) => ({
      ...topic,
      questions: term
        ? topic.questions.filter(
            (item) =>
              matches(term, item.question) || matches(term, item.answer),
          )
        : topic.questions,
    }))
    .filter((topic) => topic.questions.length > 0);
  const total = topics.reduce((sum, topic) => sum + topic.questions.length, 0);

  return (
    <SitePage>
      <header className="mx-auto max-w-3xl pt-12 pb-10 text-center sm:pt-20 sm:pb-14">
        <h1 className="font-pixel text-4xl leading-tight tracking-tight normal-case sm:text-5xl">
          Questions, answered
        </h1>
        <p className="text-theme-muted mx-auto mt-5 max-w-xl leading-relaxed sm:text-lg">
          Everything about listening and watching together on Zoff: rooms, the
          shared queue, settings and devices.
        </p>
        <search className="mx-auto mt-8 block max-w-xl">
          <label htmlFor="faq-search" className="sr-only">
            Search questions
          </label>
          <div className="border-theme bg-theme-surface focus-within:border-secondary focus-within:ring-secondary/30 flex h-14 items-center gap-3 rounded-full border px-5 transition-shadow focus-within:ring-2">
            <SearchIcon
              aria-hidden="true"
              className="text-theme-muted size-5 shrink-0"
            />
            <input
              id="faq-search"
              type="search"
              value={query}
              onInput={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search, e.g. “remote” or “playlist”"
              autoComplete="off"
              className="text-theme placeholder:text-theme-subtle h-full min-w-0 flex-1 bg-transparent text-base focus:outline-none"
            />
          </div>
          <p role="status" className="text-theme-muted mt-3 text-sm">
            {term
              ? `${total} ${total === 1 ? 'answer' : 'answers'} for “${query.trim()}”`
              : ''}
          </p>
        </search>
      </header>

      <div className="grid gap-10 pb-16 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
        <nav
          aria-label="FAQ topics"
          className="lg:sticky lg:top-6 lg:self-start"
        >
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {faqTopics.map((topic) => {
              const visible = topics.find((item) => item.id === topic.id);

              return (
                <li key={topic.id}>
                  <a
                    href={`#${topic.id}`}
                    className={classNames(
                      'flex min-h-11 items-center justify-between gap-3 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:rounded-xl lg:border-transparent',
                      visible
                        ? 'border-theme text-theme hover:bg-theme-surface'
                        : 'pointer-events-none border-theme text-theme-subtle opacity-60',
                    )}
                  >
                    {topic.title}
                    <span className="text-theme-muted text-xs tabular-nums">
                      {visible?.questions.length ?? 0}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 space-y-14">
          {topics.map((topic) => (
            <section
              key={topic.id}
              id={topic.id}
              aria-labelledby={`${topic.id}-heading`}
              className="scroll-mt-8"
            >
              <h2
                id={`${topic.id}-heading`}
                className="font-pixel text-2xl tracking-tight normal-case sm:text-3xl"
              >
                {topic.title}
              </h2>
              <p className="text-theme-muted mt-2">{topic.summary}</p>
              <div className="mt-6 space-y-3">
                {topic.questions.map((item) => (
                  <FaqItem
                    key={item.id}
                    item={item}
                    forceOpen={Boolean(term)}
                  />
                ))}
              </div>
            </section>
          ))}

          {topics.length === 0 && (
            <div className="border-theme bg-theme-surface rounded-3xl border p-8 text-center">
              <p className="font-pixel text-xl normal-case">
                Nothing matches “{query.trim()}”
              </p>
              <p className="text-theme-muted mt-2">
                Try a shorter word, or browse the topics.
              </p>
            </div>
          )}

          <section
            aria-labelledby="faq-start-heading"
            className="border-theme bg-theme-surface flex flex-col items-start gap-5 rounded-3xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div>
              <h2
                id="faq-start-heading"
                className="font-pixel text-2xl tracking-tight normal-case"
              >
                The quickest answer is a room
              </h2>
              <p className="text-theme-muted mt-2">
                Free, no account, ready in seconds.
              </p>
            </div>
            <LinkButton
              to="/rooms/create"
              prefetch="intent"
              variant="primary"
              className="min-h-12 shrink-0 gap-3"
            >
              Start a room
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </LinkButton>
          </section>
        </div>
      </div>
    </SitePage>
  );
}
