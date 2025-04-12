function assignRoom(ws, desiredRoom) {
    if (desiredRoom) {
      if (rooms[desiredRoom]) {
        if (rooms[desiredRoom].length < 2) {
          rooms[desiredRoom].push(ws);
          return desiredRoom;
        }
      } else {
        rooms[desiredRoom] = [ws];
        return desiredRoom;
      }
    }
  
    for (const room in rooms) {
      if (rooms[room].length < 2) {
        rooms[room].push(ws);
        return room;
      }
    }
  
    const newRoom = `room${Object.keys(rooms).length + 1}`;
    rooms[newRoom] = [ws];
    return newRoom;
  }
  