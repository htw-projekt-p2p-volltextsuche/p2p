const Libp2p = require( "libp2p" );
const TCP = require( "libp2p-tcp" );
const { NOISE } = require( "libp2p-noise" );
const MPLEX = require( "libp2p-mplex" );
const bootstrap = require( "libp2p-bootstrap" );
const DHT = require( "libp2p-kad-dht" );
const utils = require( "../node_modules/libp2p-kad-dht/src/utils" );

const { createStorage, getPeerId } = require( "./fs" );

async function createNode( env ) {
  const datastore = await createStorage( env.PEER_STORAGE );
  const peerId = await getPeerId( env.PEER_STORAGE );

  const nodeOptions = {
    peerId,
    addresses: {
      listen: [ `/ip4/${env.PEER_IP}/tcp/${env.PEER_PORT}` ],
    },
    modules: {
      transport     : [ TCP ],
      connEncryption: [ NOISE ],
      streamMuxer   : [ MPLEX ],
      // dht           : DHT,
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
      // dht: { enabled: true },
    },
  };

  if ( env.PEER_LIST.length !== 0 )
    nodeOptions.modules.peerDiscovery = [ bootstrap ];

  const node = await Libp2p.create( nodeOptions );
  const dht = ( function addDHT( libp2p ) {
    // src: https://github.com/libp2p/js-libp2p-kad-dht#custom-secondary-dht-in-libp2p
    const customDHT = new DHT( {
      libp2p,
      dialer   : libp2p.dialer,
      peerId   : libp2p.peerId,
      peerStore: libp2p.peerStore,
      registrar: libp2p.registrar,
      datastore,
    } );
    customDHT.start();
    customDHT.on( "peer", libp2p._onDiscoveryPeer );
    return customDHT;
  } )( node );

  dht.put = async function put( key, value ) {
    // customized put function
    // src: https://github.com/libp2p/js-libp2p-kad-dht/blob/master/src/content-fetching/index.js
    dht._log( "PutValue %b", key );

    // create record in the dht format
    const record = await utils.createPutRecord( key, value );

    // put record to the closest peers
    // let counterAll = 0;
    // let counterSuccess = 0;

    await utils.mapParallel( dht.getClosestPeers( key, { shallow: true } ), async ( peer ) => {
      try {
        // counterAll += 1;
        await dht._putValueToPeer( key, record, peer );
        // counterSuccess += 1;
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
