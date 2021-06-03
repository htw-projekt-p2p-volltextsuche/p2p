# p2p

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

**PORT** - port for the peer to run on

Example:

```sh
PORT=8070
```

**BOOSTRAP_LIST** - list of peers, to join the network on

Format:
  - `/ip4/IP/tcp/PORT`, example: `/ip4/127.0.0.1/tcp/4001`, [see transport pkg](https://github.com/libp2p/js-libp2p-tcp#transport)
  - seperated by commas

Example:

```sh
BOOTSTRAP_LIST=/ip4/127.0.0.1/tcp/8071, /ip4/127.0.0.1/tcp/8072
```

**Debugging environmental variables**

Pass the `--debug` flag to show what env variables are being read in.

```sh
node app.js --debug
```
