const _queues = {};
window._queues = _queues;

function addToQueue({ queueId, promise }) {
  if (!_queues[queueId]) {
    _queues[queueId] = {
      id: queueId,
      queue: [],
      workingOnPromise: false,
    };
  }

  const deferred = new Promise((resolve, reject) => {
    _queues[queueId].queue.push({
      promise,
      resolve,
      reject,
    });
  });

  return deferred;
}

export function queuePromise({ queueId = 'defaultQueue', promise }) {
  const deferred = addToQueue({ queueId, promise });

  flush(queueId);
  return deferred;
}

function flush(queueId) {
  const queueInfo = _queues[queueId];

  if (!queueInfo) {
    debugger;
    return false;
  }

  if (queueInfo.workingOnPromise) {
    return false;
  }
  const item = queueInfo.queue.shift();
  if (!item) {
    return false;
  }
  try {
    queueInfo.workingOnPromise = true;
    item
      .promise()
      .then((value) => {
        queueInfo.workingOnPromise = false;
        item.resolve(value);
        flush(queueId);
      })
      .catch((err) => {
        queueInfo.workingOnPromise = false;
        item.reject(err);
        flush(queueId);
      });
  } catch (err) {
    queueInfo.workingOnPromise = false;
    item.reject(err);
    flush(queueId);
  }
  return true;
}
