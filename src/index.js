import _ from 'highland';
import Tone from 'tone';
import { _timeWindow, _slidingTimeWindow } from './highland-ext';

const webSockerUrl = "ws://127.0.0.1:9090/";
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

const linearScale = ([a, b], [c, d]) => {
  return (x) => {
    if (x <= a) return c;
    if (x >= b) return d;
    return c + (d - c) * (x - a) / (b - a)
  }
}

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

// Make some noise
const synth = new Tone.PluckSynth().toMaster();
let note = 440;
Tone.Transport.bpm.value = 120;
Tone.Transport.scheduleRepeat(
  (time) => {
    synth.triggerAttackRelease(note, "8n");
  },
  "4n"
);
Tone.Transport.start();

const requests = messageSource(webSockerUrl)
  .pluck('data')
  .map(JSON.parse);

requests
  .fork()
  .through(reqPerSec)
  .tap(x => console.log(`req/sec: ${x}`))
  .map(linearScale([0, 2000], [80, 180]))
  .tap(x => console.log(`bpm: ${x}`))
  .each(x => {
    Tone.Transport.bpm.value = x;
  });


requests
  .fork()
  .through(avgRespTime)
  .tap(x => console.log(`response time: ${x}`))
  .map(linearScale([50, 2000], [494, 65]))
  .tap(x => console.log(`frequency: ${x}`))
  .each(x => {
    note = x;
  });
