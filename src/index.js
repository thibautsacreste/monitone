import _ from 'highland';
import { _timeWindow, _slidingTimeWindow } from './highland-ext';

const timeWindow = 10000;
const timeStep = 1000;

function messageSource(webSocketUrl) {
  return _(function (push, next) {
      console.log(`Connecting to ${webSocketUrl}`);
      const socket = new WebSocket(webSocketUrl);
      socket.onmessage = message => {
        push(null, message);
      }
  });
};

const _movingAverage = (windowMs, intervalMs) => _.seq(
  _slidingTimeWindow(windowMs, intervalMs),
  _.map(a => a.length ? a.reduce((x, y) => x + y) / a.length : 0)
);

const reqPerSec = _.seq(
  _slidingTimeWindow(timeWindow, timeStep),
  _.pluck('length'),
  _.map(l => l*1000/timeWindow)
);

const avgRespTime = _.seq(
  _.pluck('request_time'),
  _.map(t => 1000 * parseFloat(t)),
  _movingAverage(timeWindow, timeStep)
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
