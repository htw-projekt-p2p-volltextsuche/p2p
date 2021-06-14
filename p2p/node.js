const libp2p = require( "libp2p" );
const TCP = require( "libp2p-tcp" );
const { NOISE } = require( "libp2p-noise" );
const MPLEX = require( "libp2p-mplex" );
const bootstrap = require( "libp2p-bootstrap" );
const DHT = require( "libp2p-kad-dht" );

const { createStorage } = require( "./storage" );

async function createNode( env ) {
  const fs = await createStorage( env.PEER_STORAGE );

  const nodeOptions = {
    addresses: {
      listen: [ `/ip4/${env.PEER_IP}/tcp/${env.PEER_PORT}` ],
    },
    modules: {
      transport     : [ TCP ],
      connEncryption: [ NOISE ],
      streamMuxer   : [ MPLEX ],
      dht           : DHT,
    },
    datastore: fs,
    config   : {
      peerDiscovery: {
        autoDial       : true,
        [bootstrap.tag]: {
          enabled: true,
          list   : env.PEER_LIST,
        },
      },
      dht: { enabled: true },
    },
  };

  if ( env.PEER_LIST.length !== 0 )
    nodeOptions.modules.peerDiscovery = [ bootstrap ];

  const node = await libp2p.create( nodeOptions );

  node.on( "peer:discovery", ( peer ) => {
    console.log( "Discovered %s", peer.id.toB58String() );
  } );
  node.connectionManager.on( "peer:connect", async ( connection ) => {
    console.log( "Connected to %s", connection.remotePeer.toB58String() );
  } );

  await node.start();
  console.log( `own multiaddr:\n  ${node.addresses.listen[0]}/ipfs/${node.peerId.toB58String()}` );

  if ( env.PEER_LIST.length !== 0 )
    console.log( "Attempting to connect:", env.PEER_LIST );

  return node;
}

module.exports = { createNode };
