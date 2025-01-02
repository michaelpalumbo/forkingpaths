let obj = {
    "elements": {
        "nodes": [
            {
                "data": {
                    "id": "AudioDestination_Rattlesnake_c0ac4e8a9c29",
                    "label": "AudioDestination Rattlesnake",
                    "kind": "module",
                    "rnboName": "AudioDestination",
                    "moduleSpec": {
                        "parameters": {},
                        "paramNames": [],
                        "cv": {},
                        "inputs": [
                            "IN"
                        ],
                        "outputs": []
                    },
                    "structure": "webAudioNodes",
                    "bgcolour": "#E6CCFF"
                },
                "position": {
                    "x": 1035.5,
                    "y": 610
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": ":parent"
            },
            {
                "data": {
                    "id": "AudioDestination_Rattlesnake_c0ac4e8a9c29.IN",
                    "parent": "AudioDestination_Rattlesnake_c0ac4e8a9c29",
                    "label": "IN",
                    "kind": "input",
                    "bgcolour": "#FC9A4F",
                    "ghostCableShape": "rectangle",
                    "ghostCableColour": "#5C9AE3",
                    "description": null
                },
                "position": {
                    "x": 1050,
                    "y": 610
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": ""
            },
            {
                "data": {
                    "id": "Oscillator_Rhinoceros_e3b102cc9ebc",
                    "label": "Oscillator Rhinoceros",
                    "kind": "module",
                    "rnboName": "Oscillator",
                    "moduleSpec": {
                        "parameters": {
                            "frequency": {
                                "min": 110,
                                "max": 3000,
                                "default": 440,
                                "units": "Hz",
                                "description": "The frequency of the oscillator.",
                                "modulatable": true,
                                "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                                "kind": "paramAnchorNode",
                                "name": "frequency",
                                "ui": "knob"
                            },
                            "type": {
                                "values": [
                                    "sine",
                                    "square",
                                    "sawtooth",
                                    "triangle",
                                    "custom"
                                ],
                                "default": "sine",
                                "description": "The waveform shape of the oscillator.",
                                "kind": "paramAnchorNode",
                                "name": "type",
                                "ui": "menu"
                            },
                            "freq cv +/-": {
                                "min": -1000,
                                "max": 1000,
                                "default": 100,
                                "units": "Hz",
                                "description": "The attenuverter of the frequency CV input",
                                "modulatable": false,
                                "modulationDescription": "The attenuverter of the frequency CV input",
                                "kind": "paramAnchorNode",
                                "name": "freq cv +/-",
                                "ui": "knob"
                            }
                        },
                        "paramNames": [
                            "frequency",
                            "freq cv +/-",
                            "type"
                        ],
                        "cvNames": [
                            "frequency"
                        ],
                        "cv": {
                            "frequency": {
                                "min": 110,
                                "max": 9000,
                                "default": 440,
                                "units": "Hz",
                                "description": "The frequency of the oscillator.",
                                "modulatable": true,
                                "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                                "kind": "input",
                                "name": "frequency",
                                "ui": "knob"
                            }
                        },
                        "inputs": [],
                        "outputs": [
                            "OUT"
                        ]
                    },
                    "structure": "webAudioNodes",
                    "bgcolour": "#CCCCCC"
                },
                "position": {
                    "x": 672,
                    "y": 422.5
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": ":parent"
            },
            {
                "data": {
                    "id": "Oscillator_Rhinoceros_e3b102cc9ebc_frequency",
                    "parent": "Oscillator_Rhinoceros_e3b102cc9ebc",
                    "label": "frequency",
                    "nameSpace": "Oscillator_Rhinoceros_e3b102cc9ebc_frequency.frequency",
                    "kind": "paramAnchorNode",
                    "shape": "ellipse",
                    "bgcolour": "#CCCCCC",
                    "hash": "Oscillator_Rhinoceros_e3b102cc9ebc_frequency",
                    "ui": "knob",
                    "min": 110,
                    "max": 3000,
                    "value": 440,
                    "menuOptions": "none",
                    "description": "The frequency of the oscillator."
                },
                "position": {
                    "x": 730,
                    "y": 310
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": "paramAnchorNode"
            },
            {
                "data": {
                    "id": "Oscillator_Rhinoceros_e3b102cc9ebc_freq cv +/-",
                    "parent": "Oscillator_Rhinoceros_e3b102cc9ebc",
                    "label": "freq cv +/-",
                    "nameSpace": "Oscillator_Rhinoceros_e3b102cc9ebc_freq cv +/-.freq cv +/-",
                    "kind": "paramAnchorNode",
                    "shape": "ellipse",
                    "bgcolour": "#CCCCCC",
                    "hash": "Oscillator_Rhinoceros_e3b102cc9ebc_freq cv +/-",
                    "ui": "knob",
                    "min": -1000,
                    "max": 1000,
                    "value": 100,
                    "menuOptions": "none",
                    "description": "The attenuverter of the frequency CV input"
                },
                "position": {
                    "x": 730,
                    "y": 370
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": "paramAnchorNode"
            },
            {
                "data": {
                    "id": "Oscillator_Rhinoceros_e3b102cc9ebc_type",
                    "parent": "Oscillator_Rhinoceros_e3b102cc9ebc",
                    "label": "type",
                    "nameSpace": "Oscillator_Rhinoceros_e3b102cc9ebc_type.type",
                    "kind": "paramAnchorNode",
                    "shape": "ellipse",
                    "bgcolour": "#CCCCCC",
                    "hash": "Oscillator_Rhinoceros_e3b102cc9ebc_type",
                    "ui": "menu",
                    "min": 0,
                    "max": 1,
                    "value": "sine",
                    "menuOptions": [
                        "sine",
                        "square",
                        "sawtooth",
                        "triangle",
                        "custom"
                    ],
                    "description": "The waveform shape of the oscillator."
                },
                "position": {
                    "x": 730,
                    "y": 430
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": "paramAnchorNode"
            },
            {
                "data": {
                    "id": "Oscillator_Rhinoceros_e3b102cc9ebc.frequency",
                    "parent": "Oscillator_Rhinoceros_e3b102cc9ebc",
                    "label": "frequency",
                    "kind": "input",
                    "bgcolour": "#FC9A4F",
                    "ghostCableShape": "rectangle",
                    "ghostCableColour": "#5C9AE3",
                    "description": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects."
                },
                "position": {
                    "x": 710,
                    "y": 470
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": ""
            },
            {
                "data": {
                    "id": "Oscillator_Rhinoceros_e3b102cc9ebc.OUT",
                    "parent": "Oscillator_Rhinoceros_e3b102cc9ebc",
                    "label": "OUT",
                    "kind": "output",
                    "bgcolour": "#6FB1FC",
                    "ghostCableShape": "triangle",
                    "ghostCableColour": "#E68942",
                    "description": null
                },
                "position": {
                    "x": 710,
                    "y": 530
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": ""
            },
            {
                "data": {
                    "id": "LFO_Cats_9a486534a28a",
                    "label": "LFO Cats",
                    "kind": "module",
                    "rnboName": "LFO",
                    "moduleSpec": {
                        "parameters": {
                            "frequency": {
                                "min": 0.01,
                                "max": 10,
                                "default": 1,
                                "units": "Hz",
                                "description": "The frequency of the low frequency oscillator.",
                                "modulatable": true,
                                "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                                "kind": "paramAnchorNode",
                                "name": "frequency",
                                "ui": "knob"
                            },
                            "type": {
                                "values": [
                                    "sine",
                                    "square",
                                    "sawtooth",
                                    "triangle",
                                    "custom"
                                ],
                                "default": "sine",
                                "description": "The waveform shape of the oscillator.",
                                "kind": "paramAnchorNode",
                                "name": "type",
                                "ui": "menu"
                            },
                            "freq cv +/-": {
                                "min": -20,
                                "max": 20,
                                "default": 10,
                                "units": "Hz",
                                "description": "The attenuverter of the frequency CV input",
                                "modulatable": false,
                                "modulationDescription": "The attenuverter of the frequency CV input",
                                "kind": "paramAnchorNode",
                                "name": "freq cv +/-",
                                "ui": "knob"
                            }
                        },
                        "paramNames": [
                            "frequency",
                            "freq cv +/-",
                            "type"
                        ],
                        "cvNames": [
                            "frequency"
                        ],
                        "cv": {
                            "frequency": {
                                "min": 0.01,
                                "max": 10,
                                "default": 5,
                                "units": "Hz",
                                "description": "The frequency of the oscillator.",
                                "modulatable": true,
                                "modulationDescription": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects.",
                                "kind": "input",
                                "name": "frequency",
                                "ui": "knob"
                            }
                        },
                        "inputs": [],
                        "outputs": [
                            "OUT"
                        ]
                    },
                    "structure": "webAudioNodes",
                    "bgcolour": "#CCCCCC"
                },
                "position": {
                    "x": 412,
                    "y": 402.5
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": ":parent"
            },
            {
                "data": {
                    "id": "LFO_Cats_9a486534a28a_frequency",
                    "parent": "LFO_Cats_9a486534a28a",
                    "label": "frequency",
                    "nameSpace": "LFO_Cats_9a486534a28a_frequency.frequency",
                    "kind": "paramAnchorNode",
                    "shape": "ellipse",
                    "bgcolour": "#CCCCCC",
                    "hash": "LFO_Cats_9a486534a28a_frequency",
                    "ui": "knob",
                    "min": 0.01,
                    "max": 10,
                    "value": 1,
                    "menuOptions": "none",
                    "description": "The frequency of the low frequency oscillator."
                },
                "position": {
                    "x": 470,
                    "y": 290
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": "paramAnchorNode"
            },
            {
                "data": {
                    "id": "LFO_Cats_9a486534a28a_freq cv +/-",
                    "parent": "LFO_Cats_9a486534a28a",
                    "label": "freq cv +/-",
                    "nameSpace": "LFO_Cats_9a486534a28a_freq cv +/-.freq cv +/-",
                    "kind": "paramAnchorNode",
                    "shape": "ellipse",
                    "bgcolour": "#CCCCCC",
                    "hash": "LFO_Cats_9a486534a28a_freq cv +/-",
                    "ui": "knob",
                    "min": -20,
                    "max": 20,
                    "value": 10,
                    "menuOptions": "none",
                    "description": "The attenuverter of the frequency CV input"
                },
                "position": {
                    "x": 470,
                    "y": 350
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": "paramAnchorNode"
            },
            {
                "data": {
                    "id": "LFO_Cats_9a486534a28a_type",
                    "parent": "LFO_Cats_9a486534a28a",
                    "label": "type",
                    "nameSpace": "LFO_Cats_9a486534a28a_type.type",
                    "kind": "paramAnchorNode",
                    "shape": "ellipse",
                    "bgcolour": "#CCCCCC",
                    "hash": "LFO_Cats_9a486534a28a_type",
                    "ui": "menu",
                    "min": 0,
                    "max": 1,
                    "value": "sine",
                    "menuOptions": [
                        "sine",
                        "square",
                        "sawtooth",
                        "triangle",
                        "custom"
                    ],
                    "description": "The waveform shape of the oscillator."
                },
                "position": {
                    "x": 470,
                    "y": 410
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": "paramAnchorNode"
            },
            {
                "data": {
                    "id": "LFO_Cats_9a486534a28a.frequency",
                    "parent": "LFO_Cats_9a486534a28a",
                    "label": "frequency",
                    "kind": "input",
                    "bgcolour": "#FC9A4F",
                    "ghostCableShape": "rectangle",
                    "ghostCableColour": "#5C9AE3",
                    "description": "Audio-rate modulation of the frequency to create vibrato or FM synthesis effects."
                },
                "position": {
                    "x": 450,
                    "y": 450
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": ""
            },
            {
                "data": {
                    "id": "LFO_Cats_9a486534a28a.OUT",
                    "parent": "LFO_Cats_9a486534a28a",
                    "label": "OUT",
                    "kind": "output",
                    "bgcolour": "#6FB1FC",
                    "ghostCableShape": "triangle",
                    "ghostCableColour": "#E68942",
                    "description": null
                },
                "position": {
                    "x": 450,
                    "y": 510
                },
                "group": "nodes",
                "removed": false,
                "selected": false,
                "selectable": true,
                "locked": false,
                "grabbable": true,
                "pannable": false,
                "classes": ""
            }
        ]
    },
    "style": [
        {
            "selector": "node",
            "style": {
                "background-color": "data(bgcolour)",
                "label": "data(label)",
                "font-size": "18px",
                "width": "30px",
                "height": "30px",
                "color": "rgb(0,0,0)",
                "text-valign": "center",
                "text-halign": "left",
                "text-margin-x": "-10px"
            }
        },
        {
            "selector": "node[bgcolour]",
            "style": {
                "background-color": "data(bgcolour)"
            }
        },
        {
            "selector": "node[kind = \"input\"]",
            "style": {
                "shape": "triangle"
            }
        },
        {
            "selector": "node[kind = \"output\"]",
            "style": {
                "shape": "rectangle"
            }
        },
        {
            "selector": ":parent",
            "style": {
                "background-opacity": "0.5",
                "background-color": "data(bgcolour)",
                "border-color": "rgb(245,122,65)",
                "border-width": "1px",
                "label": "data(label)",
                "text-valign": "top",
                "text-halign": "center",
                "color": "rgb(255,0,0)",
                "font-size": "20px",
                "text-margin-y": "-10px"
            }
        },
        {
            "selector": "node.highlighted",
            "style": {
                "border-color": "rgb(34,139,34)",
                "border-width": "10px"
            }
        },
        {
            "selector": "node.ghostNode",
            "style": {
                "background-color": "rgb(255,255,255)",
                "opacity": "0.8",
                "width": "27px",
                "height": "27px",
                "border-width": "0px",
                "label": ""
            }
        },
        {
            "selector": "edge",
            "style": {
                "width": "6px",
                "line-color": "rgb(204,204,204)",
                "target-arrow-shape": "triangle",
                "source-arrow-shape": "triangle",
                "source-arrow-color": "rgb(0,0,0)",
                "target-arrow-color": "rgb(0,0,0)",
                "target-arrow-width": "20px",
                "source-arrow-width": "50px",
                "curve-style": "unbundled-bezier",
                "control-point-weights": "0.25 0.75",
                "control-point-distances": "20px -20px"
            }
        },
        {
            "selector": "edge.highlighted",
            "style": {
                "line-color": "rgb(255,0,0)",
                "target-arrow-color": "rgb(255,0,0)",
                "source-arrow-color": "rgb(255,0,0)",
                "width": "10px"
            }
        },
        {
            "selector": "edge.connectedEdges",
            "style": {
                "line-color": "rgb(34,139,34)",
                "target-arrow-color": "rgb(34,139,34)",
                "source-arrow-color": "rgb(34,139,34)",
                "width": "6px"
            }
        },
        {
            "selector": ".peerPointer",
            "style": {
                "background-color": "data(colour)",
                "width": "15px",
                "height": "15px",
                "shape": "star",
                "text-valign": "center",
                "text-halign": "right",
                "text-margin-x": "10px"
            }
        },
        {
            "selector": ".paramAnchorNode",
            "style": {
                "background-color": "rgb(245,164,93)",
                "background-opacity": "0",
                "shape": "ellipse",
                "width": "20px",
                "height": "20px",
                "label": "",
                "text-opacity": "0",
                "outline-width": "0px",
                "events": "no"
            }
        },
        {
            "selector": "._gridParentPadding",
            "style": {
                "compound-sizing-wrt-labels": "exclude",
                "padding": "20px"
            }
        },
        {
            "selector": "._gridParentPadding",
            "style": {
                "compound-sizing-wrt-labels": "exclude",
                "padding": "20px"
            }
        }
    ],
    "data": {},
    "zoomingEnabled": true,
    "userZoomingEnabled": false,
    "zoom": 1,
    "minZoom": 1e-50,
    "maxZoom": 1e+50,
    "panningEnabled": true,
    "userPanningEnabled": false,
    "pan": {
        "x": 0,
        "y": 0
    },
    "boxSelectionEnabled": true,
    "renderer": {
        "name": "canvas"
    }
}

obj.elements.nodes.forEach((node, index)=>{

    if(node.classes === ':parent'){
        obj.elements.nodes[index].grabbable = false
        console.log(obj.elements.nodes[index])
    }
    
})

