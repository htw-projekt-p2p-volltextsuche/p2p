# Classes

## Structure

`package`
- `Class`: class description
  - `Return functionName( params )`: function description

## P2P-Framework

Can't be defined in detail yet, because I don't yet understand how it will work.

`p2p`
- `Peer`: Primary interface for the local & remote peers
  - `Obj search( String query )`: request `/search_local` on remote peers, or
      `interface.Volltextsuche.search` on this peer

- `Network`: Has peers in network, own Peer instance, Hash instance,
    Chord/Pastry functionality

> How does a new peer join the network?

`hash`
- `Hash`: provides consistent hashing that assigns a range to a specific peer in the network
  - `void addPeer( Peer peer )`: add new peer into the hashing function
  - `void removePeer( Peer peer )`: scale down hashing func
  - `Peer[] findResponsiblePeers( String query )`

- `...Hash`: different hashing implementations (party, speaker, party+speaker,
    query words, etc.)

> Using chord, do I even know when a new peer joins? How will I adjust the
> hasing function to include that new peer?

## Shared

`http`
- `Server`: http server for communication with ui & crawler
  - `static void main( String[] args )`: entry point
  - `Obj handleSearch( String query )`: run `/search`
  - `Obj handleSearchLocal( String query )`: run `/search_local`
  - `void handleInsertSpeech( Speech speech )`: run `/insert_speech`

`interface`
- `Volltextsuche`: communication channel with this peers volltextsuche process
  - `Obj search( String query )`
  - `void insertSpeech( Speech speech )`

## P2P-Logik

`data`
- `Obj`: result of a search (JSON? Defined by volltextsuche)
- `Speech`:
  - `int SpeechId`: unique ID, so the speech can be found in the DB

- `MapReduce`: Responsible for accumulating and reducing the search results from the volltextsuche from all relevant peers
  - Obj[] getSearchResults( String query ) : gets all search results from all relevant peers
  - `Map<Int, String, String> mapReduceSearchResults(Obj[] searchResults)` : Map/Reduce the search results of the different peers. Removes duplicates and maps into format needed by the UI (needs definition, example used here: Map<Int (SpeechId), String (SpeakerName), String (TextSnippet)> as an example)
