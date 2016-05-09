import _ from 'highland';
import { timeWindow } from './highland-ext';

function messageSource(webSocketUrl) {
  return _(function (push, next) {
      console.log(`Connecting to ${webSocketUrl}`);
      const socket = new WebSocket(webSocketUrl);
      socket.onmessage = message => {
        push(null, message);
      }
  });
};

const reqPerSec = _.seq(
  timeWindow(1000),
  _.pluck('length')
);

const avgRespTime = _.seq(
  _.pluck('request_time'),
  _.map(t => 1000 * parseFloat(t)),
  timeWindow(1000),
  _.map(a => a.length? a.reduce((x, y) => x + y) / a.length : 0)
);

const requests = messageSource("ws://127.0.0.1:9090/")
  .pluck('data')
  .map(JSON.parse);

requests
  .fork()
  .through(reqPerSec)
  .each(x => console.log(`req/sec: ${x}`));

requests
  .fork()
  .through(avgRespTime)
  .each(x => console.log(`response time: ${x}`));
