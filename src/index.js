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

function multicast (children, source) {
  return function(source) {
    const forks = children.map(c => source.fork());
    children.forEach((c, i) => c(forks[i]));
  }
}

const reqPerSec = _.seq(
  _.batchWithTimeOrCount(1000, Number.MAX_SAFE_INTEGER),
  _.pluck('length')
);

const avgRespTime = _.seq(
  _.pluck('request_time'),
  _.map(t => 1000 * parseFloat(t)),
  _.batchWithTimeOrCount(1000, Number.MAX_SAFE_INTEGER),
  _.map(arr => arr.reduce((a, b) => a + b) / arr.length)
);

messageSource("ws://127.0.0.1:9090/")
  .pluck('data')
  .map(JSON.parse)
  .through(
    multicast([
      s => {
        s.through(reqPerSec)
         .each(x => console.log(`req/sec: ${x}`))
      },
      s => {
        s.through(avgRespTime)
         .each(x => console.log(`response time: ${x}`))
      }
    ])
  );
