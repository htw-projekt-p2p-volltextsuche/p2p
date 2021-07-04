const { createNode } = require( "./node" );

class P2P {
  async create( env ) {
    const { node, dht } = await createNode( env );
    this.node = node;
    this.dht = dht;
  }

  isInitialized() {
    if ( !this.node )
      throw new Error( "p2p net not initialized" );
  }

  get( key ) {
    this.isInitialized();

    const buffKey = Buffer.from( key, "utf-8" );
    return this.dht.get( buffKey );
  }

  put( rawKey, rawValue ) {
    this.isInitialized();

    const key = Buffer.from( rawKey, "utf-8" );
    const value = Buffer.from( JSON.stringify( rawValue ), "utf-8" );
    return this.dht.put( key, value );
  }

  incrementKeysetSize() {
    return this.dht.incrementKeysetSize();
  }
}

module.exports = P2P;
