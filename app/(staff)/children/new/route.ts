// Route removed by SPEC 04 (replaced by the add-child modal): the URL must
// answer 404. With cacheComponents a page-level notFound() only streams the
// not-found UI after the shell (status stays 200), so the removed route is
// answered by this handler, which wins over the dynamic [id] segment.
export function GET() {
  return new Response(null, { status: 404 });
}
