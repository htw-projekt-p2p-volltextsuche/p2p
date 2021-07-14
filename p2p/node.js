const Libp2p = require( "libp2p" );
const TCP = require( "libp2p-tcp" );
const { NOISE } = require( "libp2p-noise" );
const MPLEX = require( "libp2p-mplex" );
const bootstrap = require( "libp2p-bootstrap" );
const DHT = require( "libp2p-kad-dht" );
const utils = require( "../node_modules/libp2p-kad-dht/src/utils" );

const { createStorage, getPeerId } = require( "./fs" );
const mountIncrementKeysetSize = require( "./incrementKeysetSize" );

async function createNode( env ) {
  const datastore = await createStorage( env.PEER_STORAGE );
  const peerId = await getPeerId( env.PEER_STORAGE );
  const kBucketSize = env.PEER_REDUNDANCY;

  const nodeOptions = {
    peerId,
    addresses: {
      listen: [ `/ip4/${env.PEER_IP}/tcp/${env.PEER_PORT}` ],
    },
    modules: {
      transport     : [ TCP ],
      connEncryption: [ NOISE ],
      streamMuxer   : [ MPLEX ],
    },
    datastore,
    config: {
      peerDiscovery: {
        autoDial       : true,
        [bootstrap.tag]: {
          enabled: true,
          list   : env.PEER_LIST,
        },
      },
      streamMuxer: {
        maxMsgSize: env.PEER_MPLEX_SIZE,
      },
    },
  };

  if ( env.PEER_LIST.length !== 0 )
    nodeOptions.modules.peerDiscovery = [ bootstrap ];

  const node = await Libp2p.create( nodeOptions );
  const dht = ( function addDHT( libp2p ) {
    // src: https://github.com/libp2p/js-libp2p-kad-dht#custom-secondary-dht-in-libp2p
    let customDHT = new DHT( {
      libp2p,
      dialer   : libp2p.dialer,
      peerId   : libp2p.peerId,
      peerStore: libp2p.peerStore,
      registrar: libp2p.registrar,
      datastore,
      kBucketSize,
    } );
    customDHT.start();
    customDHT.on( "peer", libp2p._onDiscoveryPeer );

    customDHT = mountIncrementKeysetSize( customDHT );
    return customDHT;
  } )( node );

  dht.put = async function put( key, value ) {
    // customized put function
    // src: https://github.com/libp2p/js-libp2p-kad-dht/blob/master/src/content-fetching/index.js
    dht._log( "PutValue %b", key );
    const record = await utils.createPutRecord( key, value );

    // put record to the closest peers
    await utils.mapParallel( dht.getClosestPeers( key, { shallow: true } ), async ( peer ) => {
      try {
        await dht._putValueToPeer( key, record, peer );
      } catch ( err ) {
        dht._log.error( "Failed to put to peer (%b): %s", peer.id, err );
      }
    } );
  };

  node.on( "peer:discovery", ( peer ) => {
    console.log( "Discovered %s", peer.id.toB58String() );
  } );
  node.connectionManager.on( "peer:connect", ( connection ) => {
    console.log( "Connected to %s", connection.remotePeer.toB58String() );
  } );
  node.connectionManager.on( "peer:disconnect", ( connection ) => {
    console.log( "Disconnected from %s", connection.remotePeer.toB58String() );
  } );

  await node.start();
  console.log( `own multiaddr:\n  ${node.addresses.listen[0]}/ipfs/${node.peerId.toB58String()}` );

  if ( env.PEER_LIST.length !== 0 )
    console.log( "Attempting to connect:", env.PEER_LIST );

  return { node, dht };
}

module.exports = { createNode };
