export const prerender = false;

export async function GET({ request, locals }) {
    // Astro Cloudflare adapter puts secrets in locals.runtime.env
    const client_id = locals.runtime.env.GITHUB_CLIENT_ID;

    try {
        const url = new URL(request.url);
        const redirectUrl = new URL('https://github.com/login/oauth/authorize');

        redirectUrl.searchParams.set('client_id', client_id);
        redirectUrl.searchParams.set('redirect_uri', url.origin + '/api/callback');
        redirectUrl.searchParams.set('scope', 'repo user');
        redirectUrl.searchParams.set(
            'state',
            crypto.getRandomValues(new Uint8Array(12)).join(''),
        );

        return Response.redirect(redirectUrl.href, 302);
    } catch (error) {
        return new Response(`Auth Error: ${error.message}`, { status: 500 });
    }
}