// Ideas dump
import _ from 'highland';

function multicast (children, source) {
  return function(source) {
    const forks = children.map(c => source.fork());
    children.forEach((c, i) => c(forks[i]));
  }
}

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

dummySource()
  .through(timeWindow(1000))
  .batchWithTimeOrCount(1000, Number.MAX_SAFE_INTEGER)
  .pluck('length')
  .each(_.log);
