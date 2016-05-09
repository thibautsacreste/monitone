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

function dummySource() {
  let count = 0;
  return _(function (push, next) {
    const pushIt = () => {
      push(null, count+=1);
      setTimeout(pushIt, 3000);
    }
    pushIt();
  });
};

function multicast (children, source) {
  return function(source) {
    const forks = children.map(c => source.fork());
    children.forEach((c, i) => c(forks[i]));
  }
}

const timeWindow = _.curry(function(ms, source) {
  let batched = [],
      ended = false,
      interval,
      pushFn = () => {};

  const flush = () => {
    pushFn(null, batched);
    batched = [];
    if (ended) {
      pushFn(null, nil);
      clearInterval(interval);
    }
  }

  interval = setInterval(flush, ms);

  return source.consume(function (err, x, push, next) {
    pushFn = push;
    if (err) {
      push(err);
      next();
    }
    else if (x === nil) {
      ended = true;
    }
    else {
      batched.push(x);
      next();
    }
  });
});

const reqPerSec = _.seq(
  timeWindow(1000),
  _.pluck('length')
);

const avgRespTime = _.seq(
  _.pluck('request_time'),
  _.map(t => 1000 * parseFloat(t)),
  _.batchWithTimeOrCount(1000, Number.MAX_SAFE_INTEGER),
  _.map(arr => arr.reduce((a, b) => a + b) / arr.length)
);

dummySource()
  // .through(timeWindow(1000))
  // .batchWithTimeOrCount(1000, Number.MAX_SAFE_INTEGER)
  // .pluck('length')
  // .each(_.log)
  // .each(x => console.log(`req/sec: ${x}`));

messageSource("ws://127.0.0.1:9090/")
  .pluck('data')
  .map(JSON.parse)
  .through(reqPerSec)
  .each(x => console.log(`req/sec: ${x}`))
  // .through(
  //   multicast([
  //     s => {
  //       s.through(reqPerSec)
  //        .each(x => console.log(`req/sec: ${x}`))
  //     },
  //     s => {
  //       s.through(avgRespTime)
  //        .each(x => console.log(`response time: ${x}`))
  //     }
  //   ])
  // );
