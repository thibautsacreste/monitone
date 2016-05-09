import _ from 'highland';

export const timeWindow = _.curry(function(ms, source) {
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
