class AudioNodeManager {
    constructor() {
      this.nodes = {}; // Store audio nodes by module ID
    }
  
    // Register a node for a module
    registerNode(moduleId, node) {
        if (node instanceof AudioNode) {
            this.nodes[moduleId] = node;
            console.log(`AudioNode registered for module: ${moduleId}`);
          } else {
            console.warn(`Failed to register node: ${moduleId} is not an AudioNode.`);
          }
    }
  
    // Connect two modules with specified outlet and inlet indices
    connectNodes(fromModuleId, toModuleId, fromOutputIndex = 0, toInputIndex = 0) {
        const fromNode = this.nodes[fromModuleId];
        const toNode = this.nodes[toModuleId];
    
        // Check if nodes are valid AudioNodes
        if (fromNode instanceof AudioNode) {
          console.log(`fromNode (${fromModuleId}) is an AudioNode`);
        } else {
          console.warn(`fromNode (${fromModuleId}) is NOT a valid AudioNode`);
        }
    
        if (toNode instanceof AudioNode) {
          console.log(`toNode (${toModuleId}) is an AudioNode`);
        } else {
          console.warn(`toNode (${toModuleId}) is NOT a valid AudioNode`);
        }
    
        // Ensure nodes are valid and connectable
        if (!fromNode || !toNode) {
          console.warn(`Node(s) missing: ${fromModuleId}, ${toModuleId}`);
          return;
        }
    
        try {
          fromNode.connect(toNode, fromOutputIndex, toInputIndex);
          console.log(`Connected ${fromModuleId} [outlet ${fromOutputIndex}] to ${toModuleId} [inlet ${toInputIndex}]`);
        } catch (error) {
          console.error(`Failed to connect ${fromModuleId} to ${toModuleId}:`, error);
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
  