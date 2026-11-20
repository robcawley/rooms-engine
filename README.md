# rooms-engine

A static web page that turns a record into rooms: one room per song, one eye per stem. Wake an eye, put it to sleep or ride its fader, and the song is remixed live in the browser. No server code, no build step, no tracking.

Made for my album *Room Tone* (https://robcawley.com/roomtone/). The engine is album-agnostic: an album is a manifest plus one folder of stems per song.

It streams stems in short byte-range windows, so a phone holds about 60 MB of decoded audio even for a 10-stem song.

## What's here

```
engine/
  index.html         the engine (HTML, CSS, JS in one file)
  embed.js           helper for host pages: iframe + JS API
  host-example.html  a sample record page driving the engine
  kit/layouts.json   room layouts for the shared "kit" rooms
tools/test-server.js local static server with Range and CORS
```

This repo does not include the *Room Tone* audio, stems or artwork. The shared kit art (room backdrops, eyes, badges) and the album's media are my own work and stay with the album. To run the engine you supply your own `kit/` images and album folder, in the formats below.

## Run it

Serve the folder with HTTP Range support (`node tools/test-server.js <folder>`), then open `engine/index.html`.

**URL options**
- `?album=<url>` picks the album manifest. Default: `album.json` beside the engine.
- `#<song-key>` or `?song=<song-key>` opens one room directly.
- `?kit=<url>` points at the shared kit folder if it lives elsewhere.

## Album manifest (`album.json`, format `roomtone-album-v1`)

```json
{
  "format": "roomtone-album-v1",
  "artist": "Your Name",
  "title": "Your Album",
  "lede": "A line shown on the way-in screen.",
  "media": "media/",
  "songs": [
    { "key": "one", "track": 1, "title": "First Song", "dur": "3:30",
      "folder": "01-first-song/", "mode": "faders", "thumb": "kit:room-dusk.jpg",
      "blurb": "Two sentences shown beside the room.",
      "stare": ["lines shown", "when the room", "goes still"] }
  ],
  "coming": [ { "track": 2, "title": "Not yet" } ]
}
```

- `media` is the base for song folders, relative to `album.json` or absolute (any CDN or bucket).
- `mode` is `figures` (illustrated figures, tap to wake), `faders` (eyeball faders from the kit) or `sequencer` (an 8-step eye-pad grid gating the stems).
- `thumb` is a path in the media folder, or `kit:<file>` for a kit image.
- `coming` lists songs without rooms yet; the way-in screen counts them.

Each song folder holds a `song.json` describing the room (stems, labels, layout, effects) and an MP3 frame index (`stream`, format `mp3-ranges-v1`) used for byte-range streaming. Never re-encode a stem MP3 without regenerating its index.

## Host API (`embed.js`)

```html
<div id="rooms" style="height:100vh"></div>
<script src="https://engine.example/embed.js"></script>
<script>
  const rooms = RoomTone.embed(document.getElementById('rooms'), {
    album: 'https://storage.example/album.json',
    song: 'one',
    onEvent: e => console.log(e.type, e.song),
  });
  rooms.pause(); rooms.play(); rooms.go('one'); rooms.state();
</script>
```

Events out (postMessage `{ source: 'roomtone', type, ... }`): `ready`, `song`, `loaded`, `playing`, `paused`, `state`, `error`. Commands in (`{ target: 'roomtone', type }`): `play`, `pause`, `song` + `key`, `state`. Browsers only allow sound after the listener has tapped inside the frame once.

## Hosting

- HTTPS static hosting. File types: `.html .js .json .mp3 .webp .jpg`.
- HTTP Range requests on the MP3s are recommended.
- Media on a different origin needs CORS (`Access-Control-Allow-Origin`, `Access-Control-Allow-Headers: Range`), for images too, because the rooms read their pixels.
- The only outside requests are two Google Fonts (Old Standard TT, IBM Plex Mono). Self-host them if you prefer.
- Current Safari, Chrome, Edge and Firefox. Audio is streamed only; there is no download UI.

## Licence

MIT. Made by Rob Cawley. Music at https://robcawley.com
