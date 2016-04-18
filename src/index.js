import _ from 'highland';

function messageSource(webSocketUrl) {
  return _(function (push, next) {
      console.log(`Connecting to ${webSocketUrl}`);
      const socket = new WebSocket(webSocketUrl);
      socket.onmessage = message => {
        push(null, message);
      }
  });
};

messageSource("ws://127.0.0.1:9090/")
  .pluck('data')
  .map(JSON.parse)
  .batchWithTimeOrCount(1000, Number.MAX_SAFE_INTEGER)
  .pluck('length')
  .each(x => console.log(x))
