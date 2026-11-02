// Pages Function — runs on every request.
//
// The project answers on two hostnames: the *.pages.dev one Cloudflare gives every
// project, and the branded subdomain. Both return byte-identical HTML, so Google
// treated them as duplicates and ended up indexing the pages.dev copy. Search Console
// reports it as "Duplicate, Google chose a different canonical than the user specified".
// A 301 from pages.dev into the branded domain removes the duplicate for good.
//
// Everything else falls straight through to the static assets, so public/_headers and
// the rest of the Pages asset pipeline behave exactly as before.
const PAGES_DEV_HOST = 'mystic-destiny.pages.dev';
const CANONICAL_ORIGIN = 'https://bazi.latexpapa.com';

export const onRequest = async (context) => {
  const url = new URL(context.request.url);

  if (url.hostname === PAGES_DEV_HOST) {
    return Response.redirect(CANONICAL_ORIGIN + url.pathname + url.search, 301);
  }

  return context.next();
};
