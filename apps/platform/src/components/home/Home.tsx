import {
  useLoaderData,
  useNavigate,
  useNavigationType,
  useSearchParams,
} from '@kasperrt/smolter/preact';
import { HomeScreen } from '../../routes/_index/components/HomeScreen';
import type { loader } from '../../routes/_index/loader';

export function Home() {
  const { data } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [searchParams] = useSearchParams();

  return (
    <HomeScreen
      key={searchParams.get('mode') ?? 'room'}
      data={data}
      navigate={navigate}
      navigationType={navigationType}
      searchParams={searchParams}
    />
  );
}
