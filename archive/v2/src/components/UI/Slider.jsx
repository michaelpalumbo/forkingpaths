import React, { useState } from 'react';

const Slider = ({ Name, min = 0, max = 100, step = 1, initialValue = 50, onChange }) => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (e) => {
        const newValue = parseFloat(e.target.value);
        setValue(newValue);
        if (onChange) onChange(newValue);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                style={{ width: '150px' }}
            />
            <p>{value}</p>
        </div>
    );
};

export default Slider;
