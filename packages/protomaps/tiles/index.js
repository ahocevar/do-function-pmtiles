import { PMTiles } from "pmtiles";

const url = process.env.PMTILES_URL;
const tileUrlRegex = /^\/([0-9]+)\/([0-9]+)\/([0-9]+).mvt$/;

const contentTypes = [
  'application/octet-stream',
  'application/x-protobuf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif'
]

const pmtiles = new PMTiles(url);

export async function main(event, context) {
  try {
    const path = event.http.path;
    if (!path) {
      const tileJson = await pmtiles.getTileJson(context.apiHost + context.functionName);
      return {
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(tileJson)
      }
    }
    const pmHeader = await pmtiles.getHeader();
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
        "Content-Type": contentTypes[pmHeader.tileType],
        "ETag": pmHeader.etag
      },
      body: btoa(
        new Uint8Array(tileResult.data)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
    }
  } catch (err) {
    return {
      headers: {
        "Content-Type": "text/plain"
      },
      statusCode: 500,
      body: err.stack + "\n" + JSON.stringify(event, null, 2)
    }
  }
}
