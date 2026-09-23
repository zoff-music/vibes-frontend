import {
  useLoaderData,
  useNavigate,
  useNavigationType,
  useSearchParams,
} from 'react-router';
import { HomeScreen } from './components/HomeScreen';
import { loader } from './loader';

export { clientAction } from './action';
export { meta } from './meta';
export { loader };

export default function Home() {
  const { data } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [searchParams] = useSearchParams();
  return (
    <HomeScreen
      data={data}
      navigate={navigate}
      navigationType={navigationType}
      searchParams={searchParams}
    />
  );
}
