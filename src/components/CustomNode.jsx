import React, {useState} from 'react';
import { Handle, Position } from 'reactflow';
import { Silver } from 'react-dial-knob';

function CustomNode({ data }) {

    const [value, setValue] = useState(0); // Knob state
    const UI = {
        inputColor: '#D93',
        outputColor: '39F'
    }


  return (
    <div
      style={{
        padding: '103px',
        border: '1px solid black',
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
   
      }}
    >

    <div style={{
        position: 'absolute',
        top: '10px', // Adjust to set the label close to the top
        fontSize: '16px',
        fontWeight: 'bold',
        }}
    >   {data.label || 'Custom Node'}
    </div>

    {/* Flexbox Container for Label and Knob */}
    <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'blue',
            padding: '10px',
            borderRadius: '5px',
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

        {/* New Handle Below the Label */}
        <Handle
            type="target"
            position={Position.Top}
            id="label-knob-handle"
            style={{
                position: 'relative',
                top: '10px',
                marginBottom: '10px',
                borderRadius: '50%',
                width: '15px',
                height: '15px',
                backgroundColor: 'black',
                alignSelf: 'center', // Center handle horizontally
                border: `5px solid ${UI.inputColor}`,
                // boxSizing: 'border-box',
                marginTop: '-10px',
                zIndex: 2
            }}
        />

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
        
        {/* Output Handle */}
        <Handle
            type="source"
            position={Position.Right}
            id="output"
            style={{ top: '50%', borderRadius: '75%', width: '15px',
                height: '15px',
                backgroundColor: UI.outputColor,
             }}
        />
        </div>
    );
}

export default CustomNode;
