/* Rooms engine: embed helper (v1.0.0).
   Puts the engine in an iframe and gives the host page a small API.

   <div id="rooms"></div>
   <script src="https://<engine-host>/embed.js"></script>
   <script>
     const rooms = RoomTone.embed(document.getElementById('rooms'), {
       album: 'https://<media-host>/room-tone/album.json',   // optional; default album.json beside the engine
       song: 'fade',                                          // optional; opens one room instead of the way-in screen
       onEvent: e => console.log(e.type, e.song),             // ready, song, loaded, playing, paused, state, error
     });
     rooms.pause(); rooms.play(); rooms.go('machine'); rooms.state();
   </script>

   The engine URL defaults to the folder this script was loaded from; pass `engine` to override. */
(function () {
  const here = document.currentScript && document.currentScript.src;

  function embed(container, options = {}) {
    const engine = new URL(options.engine || 'index.html', here || location.href);
    if (options.album) engine.searchParams.set('album', new URL(options.album, location.href).href);
    if (options.kit) engine.searchParams.set('kit', new URL(options.kit, location.href).href);
    if (options.song) engine.hash = options.song;

    const frame = document.createElement('iframe');
    frame.src = engine.href;
    frame.title = options.title || 'Interactive rooms';
    frame.allow = 'autoplay; fullscreen';
    frame.style.cssText = 'display:block;width:100%;height:100%;border:0;background:#0b0c0e';
    container.appendChild(frame);

    const origin = engine.origin;
    const send = (type, extra) => frame.contentWindow && frame.contentWindow.postMessage({ target: 'roomtone', type, ...extra }, origin);
    const onMessage = e => {
      if (e.source !== frame.contentWindow || !e.data || e.data.source !== 'roomtone') return;
      if (options.onEvent) options.onEvent(e.data);
    };
    addEventListener('message', onMessage);

    return {
      iframe: frame,
      play: () => send('play'),          // works once the listener has tapped into a room
      pause: () => send('pause'),
      go: key => send('song', { key }),
      state: () => send('state'),        // answered with a 'state' event
      destroy() { removeEventListener('message', onMessage); frame.remove(); },
    };
  }

  window.RoomTone = { embed, version: '1.0.0' };
})();
