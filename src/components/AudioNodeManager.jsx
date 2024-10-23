class AudioNodeManager {
    constructor() {
      this.nodes = {}; // Store audio nodes by module ID
    }
  
    // Register a node for a module
    registerNode(moduleId, node) {
      this.nodes[moduleId] = node;
      console.log(`Node registered for module: ${moduleId}`);
    }
  
    // Connect two modules
    connectNodes(fromModuleId, toModuleId) {
      const fromNode = this.nodes[fromModuleId];
      const toNode = this.nodes[toModuleId];
  
      if (fromNode && toNode) {
        fromNode.connect(toNode);
        console.log(`Connected ${fromModuleId} to ${toModuleId}`);
      } else {
        console.warn(`Failed to connect ${fromModuleId} to ${toModuleId}: Node(s) missing`);
      }
    }
  
    // Disconnect two modules
    disconnectNodes(fromModuleId, toModuleId) {
      const fromNode = this.nodes[fromModuleId];
      const toNode = this.nodes[toModuleId];
  
      if (fromNode && toNode) {
        fromNode.disconnect(toNode);
        console.log(`Disconnected ${fromModuleId} from ${toModuleId}`);
      } else {
        console.warn(`Failed to disconnect ${fromModuleId} from ${toModuleId}: Node(s) missing`);
      }
    }
  
    // Unregister a node
    unregisterNode(moduleId) {
      if (this.nodes[moduleId]) {
        console.log(`Unregistering node for module: ${moduleId}`);
        delete this.nodes[moduleId];
      }
    }
  
    // Connect a module to a speaker
    connectToSpeaker(moduleId, speakerNode) {
      const fromNode = this.nodes[moduleId];
      if (fromNode && speakerNode) {
        fromNode.connect(speakerNode);
        console.log(`Connected ${moduleId} to the speaker`);
      }
    }
  
    // Disconnect a module from the speaker
    disconnectFromSpeaker(moduleId, speakerNode) {
      const fromNode = this.nodes[moduleId];
      if (fromNode && speakerNode) {
        fromNode.disconnect(speakerNode);
        console.log(`Disconnected ${moduleId} from the speaker`);
      }
    }
  }
  
  export default new AudioNodeManager();
  