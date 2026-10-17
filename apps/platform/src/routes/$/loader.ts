export function loader() {
  return new Response('Not Found', {
    status: 404,
    statusText: 'Not Found',
  });
}

export { loader as notFoundLoader };
