export const prerender = false;

export async function GET({ request, locals }) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    
    const client_id = locals.runtime.env.GITHUB_CLIENT_ID;
    const client_secret = locals.runtime.env.GITHUB_CLIENT_SECRET;

    try {
        // Exchange code for a token
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'user-agent': 'decap-cms-oauth-astro',
                accept: 'application/json',
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code,
            }),
        });

        const data = await response.json();

        if (data.error) {
            return new Response(JSON.stringify(data), { status: 401 });
        }

        // This HTML content tells Decap CMS the login was successful
        const content = `
            <script>
                const receiveMessage = (result) => {
                    window.opener.postMessage(
                        'authorization:github:success:' + JSON.stringify(result),
                        window.location.origin
                    );
                    window.removeEventListener('message', receiveMessage, false);
                    window.close();
                }
                receiveMessage(${JSON.stringify({ token: data.access_token, provider: 'github' })});
            </script>`;

        return new Response(content, { headers: { 'content-type': 'text/html' } });

    } catch (error) {
        return new Response(error.message, { status: 500 });
    }
}