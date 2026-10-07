import { HttpResponse, type RequestHandler, http } from 'msw';

export function createLogoutSessionCheckHandler(
  onRequest: (authorization: string | null) => void,
): RequestHandler {
  return http.get('*/logout-session-check', ({ request }) => {
    onRequest(request.headers.get('Authorization'));
    return HttpResponse.json({});
  });
}
