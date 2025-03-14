// Use the correct protocol based on your site's URL (requires Vite environment)
const VITE_WS_URL = import.meta.env.VITE_WS_URL;
// Alternatively, if you're not using Vite, you can use the URL directly:
// const VITE_WS_URL = "wss://historygraphrenderer.onrender.com/10000";

const ws = new WebSocket(VITE_WS_URL);

ws.onopen = () => {
    console.log('Connected to WebSocket server');
    // Request room info once connected
    ws.send(JSON.stringify({ cmd: 'getRooms' }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.cmd){
        case 'roomsInfo':
            const roomsList = document.getElementById('rooms');
            roomsList.innerHTML = ''; // Clear existing list items
            
            data.rooms.forEach(room => {
                // Create a list element for the room name
                const roomItem = document.createElement('li');
                roomItem.textContent = room.room;
                roomsList.appendChild(roomItem);
                
                // Create a list element for the first peer's ID
                const peer1Item = document.createElement('li');
                peer1Item.textContent = room.peer1 || 'waiting...';
                roomsList.appendChild(peer1Item);
                
                // Create a list element for the second peer's ID
                const peer2Item = document.createElement('li');
                peer2Item.textContent = room.peer2 || 'waiting...';
                roomsList.appendChild(peer2Item);
            });
        break
    }

};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};