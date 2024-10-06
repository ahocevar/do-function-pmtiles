# DigitalOcean PMTiles Serverless Function 

## Introduction

This repository contains a function to serve PMTiles tilesets to the web. You can deploy it on DigitalOcean's App Platform as a Serverless Function. Documentation is available at https://docs.digitalocean.com/products/functions.

### Requirements

* You need a DigitalOcean account. If you don't already have one, you can sign up at [https://cloud.digitalocean.com/registrations/new](https://cloud.digitalocean.com/registrations/new).
* To deploy from the command line, you will need the [DigitalOcean `doctl` CLI](https://github.com/digitalocean/doctl/releases).

## Loading and Deploying the Function

### Cloning the repository

```
# clone this repo
git clone git@github.com:ahocevar/do-function-pmtiles.git
```

### Configuration

The function needs a `PMTILES_URL` environment variable pointing to the URL of the `.pmtiles` file.

Copy the `do-function-pmtiles/.env.example` file to `do-function-pmtiles/.env` and edit the URL:

```
PMTILES_URL=https://example.com/my.pmtiles
```

### Deploying the Function

```
# deploy the project, using a remote build so that compiled executable matched runtime environment
doctl serverless deploy do-function-pmtiles --remote-build
```

The output from the deploy command will resemble the following.
```
Deploying 'do-function-pmtiles'
  to namespace 'fn-...'
  on host '...'
Submitted function 'protomaps/tiles' for remote building and deployment in runtime nodejs:18 (id: ...)
Processing of action 'protomaps/tiles' is still running remotely ...
Deployment status recorded in 'do-function-pmtiles/.deployed'

Deployed functions ('doctl sls fn get <funcName> --url' for URL):
  - protomaps/tiles
```

## Using the Function
```
doctl sls fn get protomaps/tiles --url
```

This will return the URL of the function, e.g.
```
https://faas-fra1-00000000.doserverless.co/api/v1/web/fn-00000000-0000-0000-0000-000000000000/protomaps/tiles
```

Paste the URL into the address bar of your browser, or configure the `url` of a `vector` source in your Mapbox Style document. The URL will return the TileJSON document for the PMTiles, e.g. 
```
{
  "tilejson": "3.0.0",
  "scheme": "xyz",
  "tiles": ["https://faas-fra1-00000000.doserverless.co/api/v1/web/fn-00000000-0000-0000-0000-000000000000/protomaps/tiles/{z}/{x}/{y}.mvt"]
```

## Learn More

You can learn more about Protomaps by reading the [Protomaps Docs](https://docs.protomaps.com). 
