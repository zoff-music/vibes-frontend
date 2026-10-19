import {
  useLoaderData,
  useNavigate,
  useNavigationType,
  useSearchParams,
  useURLLocation,
} from '@kasperrt/smolter/preact';
import { useEffect } from 'preact/hooks';
import { useExperience } from '../../hooks/useExperience';
import { HomeScreen } from '../../routes/_index/components/HomeScreen';
import type { loader } from '../../routes/_index/loader';
import { retainHomeData } from '../../utils/homePanel';

export function Home() {
  const loaderData = useLoaderData<typeof loader>();
  const { data } = loaderData;
  const experience = useExperience();
  const settings = useURLLocation().pathname.endsWith('/settings/device');
  useEffect(
    () => retainHomeData(experience, loaderData, settings),
    [experience, loaderData, settings],
  );
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
