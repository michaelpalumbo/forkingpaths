import { writeFileSync } from 'fs'

function updateModuleParam(jsonObject, moduleName, paramName, updatedValue) {
  if (
    jsonObject.modules &&
    jsonObject.modules[moduleName] &&
    jsonObject.modules[moduleName].params &&
    Object.prototype.hasOwnProperty.call(jsonObject.modules[moduleName].params, paramName)
  ) {
    jsonObject.modules[moduleName].params[paramName] = updatedValue;
    return true;
  } else {
    console.warn(`Module "${moduleName}" or parameter "${paramName}" not found.`);
    return false;
  }
}

// Example usage:
const moduleName = "Oscillator_Basilisk_16dbbcd4a632";
const paramName = "frequency";
const updatedValue = 345;

// updateModuleParam(yourJsonObject, moduleName, paramName, updatedValue);

  let obj = {
    "connections": [],
    "graph": {
        "connections": [],
        "modules": {
            "AudioDestination_Bird_817cb6e5f1cb": {
                "moduleSpec": {
                    "cv": {},
                    "inputs": [
                        "IN"
                    ],
                    "outputs": [],
                    "paramNames": [],
                    "parameters": {}
                },
                "nodeIDs": [
                    "AudioDestination_Bird_817cb6e5f1cb",
                    "AudioDestination_Bird_817cb6e5f1cb.IN"
                ],
                "params": {},
                "structure": "webAudioNodes",
                "type": "AudioDestination"
            },
            "Flutter_Nudibranch_7021a7a422b6": {
                "moduleSpec": {
                    "cv": {
                        "delayTime": {
                            "default": 30,
                            "description": "The delay time applied to the input signal.",
                            "kind": "input",
                            "max": 50,
                            "min": 0.01,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the delay time. Connect an AudioNode to modulate this parameter.",
                            "name": "delayTime",
                            "ui": "knob",
                            "units": "milliseconds"
                        },
                        "dryWet": {
                            "default": 0.5,
                            "description": "dry/wet ratio of the output signal",
                            "kind": "input",
                            "max": 1,
                            "min": 0,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the dry/wet ratio of the output signal",
                            "name": "dryWet",
                            "ui": "knob",
                            "units": "float"
                        },
                        "feedback": {
                            "default": 0.5,
                            "description": "feedback into the delay buffer",
                            "kind": "input",
                            "max": 1,
                            "min": 0,
                            "modulatable": true,
                            "modulationDescription": "feedback into the delay buffer",
                            "name": "feedback",
                            "ui": "knob",
                            "units": "float"
                        }
                    },
                    "cvNames": [
                        "delayTime",
                        "feedback",
                        "dryWet"
                    ],
                    "inputs": [
                        "IN"
                    ],
                    "outputs": [
                        "OUT"
                    ],
                    "paramNames": [
                        "delayTime",
                        "time cv +/-",
                        "feedback",
                        "feedback cv +/-",
                        "dryWet",
                        "dryWet cv +/-"
                    ],
                    "parameters": {
                        "delayTime": {
                            "default": 30,
                            "description": "The delay time applied to the input signal.",
                            "kind": "paramAnchorNode",
                            "max": 50,
                            "min": 0.01,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the delay time. Connect an AudioNode to modulate this parameter.",
                            "name": "delayTime",
                            "ui": "knob",
                            "units": "milliseconds"
                        },
                        "dryWet": {
                            "default": 0.5,
                            "description": "dry/wet ratio of the output signal",
                            "kind": "paramAnchorNode",
                            "max": 1,
                            "min": 0,
                            "modulatable": true,
                            "modulationDescription": "dry/wet ratio of the output signal",
                            "name": "dryWet",
                            "ui": "knob",
                            "units": "float"
                        },
                        "dryWet cv +/-": {
                            "default": 0,
                            "description": "attenuverter for the dry/wet ratio of the output signal",
                            "kind": "paramAnchorNode",
                            "max": 1,
                            "min": -1,
                            "modulatable": true,
                            "modulationDescription": "attenuverter for the dry/wet ratio of the output signal",
                            "name": "dryWet cv +/-",
                            "ui": "knob",
                            "units": "float"
                        },
                        "feedback": {
                            "default": 0.5,
                            "description": "feedback into the delay buffer",
                            "kind": "paramAnchorNode",
                            "max": 1,
                            "min": 0,
                            "modulatable": true,
                            "modulationDescription": "feedback into the delay buffer",
                            "name": "feedback",
                            "ui": "knob",
                            "units": "float"
                        },
                        "feedback cv +/-": {
                            "default": 0,
                            "description": "attenuverter for the feedback into the delay buffer",
                            "kind": "paramAnchorNode",
                            "max": 1,
                            "min": -1,
                            "modulatable": true,
                            "modulationDescription": "attenuverter for the dfeedback into the delay buffer",
                            "name": "feedback cv +/-",
                            "ui": "knob",
                            "units": "float"
                        },
                        "time cv +/-": {
                            "default": 2,
                            "description": "The attenuverter of the delayTime CV input",
                            "kind": "paramAnchorNode",
                            "max": 50,
                            "min": -50,
                            "modulatable": false,
                            "modulationDescription": "The attenuverter of the delayTime CV input",
                            "name": "time cv +/-",
                            "ui": "knob",
                            "units": "Hz"
                        }
                    }
                },
                "nodeIDs": [
                    "Flutter_Nudibranch_7021a7a422b6",
                    "Flutter_Nudibranch_7021a7a422b6_delayTime-anchorNode",
                    "Flutter_Nudibranch_7021a7a422b6_time cv +/--anchorNode",
                    "Flutter_Nudibranch_7021a7a422b6_feedback-anchorNode",
                    "Flutter_Nudibranch_7021a7a422b6_feedback cv +/--anchorNode",
                    "Flutter_Nudibranch_7021a7a422b6_dryWet-anchorNode",
                    "Flutter_Nudibranch_7021a7a422b6_dryWet cv +/--anchorNode",
                    "Flutter_Nudibranch_7021a7a422b6.delayTime",
                    "Flutter_Nudibranch_7021a7a422b6.feedback",
                    "Flutter_Nudibranch_7021a7a422b6.dryWet",
                    "Flutter_Nudibranch_7021a7a422b6.IN",
                    "Flutter_Nudibranch_7021a7a422b6.OUT"
                ],
                "params": {
                    "delayTime": 30,
                    "dryWet": 0.5,
                    "dryWet cv +/-": 0,
                    "feedback": 0.5,
                    "feedback cv +/-": 0,
                    "time cv +/-": 2
                },
                "structure": "webAudioNodes",
                "type": "Flutter"
            },
            "LFO_Lookdown_5032e295167f": {
                "moduleSpec": {
                    "cv": {
                        "frequency": {
                            "default": 5,
                            "description": "The frequency of the oscillator.",
                            "kind": "input",
                            "max": 10,
                            "min": 0.01,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                            "name": "frequency",
                            "ui": "knob",
                            "units": "Hz"
                        }
                    },
                    "cvNames": [
                        "frequency"
                    ],
                    "inputs": [],
                    "outputs": [
                        "OUT"
                    ],
                    "paramNames": [
                        "frequency",
                        "freq cv +/-",
                        "type"
                    ],
                    "parameters": {
                        "freq cv +/-": {
                            "default": 10,
                            "description": "The attenuverter of the frequency CV input",
                            "kind": "paramAnchorNode",
                            "max": 20,
                            "min": -20,
                            "modulatable": false,
                            "modulationDescription": "The attenuverter of the frequency CV input",
                            "name": "freq cv +/-",
                            "ui": "knob",
                            "units": "Hz"
                        },
                        "frequency": {
                            "default": 1,
                            "description": "The frequency of the low frequency oscillator.",
                            "kind": "paramAnchorNode",
                            "max": 10,
                            "min": 0.01,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                            "name": "frequency",
                            "ui": "knob",
                            "units": "Hz"
                        },
                        "type": {
                            "default": "sine",
                            "description": "The waveform shape of the oscillator.",
                            "kind": "paramAnchorNode",
                            "name": "type",
                            "ui": "menu",
                            "values": [
                                "sine",
                                "square",
                                "sawtooth",
                                "triangle",
                                "custom"
                            ]
                        }
                    }
                },
                "nodeIDs": [
                    "LFO_Lookdown_5032e295167f",
                    "LFO_Lookdown_5032e295167f_frequency-anchorNode",
                    "LFO_Lookdown_5032e295167f_freq cv +/--anchorNode",
                    "LFO_Lookdown_5032e295167f_type-anchorNode",
                    "LFO_Lookdown_5032e295167f.frequency",
                    "LFO_Lookdown_5032e295167f.OUT"
                ],
                "params": {
                    "freq cv +/-": 10,
                    "frequency": 1,
                    "type": "sine"
                },
                "structure": "webAudioNodes",
                "type": "LFO"
            },
            "Oscillator_Basilisk_16dbbcd4a632": {
                "moduleSpec": {
                    "cv": {
                        "frequency": {
                            "default": 440,
                            "description": "The frequency of the oscillator.",
                            "kind": "input",
                            "max": 9000,
                            "min": 110,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                            "name": "frequency",
                            "ui": "knob",
                            "units": "Hz"
                        }
                    },
                    "cvNames": [
                        "frequency"
                    ],
                    "inputs": [],
                    "outputs": [
                        "OUT"
                    ],
                    "paramNames": [
                        "frequency",
                        "freq cv +/-",
                        "type"
                    ],
                    "parameters": {
                        "freq cv +/-": {
                            "default": 100,
                            "description": "The attenuverter of the frequency CV input",
                            "kind": "paramAnchorNode",
                            "max": 1000,
                            "min": -1000,
                            "modulatable": false,
                            "modulationDescription": "The attenuverter of the frequency CV input",
                            "name": "freq cv +/-",
                            "ui": "knob",
                            "units": "Hz"
                        },
                        "frequency": {
                            "default": 440,
                            "description": "The frequency of the oscillator.",
                            "kind": "paramAnchorNode",
                            "max": 3000,
                            "min": 110,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                            "name": "frequency",
                            "ui": "knob",
                            "units": "Hz"
                        },
                        "type": {
                            "default": "sine",
                            "description": "The waveform shape of the oscillator.",
                            "kind": "paramAnchorNode",
                            "name": "type",
                            "ui": "menu",
                            "values": [
                                "sine",
                                "square",
                                "sawtooth",
                                "triangle",
                                "custom"
                            ]
                        }
                    }
                },
                "nodeIDs": [
                    "Oscillator_Basilisk_16dbbcd4a632",
                    "Oscillator_Basilisk_16dbbcd4a632_frequency-anchorNode",
                    "Oscillator_Basilisk_16dbbcd4a632_freq cv +/--anchorNode",
                    "Oscillator_Basilisk_16dbbcd4a632_type-anchorNode",
                    "Oscillator_Basilisk_16dbbcd4a632.frequency",
                    "Oscillator_Basilisk_16dbbcd4a632.OUT"
                ],
                "params": {
                    "freq cv +/-": 100,
                    "frequency": [
                        876.01,
                        897.9,
                        918.98,
                        939.23,
                        958.66,
                        977.29,
                        1009.01,
                        1026.25,
                        1041.09,
                        1057.61,
                        1089.05,
                        1120.42,
                        1134.46,
                        1151.53,
                        1164.64,
                        1194.39,
                        1212.42,
                        1241.93,
                        1270.66,
                        1289.81,
                        1298.51,
                        1317.74,
                        1337.47,
                        1344.63,
                        1364.27,
                        1384.33,
                        1404.76,
                        1409.75,
                        1429.88,
                        1450.29,
                        1470.94,
                        1491.78,
                        1512.77,
                        1533.86,
                        1555,
                        1576.89,
                        1600.35,
                        1622.86,
                        1625.45,
                        1648.62,
                        1676.06,
                        1699.45,
                        1705.24,
                        1729.04,
                        1736.19,
                        1760.29,
                        1768.89,
                        1803.31,
                        1839.34,
                        1863.38,
                        1876.85,
                        1915.61,
                        1938.6,
                        1955.38,
                        1995.84,
                        2036.67,
                        2057.81,
                        2077.49,
                        2099.88,
                        2141.37,
                        2166.13,
                        2181.92,
                        2207.34,
                        2233.99,
                        2247.04,
                        2311.86,
                        2347.66,
                        2374.98,
                        2402.9,
                        2408.03,
                        2435.22,
                        2462.73,
                        2465.14,
                        2491.69
                    ],
                    "type": "sine"
                },
                "structure": "webAudioNodes",
                "type": "Oscillator"
            },
            "SLOWFO_Trumpeter_062912c85634": {
                "moduleSpec": {
                    "cv": {
                        "frequency": {
                            "default": 0.02,
                            "description": "The frequency of the oscillator.",
                            "kind": "input",
                            "max": 1,
                            "min": 0.001,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                            "name": "frequency",
                            "ui": "knob",
                            "units": "Hz"
                        }
                    },
                    "cvNames": [
                        "frequency"
                    ],
                    "inputs": [],
                    "outputs": [
                        "OUT"
                    ],
                    "paramNames": [
                        "frequency",
                        "freq cv +/-",
                        "type"
                    ],
                    "parameters": {
                        "freq cv +/-": {
                            "default": 0.002,
                            "description": "The attenuverter of the frequency CV input",
                            "kind": "paramAnchorNode",
                            "max": 1,
                            "min": -1,
                            "modulatable": false,
                            "modulationDescription": "The attenuverter of the frequency CV input",
                            "name": "freq cv +/-",
                            "ui": "knob",
                            "units": "Hz"
                        },
                        "frequency": {
                            "default": 0.001,
                            "description": "The frequency of the low frequency oscillator.",
                            "kind": "paramAnchorNode",
                            "max": 1,
                            "min": 0.001,
                            "modulatable": true,
                            "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                            "name": "frequency",
                            "ui": "knob",
                            "units": "Hz"
                        },
                        "type": {
                            "default": "sine",
                            "description": "The waveform shape of the oscillator.",
                            "kind": "paramAnchorNode",
                            "name": "type",
                            "ui": "menu",
                            "values": [
                                "sine",
                                "square",
                                "sawtooth",
                                "triangle"
                            ]
                        }
                    }
                },
                "nodeIDs": [
                    "SLOWFO_Trumpeter_062912c85634",
                    "SLOWFO_Trumpeter_062912c85634_frequency-anchorNode",
                    "SLOWFO_Trumpeter_062912c85634_freq cv +/--anchorNode",
                    "SLOWFO_Trumpeter_062912c85634_type-anchorNode",
                    "SLOWFO_Trumpeter_062912c85634.frequency",
                    "SLOWFO_Trumpeter_062912c85634.OUT"
                ],
                "params": {
                    "freq cv +/-": 0.002,
                    "frequency": 0.001,
                    "type": "sine"
                },
                "structure": "webAudioNodes",
                "type": "SLOWFO"
            }
        }
    }
}

updateModuleParam(obj.graph, moduleName, paramName, updatedValue)
  
console.log(obj.graph.modules[moduleName].params[paramName]); // Should output 345
