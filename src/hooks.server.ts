import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const metricsLabel = `${event.request.method} ${event.url.pathname}`
    console.time(metricsLabel)
    // if (event.url.pathname.startsWith('/custom')) {
    // 	return new Response('custom response');
    // }

    const response = await resolve(event);
    console.timeEnd(metricsLabel)
    return response;
}