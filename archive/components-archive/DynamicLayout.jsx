import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';




const DynamicLayout = () => {

    const FlowHandleComponent = ({ label }) => (
        <div className="text-center">
          <label>{label}</label>
          {/* Replace this with your actual React Flow Handle */}
          <div style={{ width: '50px', height: '50px', backgroundColor: '#ccc' }}></div>
        </div>
      );
      
      const KnobComponent = ({ label }) => (
        <div className="text-center">
          <label>{label}</label>
          {/* Replace this with your actual knob implementation */}
          <input type="range" />
        </div>
      );

      const ToggleComponent = ({ label }) => (
        <div className="text-center">
            <label>{label}</label>
            <input type="checkbox" />
        </div>
    );
      
  // Define the counts for each component type
  const knobs = Array(2).fill("Knob"); // 2 instances of Knob
  const flowHandles = Array(4).fill("Flow Handle"); // 4 instances of Flow Handle
  const toggles = Array(1).fill("Toggle"); // 1 instance of Toggle

  return (
    <div className="container">
      <div className="row">
        {knobs.map((label, index) => (
          <div className="col-4" key={`knob-${index}`}>
            <KnobComponent label={label} />
          </div>
        ))}
        {flowHandles.map((label, index) => (
          <div className="col-4" key={`handle-${index}`}>
            <FlowHandleComponent label={label} />
          </div>
        ))}
        {toggles.map((label, index) => (
          <div className="col-4" key={`toggle-${index}`}>
            <ToggleComponent label={label} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicLayout;
