import {
  type ShouldRevalidateFunctionArgs,
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

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const current = new URLSearchParams(currentUrl.search);
  const next = new URLSearchParams(nextUrl.search);
  current.delete('type');
  next.delete('type');

  if (
    !formMethod &&
    currentUrl.search !== nextUrl.search &&
    currentUrl.pathname === nextUrl.pathname &&
    current.toString() === next.toString()
  )
    return false;

  return defaultShouldRevalidate;
}

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
