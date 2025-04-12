function sendRooms(ws){
    const activeRooms = [];
    for (const roomName in rooms) {
      if (rooms[roomName].length > 0) {
        activeRooms.push({
          room: roomName,
          peer1: rooms[roomName][0].peerID || null,
          peer2: rooms[roomName].length > 1 ? rooms[roomName][1].peerID || null : null
        });
      }
    }
    ws.send(JSON.stringify({ cmd: 'roomsInfo', rooms: activeRooms }));
  }
  