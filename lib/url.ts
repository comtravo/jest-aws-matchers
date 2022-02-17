import * as URL from 'url';

export function endpointFromURL(urlString: string) {
  return URL.parse(urlString).host as string;
}

export function getHostFromUrl(urlToParse: string) {
  return URL.parse(urlToParse).host as string;
}
