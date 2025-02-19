import { PMTiles } from "pmtiles";

const url = process.env.PMTILES_URL;
const tileUrlRegex = /^\/([0-9]+)\/([0-9]+)\/([0-9]+).(mvt|pbf|png|jpg|webp|avif)$/;

const contentTypes = [
  'application/octet-stream',
  'application/x-protobuf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif'
]

const defaultHeaders = {
  'Cache-Control': 'public, max-age=86400'
}

const pmtiles = new PMTiles(url);

export async function main(event, context) {
  try {
    const path = event.http.path;
    const pmHeader = await pmtiles.getHeader();
    if (!path || path === '/') {
      const tileJson = await pmtiles.getTileJson(context.apiHost + '/api/v1/web' + context.functionName);
      return {
        headers: {
          ...defaultHeaders,
          "Content-Type": "application/json",
          "ETag": pmHeader.etag
        },
        body: JSON.stringify(tileJson)
      }
    }
    if (event.headers?.['If-None-Match']?.endsWith(pmHeader.etag)) {
      return { statusCode: 304 }
    }
    const [z, x, y] = path.match(tileUrlRegex).slice(1).map(Number);
    if (z < pmHeader.minZoom || z > pmHeader.maxZoom) {
      return { statusCode: 404 }
    }
    const tileResult = await pmtiles.getZxy(z, x, y);
    if (!tileResult) {
      return { statusCode: 404 }
    }
    return {
      headers: {
        ...defaultHeaders,
        "Content-Type": contentTypes[pmHeader.tileType],
        "ETag": pmHeader.etag
      },
      body: Buffer.from(tileResult.data).toString('base64')
    }
  } catch (err) {
    return {
      headers: {
        "Content-Type": "text/plain"
      },
      statusCode: 500,
      body: err.message
    }
  }
}
