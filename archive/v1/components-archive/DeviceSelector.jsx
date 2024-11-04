import React from 'react';

function DeviceSelector({ devices, selectedDevice, onDeviceChange }) {
  return (
    <div>
      <label htmlFor="rnbo-device-select">Select RNBO Device:</label>
      <select
        id="rnbo-device-select"
        value={selectedDevice}
        onChange={onDeviceChange}
      >
        <option value="" disabled>Select a device...</option>
        {devices.map((device, index) => (
          <option key={index} value={device}>
            {device}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DeviceSelector;
