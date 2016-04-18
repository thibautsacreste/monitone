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

const dataStream = messageSource("ws://127.0.0.1:9090/")
  .pluck('data')
  .map(JSON.parse)

const debugStream = dataStream.fork();
debugStream
  .throttle(1000)
  .each(x => console.log(x))

const reqPerSecStream = dataStream.fork();
reqPerSecStream
  .batchWithTimeOrCount(1000, Number.MAX_SAFE_INTEGER)
  .pluck('length')
  .each(x => console.log(`req/sec: ${x}`))

const avgRespTimeStream = dataStream.fork();
avgRespTimeStream
  .pluck('request_time')
  .map(t => 1000 * parseFloat(t))
  .batchWithTimeOrCount(1000, Number.MAX_SAFE_INTEGER)
  .map(arr => arr.reduce((a, b) => a + b) / arr.length)
  .each(x => console.log(`response time:${x}`))
