import * as lib from 'highland';

const socket = new WebSocket("ws://127.0.0.1:9090/");

socket.onmessage = function (event) {
  const data = JSON.parse(event.data);
  console.log(data);
}
