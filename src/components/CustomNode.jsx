import React, {useState} from 'react';
import { Handle, Position } from 'reactflow';
import { Silver } from 'react-dial-knob';

function CustomNode({ data }) {

    const [value, setValue] = useState(0); // Knob state



  return (
    <div
      style={{
        padding: '103px',
        border: '1px solid black',
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >

        <div>{data.label || 'Custom Node'}</div>

    {/* Flexbox Container for Label and Knob */}
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Centers both label and knob horizontally
        }}
        className="nodrag"
        onMouseDown={(e) => e.stopPropagation()} // Prevent node dragging when interacting
        >
        {/* Centered Label Above the Knob */}
        <label
            id="knob-label"
            style={{
                fontSize: '20px',
                marginBottom: '5px', // Adds space between label and knob
            }}
            >
            Frequency
        </label>

        {/* Silver Knob */}
        <Silver
            diameter={75}
            min={0}
            max={100}
            step={1}
            value={value}
            onValueChange={setValue}
            ariaLabelledBy="knob-label"
        />
    </div>
          
        {/* Input Handle */}
        <Handle
            type="target"
            position={Position.Left}
            id="input"
            style={{ top: '20%', borderRadius: '75%', width: '15px',
                height: '15px',
                backgroundColor: '#D93',
             }}
        />

        {/* Output Handle */}
        <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ top: '50%', borderRadius: '75%', width: '15px',
                height: '15px',
                backgroundColor: '#39F',
             }}
        />
        </div>
    );
}

export default CustomNode;
