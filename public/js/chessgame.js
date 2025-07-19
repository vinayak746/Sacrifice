const socket = io();

socket.emit("sacrifice")
socket.on("user is sacrificing", function() {
    console.log("user sacrificed received");
})