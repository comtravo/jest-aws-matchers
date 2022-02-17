import * as URL from 'url';

export function endpointFromURL(urlString: string) {
  return URL.parse(urlString).host as string;
}
