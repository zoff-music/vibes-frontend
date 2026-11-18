import type { MetaFunction } from '@kasperrt/smolter/preact';
import { pageMetadata } from '../../seo/metadata';
import { faqDescription, faqTitle, faqTopics } from '../../seo/pages/faq';

export const meta: MetaFunction = () =>
  pageMetadata(
    '/faq',
    faqTitle,
    faqDescription,
    faqTopics.flatMap((topic) =>
      topic.questions.map((item) => ({
        title: item.question,
        body: item.answer,
      })),
    ),
  );
