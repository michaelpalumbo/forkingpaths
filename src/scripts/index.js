import { marked } from 'marked'

// Override the link function to open in new tab by default
renderer.link = function(href, title, text) {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer"${
      title ? ` title="${title}"` : ''
    }>${text}</a>`;
  };
  
// Set the renderer in the options
marked.setOptions({ renderer });

fetch('/README.md')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Attempted to fetch README.md HTTP error! Status: ${response.status}`);
    }
    return response.text();
  })
  .then(markdownText => {
    const html = marked(markdownText);
    document.getElementById('readmeRendered').innerHTML = html;
  })
  .catch(error => console.error('Error loading Markdown:', error));

document.addEventListener("DOMContentLoaded", function() {
    // Check if the browser is Chrome: it must include "Chrome" in the user agent
    // and have a vendor of "Google Inc"
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    
    if (!isChrome) {
      alert("This app is still under development and works best on Google Chrome, please try using that instead, thanks!");
    }
});

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
            const roomsList = document.getElementById('sharedRooms');
            roomsList.innerHTML = ''; // Clear existing list items
            
            // Copy and sort the room data so that joinable rooms (i.e. missing a peer) appear first.
            // A room is considered full if both peer1 and peer2 exist.
            const sortedRooms = data.rooms.slice().sort((a, b) => {
                const aJoinable = !(a.peer1 && a.peer2);
                const bJoinable = !(b.peer1 && b.peer2);
                if (aJoinable && !bJoinable) return -1;
                if (!aJoinable && bJoinable) return 1;
                return 0;
            });

            // If no joinable room exists, create a new empty room and insert it at the top.
            const joinableExists = sortedRooms.some(room => !(room.peer1 && room.peer2));
            if (!joinableExists) {
            const newRoomNumber = data.rooms.length + 1;
            sortedRooms.unshift({
                room: `Room ${newRoomNumber}`,
                peer1: null,
                peer2: null
            });
            }

            // Render each room in its own container.
            sortedRooms.forEach(room => {
                const roomContainer = document.createElement('li');
                roomContainer.className = 'room-container';
                
                // Create a header for the room name with a join button if the room isn't full.
                const roomHeader = document.createElement('div');
                roomHeader.className = 'room-header';
                roomHeader.textContent = room.room + " ";  // add a trailing space for separation
                if (!(room.peer1 && room.peer2)) {
                    const joinButton = document.createElement('button');
                    joinButton.textContent = 'Join';
                    joinButton.id = room.room.replace(/\s/g, '').toLowerCase(); // e.g., "room1"
                    joinButton.addEventListener('click', () => {
                        window.open(`synthApp.html?room=${encodeURIComponent(room.room)}`, '_blank');
                    });
                    // Optionally add a click handler:
                    // joinButton.addEventListener('click', () => { ... });
                    roomHeader.appendChild(joinButton);
                }
                roomContainer.appendChild(roomHeader);
                
                // Create a line for the first peer.
                const peer1Line = document.createElement('div');
                peer1Line.className = 'peer-line';
                peer1Line.textContent = room.peer1 || 'waiting...';
                roomContainer.appendChild(peer1Line);
                
                // Create a line for the second peer.
                const peer2Line = document.createElement('div');
                peer2Line.className = 'peer-line';
                peer2Line.textContent = room.peer2 || 'waiting...';
                roomContainer.appendChild(peer2Line);
                
                roomsList.appendChild(roomContainer);
            });
            
                // data.rooms.forEach(room => {
                //     // Create a list element for the room name
                //     const roomItem = document.createElement('li');
                //     roomItem.textContent = room.room;
                //     roomsList.appendChild(roomItem);
                    
                //     // Create a list element for the first peer's ID
                //     const peer1Item = document.createElement('li');
                //     peer1Item.textContent = room.peer1 || 'waiting...';
                //     roomsList.appendChild(peer1Item);
                    
                //     // Create a list element for the second peer's ID or a join button if not present
                //     const peer2Item = document.createElement('li');
                //     if (room.peer2) {
                //     peer2Item.textContent = room.peer2;
                //     } else {
                //         const joinButton = document.createElement('button');
                //         joinButton.textContent = 'Join';
                //         joinButton.id = room.room; // e.g., id="room1"
                //         // Optionally, add a click handler to the join button:
                //         // joinButton.addEventListener('click', () => { ... });
                //         peer2Item.appendChild(joinButton);
                //     }
                //         roomsList.appendChild(peer2Item);
                // })

                // // Determine if all rooms are full:
                // // A room is full if both peer1 and peer2 exist.
                // const allRoomsFull = data.rooms.length > 0 && data.rooms.every(room => room.peer1 && room.peer2);

                // if (data.rooms.length === 0 || allRoomsFull) {
                //     // Create a new empty room entry.
                //     // The new room number will be one more than the number of current rooms.
                //     const newRoomNumber = data.rooms.length + 1;
                //     const emptyRoomItem = document.createElement('li');
                //     emptyRoomItem.textContent = `Room ${newRoomNumber} `;
                    
                //     const joinButton = document.createElement('button');
                //     joinButton.textContent = 'Join';
                //     joinButton.id = `room${newRoomNumber}`; // e.g., id="room1", "room2", etc.
                //     // Optionally, add a click handler:
                //     // joinButton.addEventListener('click', () => { ... });
                //     emptyRoomItem.appendChild(joinButton);
                //     roomsList.appendChild(emptyRoomItem);
                // }
                

            // }
            
            
        break
    }

};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};