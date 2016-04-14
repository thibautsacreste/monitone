import * as lib from 'highland';

const socket = new WebSocket("ws://127.0.0.1:5556/index?subscribe=true&query=true");

socket.onmessage = function (event) {
  const data = JSON.parse(event.data);
  console.log(data);
}
