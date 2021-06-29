const uint8ArrayToString = require( "uint8arrays/to-string" );
const PeerId = require( "peer-id" );
const utils = require( "../node_modules/libp2p-kad-dht/src/utils" );
const Query = require( "./customQuery" );

module.exports = ( dht ) => {
  const closerPeersSingle = async ( key, peer ) => {
    const msg = await dht.peerRouting._findPeerSingle( peer, new PeerId( key ) );

    return msg.closerPeers
      .filter( ( peerData ) => !dht._isSelf( peerData.id ) )
      .map( ( peerData ) => {
        dht.peerStore.addressBook.add( peerData.id, peerData.multiaddrs );

        return peerData;
      } );
  };

  const ALL_PEERS_SIZE = 20;
  async function* allPeers( key, options = { shallow: false } ) {
    // src: https://github.com/libp2p/js-libp2p-kad-dht/blob/fd60ebfad06eae29d13156355338fabcb3c3a23a/src/peer-routing/index.js#L228
    const id = await utils.convertBuffer( key );
    const tablePeers = dht.routingTable.closestPeers( id, ALL_PEERS_SIZE );
    const q = new Query( dht, key, () => {
      return async ( peer ) => {
        return {
          closerPeers : peer, // remove closerPeersSingle here, as it somehow replaces peers with closer ones
          pathComplete: options.shallow ? true : undefined,
        };
      };
    } );
    const res = await q.run( tablePeers );
    if ( !res || !res.finalSet )
      return [];
    for ( const pId of res.finalSet )
      yield pId;
  }

  // store on ALL peers
  async function putAll( key, value ) {
    dht._log( "PutValue %b", key );
    const record = await utils.createPutRecord( key, value );

    // also store locally
    dht._putLocal( key, record );

    // using allPeers instead of closestPeers
    await utils.mapParallel( allPeers( key, { shallow: true } ), async ( peer ) => {
      try {
        await dht._putValueToPeer( key, record, peer );
      } catch ( err ) { dht._log.error( "Failed to put to peer (%b): %s", peer.id, err ); }
    } );
  }

  dht.incrementKeysetSize = function incrementKeysetSize() {
    const KEY_NAME = "_keyset_size";
    const buffKey = Buffer.from( KEY_NAME, "utf-8" );

    dht.get( buffKey )
      .then( buffValue => {
        const size = parseInt( buffValue.toString() ) + 1;
        putAll( buffKey, Buffer.from( String( size ), "utf-8" ) );
      } )
      .catch( err => {
        console.log( "incrementKeysetSize error:", err.message );
        const size = 1;
        putAll( buffKey, Buffer.from( String( size ), "utf-8" ) );
      } );
  };

  return dht;
};
