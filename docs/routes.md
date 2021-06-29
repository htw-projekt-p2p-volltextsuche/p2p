# HTTP routes

- [Specs](openapi.yaml)
- `_keyset_size` - special key that tracks the number of keysets in the dht

Practical example:

## Setup

```sh
./spawnnode 1 &
#=> Server running on http://localhost:8091

./spawnnode 2 &
#=> Server running on http://localhost:8092

./spawnnode 3 &
#=> Server running on http://localhost:8093
```

## PUT `/:key`

```sh
curl -Ss -X PUT "http://localhost:8093/linux" -d '{"data":"arch"}' -H "Content-Type: application/json"
```

```
{
  "error": false,
  "key": "linux"
}
```

## GET `/:key`

```sh
curl -Ss "http://localhost:8091/linux"
```

```
{
  "error": false,
  "key": "linux",
  "value": [
    "arch"
  ]
}
```

## POST `/batch-get`

```sh
curl -Ss -X POST "http://localhost:8092/batch-get" -d '{"keys":["linux","windows"]}' -H "Content-Type: application/json"
```

```
{
  "error": false,
  "keys": [
    "linux",
    "windows"
  ],
  "values": {
    "linux": {
      "error": false,
      "value": [
        "arch",
        "debian"
      ]
    },
    "windows": {
      "error": true,
      "errorMsg": "Not found"
    }
  }
}
```
