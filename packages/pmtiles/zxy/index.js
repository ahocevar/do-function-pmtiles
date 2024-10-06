import { PMTiles } from "pmtiles";

const url = process.env.PMTILES_URL;
const tileUrlRegex = /^([0-9]+)\/([0-9]+)\/([0-9]+).mvt$/;

const pmtiles = new PMTiles(url);

export async function main(event, context) {
  try {
    const path = event.http.path;
    if (!path) {
      const tileJson = await pmtiles.getTileJson(url);
      return {
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(tileJson)
      }
    }
    const pmHeader = await pmtiles.getHeader();
    if (event.headers['If-None-Match'].endsWith(pmHeader.etag)) {
      return { statusCode: 304 }
    }
    const [, z, x, y] = path.match(tileUrlRegex).map(Number);
    if (z < pmHeader.minZoom || z > pmHeader.maxZoom) {
      return { statusCode: 404 }
    }
    const tileResult = await pmtiles.getZxy(z, x, y);
    if (!tileResult) {
      return { statusCode: 404 }
    }
    return {
      headers: {
        "Content-Type": pmHeader.tileType,
        "ETag": pmHeader.etag
      },
      body: Buffer.from(tileResult.data)
    }
  } catch (err) {
    return {
      headers: {
        "Content-Type": "text/plain"
      },
      statusCode: 500,
      body: err.stack
    }
  }
}
