import _ from 'highland';

const slidingTimeWindow = (windowMs, intervalMs, source) => {
  let batched = [],
      ended = false,
      interval,
      pushFn = () => {};

  const flush = () => {
    const windowStart = Date.now() - windowMs;
    const startIndex = batched.findIndex(([, t]) => t >= windowStart);
    batched = startIndex == -1 ? [] : batched.slice(startIndex);
    pushFn(null, batched.map(a => a[0]));
    if (ended) {
      pushFn(null, nil);
      clearInterval(interval);
    }
  }

  interval = setInterval(flush, intervalMs);

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
      batched.push([x, Date.now()]);
      next();
    }
  });
};

export const _slidingTimeWindow = _.curry(slidingTimeWindow);
export const _timeWindow = _.curry(function(ms, source) {
  return slidingTimeWindow(ms, ms, source);
});
