# p2p-dht

## Run

Development:

```sh
npm start
```

Production:

```sh
npm run start-prod
```

## Configure

Configured via environmental variables in `variables.env`.

### `HTTP_PORT`

Port for the http server to run on.

Default: `8090`

### `PEER_PORT`

Port for the p2p node to run on.

Default: `8070`

### `PEER_IP`

IP for the p2p node to run on.

Default: `127.0.0.1` (localhost)

### `PEER_LIST`

List of peers, required for joining the network. Leave blank on first peer, that
is "creating" the network.

Default: `` (empty)

Format:
  - [multiaddr](https://multiformats.github.io/js-multiaddr/#what-is-multiaddr)
    incl. ipfs address <!--Todo: describe how to get the ipfs address-->
  - seperated by commas

Example:

```sh
PEER_LIST=/ip4/127.0.0.1/tcp/8071/ipfs/QmdW3RF4Yq4acYc4bgUmxeuJQLb2mQpQmMuDTGir5gQcYM, /ip4/127.0.0.1/tcp/8072/ipfs/QmPP5pdu6Dh93DL7LnQkKU2x8m4BoSrQswjQR5q26PMneg
```

<!--Todo: document PEER_PUB/PEER_PRI-->

### `PEER_STORAGE`

Storage location on disk for the data of the DHT.

Default: `/tmp/datastore`

### Debugging environmental variables

Pass the `--debug` flag to print the env variables that are being read in.

```sh
node app.js --debug
```
or
```sh
npm run debug
```
