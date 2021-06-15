const FsStore = require( "datastore-fs" );
const { ShardingDatastore } = require( "datastore-core" );
const { NextToLast } = require( "datastore-core" ).shard;
const path = require( "path" );
const PeerId = require( "peer-id" );
const fs = require( "fs/promises" );

async function createStorage( path ) {
  const fs = new FsStore( path );
  const flatfs = await ShardingDatastore.createOrOpen( fs, new NextToLast( 2 ) );
  return flatfs;
}

const PEER_ID_FILE_NAME = "peerId.json";

/*
 * Read peerId from fs
 * If not available: generate new one
 */
async function getPeerId( storagePath ) {
  const PEER_ID_FILE_PATH = path.resolve( storagePath, PEER_ID_FILE_NAME );

  await fs.mkdir( storagePath, { recursive: true } );
  return fs.readFile( PEER_ID_FILE_PATH, { encoding: "utf-8" } )
    .then( data => {
      const jsonData = JSON.parse( data );
      const peerId = PeerId.createFromJSON( jsonData );
      return peerId;
    } )
    .catch( async err => {
      const peerId = await PeerId.create();
      const jsonData = peerId.toJSON(); // https://github.com/libp2p/js-peer-id#tojson
      fs.writeFile( PEER_ID_FILE_PATH, JSON.stringify( jsonData ), { encoding: "utf-8" } ); // finish write in the background
      return peerId;
    } );
}

module.exports = {
  createStorage,
  getPeerId,
};
