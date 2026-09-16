import { useLoaderData } from 'react-router';
import { ProductPageContent } from './components/ProductPageContent';
import { loader } from './loader';

export { meta } from './meta';
export { loader };

export default function Discover() {
  const { page } = useLoaderData<typeof loader>();
  return <ProductPageContent page={page} />;
}
