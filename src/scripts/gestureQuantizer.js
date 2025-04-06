
function playGestureFromSequencerStep(gesture, stepLength){
    // console.log(gesture.nodes[0])

    // console.log(quantizeGesture(gesture, stepLength))
    let quantizedGesture = quantizeGesture(gesture, stepLength)
    // create the scheduler
    quantizedGesture.forEach((node) => {
        const delay = node.t * 1000; // (convert to milliseconds)
        
        // Use setTimeout to schedule the callback
        const timeoutID = setTimeout(() => {
            
            if(gesture.assign.param === 'default'){
                
                let data = {
                    parent: node.parent,
                    param: node.param,
                    value: node.value
                }
                console.log(data)
                
                //! uncomment this when in patcHistory Script
                // sendToMainApp({
                //     cmd: 'playGesture',
                //     data: data,
                //     kind: 'n/a'
                // })

                
            } else {
                // process it using the gesturedata assign range data for scaling

                // convert the value from the source value's min and max to gestureData.assign.range
                // first get the min and max of the source value
                // synthParamRanges

                
                let value = node.data.value
                
                let storedParam = meta.synthFile.audioGraph.modules[node.data.parents].moduleSpec.parameters[node.data.param]
                let targetParam = gesture.assign
                
                sendToMainApp({
                    cmd: 'playGesture',
                    data: convertParams(storedParam, targetParam, value),
                    kind: targetParam.kind

                })
        
            }

            // if(gesture.loop && gesture.length === delay){
            //     playGesture('repeat')
            //     // setTimeout(() => {
            //     //     playGesture('repeat')
            //     // }, 250);
            // }
        }, delay);

        gesture.scheduler.push(timeoutID)
    });
}

function quantizeGesture(gesture, stepLength) {

    const duration = gesture.endTime - gesture.startTime;
    const scale = stepLength / duration;
  
    // Map each point's timestamp to the new interval [0, stepLength]
    return gesture.gesturePoints.map(point => ({
      ...point,
      t: (point.timestamp - gesture.startTime) * scale
    }));
}

let gesture = {
    "nodes": [
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20636db92852",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616112,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 591.67
            },
            "position": {
                "x": 0,
                "y": 510
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20644a8efa61",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616361,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 615.24
            },
            "position": {
                "x": 38.853605873038724,
                "y": 504.7302593508338
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20659ed300d9",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616375,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 638.75
            },
            "position": {
                "x": 41.038145962285874,
                "y": 499.4739333999684
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-206609ca1155",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616392,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 662.12
            },
            "position": {
                "x": 43.69080178494314,
                "y": 494.2489084118049
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2067659611e9",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616395,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 664.91
            },
            "position": {
                "x": 44.15891751835325,
                "y": 493.6251249408175
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-206850608fd9",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616406,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 688.97
            },
            "position": {
                "x": 45.8753418741903,
                "y": 488.2458309221947
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2069c134ed34",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616418,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 692.95
            },
            "position": {
                "x": 47.74780480783072,
                "y": 487.35598926824133
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-206a865798e9",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616420,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 717.63
            },
            "position": {
                "x": 48.059881963437455,
                "y": 481.83807670051027
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-206b4dca7a80",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616449,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 741.91
            },
            "position": {
                "x": 52.58500071973514,
                "y": 476.40959545478455
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-206cfa91c1d3",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616476,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 765.71
            },
            "position": {
                "x": 56.798042320426084,
                "y": 471.0884317954653
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-206d5e683803",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616483,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 772.85
            },
            "position": {
                "x": 57.89031236504966,
                "y": 469.4920826976695
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-206e35ca39d3",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616500,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 796.95
            },
            "position": {
                "x": 60.542968187706926,
                "y": 464.10384554684623
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-206f7eed9945",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616522,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 820.41
            },
            "position": {
                "x": 63.97581689938103,
                "y": 458.8586985112315
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2070886cf125",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616545,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 843.19
            },
            "position": {
                "x": 67.5647041888585,
                "y": 453.7655847230259
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2071d958e703",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616556,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 853.31
            },
            "position": {
                "x": 69.28112854469556,
                "y": 451.50297227629017
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-207259ab3c9f",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616566,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 876.01
            },
            "position": {
                "x": 70.84151432272924,
                "y": 446.42774475248564
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2073eaa69174",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616605,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 897.9
            },
            "position": {
                "x": 76.9270188570606,
                "y": 441.533615655742
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2074719dcd82",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616609,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 910.05
            },
            "position": {
                "x": 77.55117316827408,
                "y": 438.81713924982904
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-207576e6d995",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616626,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 931.61
            },
            "position": {
                "x": 80.20382899093134,
                "y": 433.9967909937398
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20760014074a",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616640,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 952.28
            },
            "position": {
                "x": 82.3883690801785,
                "y": 429.3754274291125
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20776746713f",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616650,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 966.21
            },
            "position": {
                "x": 83.94875485821218,
                "y": 426.26098164027565
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20780ceb330d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616675,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 986.31
            },
            "position": {
                "x": 87.84971930329638,
                "y": 421.76705770950605
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2079a5bb9ee6",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616682,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1001.51
            },
            "position": {
                "x": 88.94198934791996,
                "y": 418.36866747330214
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-207ab82defd4",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616707,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1020.89
            },
            "position": {
                "x": 92.84295379300417,
                "y": 414.0357199221421
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-207bcfe2e8e5",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616716,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1037.3
            },
            "position": {
                "x": 94.2473009932345,
                "y": 410.366799936872
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-207c573a7a82",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616784,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1054.75
            },
            "position": {
                "x": 104.85792428386354,
                "y": 406.4653585143879
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-207d79f78f85",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616786,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1073.33
            },
            "position": {
                "x": 105.17000143947028,
                "y": 402.3112736072387
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-207e800d4e9a",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616819,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1109.37
            },
            "position": {
                "x": 110.31927450698143,
                "y": 394.25351149455526
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-207f2476f50a",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616836,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1128.93
            },
            "position": {
                "x": 112.9719303296387,
                "y": 389.8803198484928
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2080ed9245fe",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616843,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1145.15
            },
            "position": {
                "x": 114.06420037426227,
                "y": 386.2538797411752
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20811dabf4e6",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616852,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1165.55
            },
            "position": {
                "x": 115.46854757449259,
                "y": 381.6928823189016
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2082e0793ec9",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616854,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1180.46
            },
            "position": {
                "x": 115.78062473009932,
                "y": 378.35932979115154
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20831b81dd20",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616876,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1201.52
            },
            "position": {
                "x": 119.21347344177342,
                "y": 373.65077068756904
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20843fe98a51",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616882,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1215.06
            },
            "position": {
                "x": 120.14970490859363,
                "y": 370.6235204376874
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20857678087f",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616906,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1236.62
            },
            "position": {
                "x": 123.89463077587448,
                "y": 365.8031721815982
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2086ff698386",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616922,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1270.66
            },
            "position": {
                "x": 126.39124802072837,
                "y": 358.1925666789415
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2087af9606c8",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967616960,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1293.36
            },
            "position": {
                "x": 132.32071397725636,
                "y": 353.1173391551371
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20889e064659",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617005,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1303.48
            },
            "position": {
                "x": 139.34244997840796,
                "y": 350.85472670840124
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2089bff93a83",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617033,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1326.26
            },
            "position": {
                "x": 143.71153015690226,
                "y": 345.7616129201957
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-208a5725d961",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617085,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1349.71
            },
            "position": {
                "x": 151.82553620267743,
                "y": 340.5187016676311
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-208b7c08e16d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617109,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1373.81
            },
            "position": {
                "x": 155.57046206995824,
                "y": 335.1304645168078
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-208c93192679",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617134,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1380.96
            },
            "position": {
                "x": 159.47142651504245,
                "y": 333.5318796359619
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-208dde49bff5",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617150,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1404.76
            },
            "position": {
                "x": 161.96804375989635,
                "y": 328.21071597664263
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-208ef168466b",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617172,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1429.04
            },
            "position": {
                "x": 165.40089247157047,
                "y": 322.7822347309169
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-208f5bc37800",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617200,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1453.72
            },
            "position": {
                "x": 169.76997265006477,
                "y": 317.26432216318585
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-209059c6c0a0",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617220,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1478.74
            },
            "position": {
                "x": 172.89074420613215,
                "y": 311.6703929717502
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-209100f6e1cd",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617226,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1481.76
            },
            "position": {
                "x": 173.82697567295233,
                "y": 310.99518649060974
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2092cf74a51c",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617233,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1506.04
            },
            "position": {
                "x": 174.91924571757593,
                "y": 305.566705244884
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20932648ac25",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617252,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1530.48
            },
            "position": {
                "x": 177.88397869583991,
                "y": 300.10245147035613
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2094ab2b47b8",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967617275,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1555
            },
            "position": {
                "x": 181.4728659853174,
                "y": 294.6203114314272
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2095e5bb2e88",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618601,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1531.42
            },
            "position": {
                "x": 388.3800201525839,
                "y": 299.8922878636435
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2096502b6139",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618609,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1530.48
            },
            "position": {
                "x": 389.6283287750108,
                "y": 300.10245147035613
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20975a0cb606",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618612,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1506.04
            },
            "position": {
                "x": 390.09644450842086,
                "y": 305.566705244884
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2098178622cb",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618632,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1481.76
            },
            "position": {
                "x": 393.2172160644883,
                "y": 310.99518649060974
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-2099994c57b2",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618649,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1478.74
            },
            "position": {
                "x": 395.8698718871455,
                "y": 311.6703929717502
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-209a9afbd526",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618653,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1453.72
            },
            "position": {
                "x": 396.494026198359,
                "y": 317.26432216318585
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-209bb72d733c",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618683,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1429.04
            },
            "position": {
                "x": 401.17518353246004,
                "y": 322.7822347309169
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-209ceb294c60",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618693,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1423.72
            },
            "position": {
                "x": 402.73556931049376,
                "y": 323.9716713135883
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-209dca1093d3",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618695,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1398.5
            },
            "position": {
                "x": 403.04764646610045,
                "y": 329.61031616602656
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-209ef25507f0",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618712,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1373.81
            },
            "position": {
                "x": 405.7003022887577,
                "y": 335.1304645168078
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-209f5911d86b",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618726,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1366.08
            },
            "position": {
                "x": 407.88484237800486,
                "y": 336.8587248145615
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a0731bcbac",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618733,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1341.11
            },
            "position": {
                "x": 408.97711242262847,
                "y": 342.4414750907465
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a198e8e031",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618759,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1316.85
            },
            "position": {
                "x": 413.034115445516,
                "y": 347.86548477037195
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a26f3c57c6",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618795,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1293.36
            },
            "position": {
                "x": 418.6515042464373,
                "y": 353.1173391551371
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a3d23f526d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618813,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1282.45
            },
            "position": {
                "x": 421.460198646898,
                "y": 355.5565784628334
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a4c320cbf8",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618816,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1259.09
            },
            "position": {
                "x": 421.92831438030805,
                "y": 360.77936766794676
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a515c2bfbb",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618849,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1236.62
            },
            "position": {
                "x": 427.0775874478192,
                "y": 365.8031721815982
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a610b009ac",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618854,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1223.57
            },
            "position": {
                "x": 427.8577803368361,
                "y": 368.72086906202327
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a7f1b46a21",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618889,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1201.52
            },
            "position": {
                "x": 433.3191305599539,
                "y": 373.65077068756904
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a8bce3da96",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618916,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1187
            },
            "position": {
                "x": 437.53217216064485,
                "y": 376.8971276763638
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20a9cc049aa1",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618934,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1165.55
            },
            "position": {
                "x": 440.3408665611055,
                "y": 381.6928823189016
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20aaac8cc3b4",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618957,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1149.6
            },
            "position": {
                "x": 443.929753850583,
                "y": 385.25895628386553
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20abb8e5352d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618976,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1128.93
            },
            "position": {
                "x": 446.894486828847,
                "y": 389.8803198484928
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20ac173c33fc",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967618999,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1111.61
            },
            "position": {
                "x": 450.48337411832443,
                "y": 393.75269609132516
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20ad4bffb470",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619005,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1091.91
            },
            "position": {
                "x": 451.41960558514467,
                "y": 398.15718870008936
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20ae3e1aec0e",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619026,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1073.33
            },
            "position": {
                "x": 454.6964157190154,
                "y": 402.3112736072387
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20af57125f18",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619072,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1054.75
            },
            "position": {
                "x": 461.87419029797036,
                "y": 406.4653585143879
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b03d165501",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619116,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1035.05
            },
            "position": {
                "x": 468.73988772131855,
                "y": 410.8698511231522
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b1822e88c3",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619143,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1017.73
            },
            "position": {
                "x": 472.95292932200954,
                "y": 414.7422273659845
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b26a5785dc",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619156,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 997.07
            },
            "position": {
                "x": 474.9814308334533,
                "y": 419.36135514756165
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b33a4794d2",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619186,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 959.66
            },
            "position": {
                "x": 479.6625881675543,
                "y": 427.72541953811356
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b40a3c9fac",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619211,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 937.14
            },
            "position": {
                "x": 483.56355261263855,
                "y": 432.7604029670156
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b57556d253",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619218,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 923.09
            },
            "position": {
                "x": 484.6558226572621,
                "y": 435.9016781524541
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b6974f4df3",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619236,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 900.05
            },
            "position": {
                "x": 487.4645170577228,
                "y": 441.05292229996314
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b7a324a55d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619270,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 887.58
            },
            "position": {
                "x": 492.76982870303726,
                "y": 443.8409437634804
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b8fcaace8c",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619272,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 864.22
            },
            "position": {
                "x": 493.08190585864406,
                "y": 449.0637329685938
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209e-71cb-b0e9-20b90d2e390f",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619294,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 839.98
            },
            "position": {
                "x": 496.51475457031813,
                "y": 454.48327108211896
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a7bfb33b658",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619302,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 829.81
            },
            "position": {
                "x": 497.76306319274505,
                "y": 456.75706244410543
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a7c476de629",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619316,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 805.56
            },
            "position": {
                "x": 499.9476032819922,
                "y": 462.17883634068073
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a7dac3e79aa",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967619418,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 780.59
            },
            "position": {
                "x": 515.8635382179358,
                "y": 467.76158661686566
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a7e267bd091",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620691,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 805.56
            },
            "position": {
                "x": 714.5006477616238,
                "y": 462.17883634068073
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a7f5bd4d1d4",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620709,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 814.89
            },
            "position": {
                "x": 717.3093421620844,
                "y": 460.09285075490556
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a80558b1597",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620711,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 839.98
            },
            "position": {
                "x": 717.6214193176911,
                "y": 454.48327108211896
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a81a87c4525",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620722,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 850.99
            },
            "position": {
                "x": 719.3378436735281,
                "y": 452.0216739439213
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a8268fe3a21",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620730,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 888.79
            },
            "position": {
                "x": 720.5861522959551,
                "y": 443.5704140144142
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a83413198f6",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620744,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 928.08
            },
            "position": {
                "x": 722.7706923852022,
                "y": 434.7860224104371
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a840e23ee80",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620766,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 943.87
            },
            "position": {
                "x": 726.2035410968764,
                "y": 431.25572097427533
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a85f4b143a2",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620768,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 968.63
            },
            "position": {
                "x": 726.5156182524831,
                "y": 425.7199221421432
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a86b68ec6ec",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620784,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 986.31
            },
            "position": {
                "x": 729.012235497337,
                "y": 421.76705770950605
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a87beb6cb7d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620787,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1010.12
            },
            "position": {
                "x": 729.480351230747,
                "y": 416.4436582671366
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a8820bce40e",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620799,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1029.6
            },
            "position": {
                "x": 731.3528141643875,
                "y": 412.0883528854753
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a897df3f0ae",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620802,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1052.19
            },
            "position": {
                "x": 731.8209298977977,
                "y": 407.0377189752222
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a8a0dace1ed",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620806,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1073.33
            },
            "position": {
                "x": 732.4450842090112,
                "y": 402.3112736072387
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a8b78fc8176",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620818,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1094.47
            },
            "position": {
                "x": 734.3175471426515,
                "y": 397.5848282392551
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a8cfbeb6154",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620820,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1117.06
            },
            "position": {
                "x": 734.6296242982582,
                "y": 392.53419432900205
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a8dc9e56322",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620832,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1136.55
            },
            "position": {
                "x": 736.5020872318987,
                "y": 388.1766531642906
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a8e8f4588e6",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620834,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1160.36
            },
            "position": {
                "x": 736.8141643875053,
                "y": 382.8532537219212
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a8f1e982581",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620850,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1185.63
            },
            "position": {
                "x": 739.3107816323593,
                "y": 377.2034299542322
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a90adf4661d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620856,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1202.79
            },
            "position": {
                "x": 740.2470130991795,
                "y": 373.366826240202
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a915008be06",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620866,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1228.91
            },
            "position": {
                "x": 741.8073988772131,
                "y": 367.5269609132516
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a9258933ca2",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620887,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1270.66
            },
            "position": {
                "x": 745.0842090110839,
                "y": 358.1925666789415
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a93898215d8",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620910,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1298.51
            },
            "position": {
                "x": 748.6730963005614,
                "y": 351.96591088431796
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a94708fe169",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620929,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1327.54
            },
            "position": {
                "x": 751.6378292788254,
                "y": 345.47543268977853
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a955cbf6d3d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620933,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1338.52
            },
            "position": {
                "x": 752.2619835900389,
                "y": 343.02054290073124
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a960960b3a7",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620952,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1367.41
            },
            "position": {
                "x": 755.2267165683029,
                "y": 336.56136566889364
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a97d53830b0",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620966,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1397.19
            },
            "position": {
                "x": 757.41125665755,
                "y": 329.90320374559417
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a98555dbb85",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620984,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1404.76
            },
            "position": {
                "x": 760.2199510580107,
                "y": 328.21071597664263
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a99efd1932b",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967620994,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1433.94
            },
            "position": {
                "x": 761.7803368360443,
                "y": 321.68670103635117
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a9aa37c626a",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621037,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1463.69
            },
            "position": {
                "x": 768.4899956815892,
                "y": 315.03524646220205
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a9be5fc6855",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621076,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1493.88
            },
            "position": {
                "x": 774.5755002159206,
                "y": 308.2854174338471
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a9c4d7c1cfe",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621116,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1524.36
            },
            "position": {
                "x": 780.8170433280553,
                "y": 301.4707506970383
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a9db4d3b7b1",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621117,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1525.82
            },
            "position": {
                "x": 780.9730819058586,
                "y": 301.14432637171865
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a9e35387523",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621141,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1555
            },
            "position": {
                "x": 784.7180077731396,
                "y": 294.6203114314272
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5a9fee75aeae",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621159,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1584.18
            },
            "position": {
                "x": 787.5267021736001,
                "y": 288.0962964911357
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa0afb2ca8e",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621195,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1613.23
            },
            "position": {
                "x": 793.1440909745214,
                "y": 281.60134673049606
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa1d008262f",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621226,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1642.02
            },
            "position": {
                "x": 797.9812868864258,
                "y": 275.1645273291599
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa250f06133",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621250,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1646.31
            },
            "position": {
                "x": 801.7262127537066,
                "y": 274.2053764006523
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa3feeb796b",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621263,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1676.06
            },
            "position": {
                "x": 803.7547142651504,
                "y": 267.55392182650326
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa44787d96a",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621318,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1682.25
            },
            "position": {
                "x": 812.3368360443357,
                "y": 266.16997211847024
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa522df3130",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621320,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1712.81
            },
            "position": {
                "x": 812.6489131999425,
                "y": 259.33741911726025
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa6301667f6",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621369,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1742.59
            },
            "position": {
                "x": 820.2948035123075,
                "y": 252.67925719396078
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa723c827a1",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621400,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1752.32
            },
            "position": {
                "x": 825.1319994242119,
                "y": 250.5038402861802
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa8d98c6dde",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621421,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1782.46
            },
            "position": {
                "x": 828.4088095580826,
                "y": 243.7651901730759
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aa9afee5fe0",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621450,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1794.55
            },
            "position": {
                "x": 832.9339283143804,
                "y": 241.06212846546367
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aaa9a20fa67",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621466,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1807.92
            },
            "position": {
                "x": 835.4305455592342,
                "y": 238.07288652743438
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aab7cfa30ae",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621469,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1839.34
            },
            "position": {
                "x": 835.8986612926443,
                "y": 231.04805618391282
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aac8076e7fe",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621493,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1869.24
            },
            "position": {
                "x": 839.6435871599251,
                "y": 224.36306486401173
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aaddd74e742",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621513,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1886.43
            },
            "position": {
                "x": 842.7643587159924,
                "y": 220.5197538008311
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aae54663bed",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621534,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1915.61
            },
            "position": {
                "x": 846.0411688498632,
                "y": 213.9957388605397
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aaf63f6fb34",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621563,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1935.38
            },
            "position": {
                "x": 850.5662876061609,
                "y": 209.5755957704245
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab00a3d2fac",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621570,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1963.42
            },
            "position": {
                "x": 851.6585576507845,
                "y": 203.3064600978484
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab163724246",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621599,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 1985.68
            },
            "position": {
                "x": 856.1836764070822,
                "y": 198.3296070282497
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab295db1627",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621604,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2012.15
            },
            "position": {
                "x": 856.9638692960991,
                "y": 192.41148929454465
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab3d8af9bf2",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621632,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2036.67
            },
            "position": {
                "x": 861.3329494745934,
                "y": 186.9293492556157
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab49a731def",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621649,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2061.18
            },
            "position": {
                "x": 863.9856052972506,
                "y": 181.449444999737
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab5bfe5091b",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621673,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2087.66
            },
            "position": {
                "x": 867.7305311645315,
                "y": 175.52909148298176
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab65f75e569",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621726,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2109.91
            },
            "position": {
                "x": 876.0005757881099,
                "y": 170.55447419643332
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab7379e47a6",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621760,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2137.95
            },
            "position": {
                "x": 881.3058874334246,
                "y": 164.28533852385715
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab8066926fe",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621802,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2167.95
            },
            "position": {
                "x": 887.859507701166,
                "y": 157.57798937345473
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ab97c8bd9b7",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621806,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2186.91
            },
            "position": {
                "x": 888.4836620123795,
                "y": 153.33894471040037
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5aba0ebbbc97",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621867,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2217.85
            },
            "position": {
                "x": 898.002015258385,
                "y": 146.42143195328532
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5abb11519ec4",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621905,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2233.99
            },
            "position": {
                "x": 903.931481214913,
                "y": 142.81287811036884
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5abc4b30e68a",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967621950,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2265.41
            },
            "position": {
                "x": 910.9532172160644,
                "y": 135.78804776684734
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5abd5759c3a6",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622010,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2298.31
            },
            "position": {
                "x": 920.3155318842666,
                "y": 128.43232153190593
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5abe06edc5ea",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622037,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2310.25
            },
            "position": {
                "x": 924.5285734849575,
                "y": 125.7627965700458
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5abf414fc070",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622054,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2342.9
            },
            "position": {
                "x": 927.1812293076148,
                "y": 118.46296491135774
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac0eddd79e9",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622103,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2376.61
            },
            "position": {
                "x": 934.8271196199798,
                "y": 110.92614024935551
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac13c6b44a4",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622113,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2384.23
            },
            "position": {
                "x": 936.3875053980136,
                "y": 109.22247356515334
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac24afa61bc",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622163,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2417.05
            },
            "position": {
                "x": 944.1894342881819,
                "y": 101.88463359461304
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac3ea3db495",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622209,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2450.47
            },
            "position": {
                "x": 951.3672088671368,
                "y": 94.41264664106484
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac4aa1e29ff",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622252,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2454.01
            },
            "position": {
                "x": 958.0768677126817,
                "y": 93.62117944131722
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac535089663",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622284,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2486.09
            },
            "position": {
                "x": 963.0701022023895,
                "y": 86.44878741648688
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac610cb1df8",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622326,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2518.33
            },
            "position": {
                "x": 969.6237224701309,
                "y": 79.24062286285442
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac779e61885",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622378,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2548.97
            },
            "position": {
                "x": 977.7377285159062,
                "y": 72.39018359724344
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac8a5443303",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622402,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2579.46
            },
            "position": {
                "x": 981.482654383187,
                "y": 65.57328107738442
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ac9b45b9b9d",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622449,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2609.64
            },
            "position": {
                "x": 988.8164675399453,
                "y": 58.82568783207955
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5acaad76f22e",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622471,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2605.36
            },
            "position": {
                "x": 992.2493162516195,
                "y": 59.78260297753695
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5acbf6028ff1",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622484,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2633.77
            },
            "position": {
                "x": 994.2778177630632,
                "y": 53.43074333210586
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5acc39afe4c4",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622534,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2661.68
            },
            "position": {
                "x": 1002.0797466532316,
                "y": 47.190672839181445
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5acdf7270af5",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622559,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2655.39
            },
            "position": {
                "x": 1005.9807110983157,
                "y": 48.59698037771585
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5acef2363adc",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622589,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2681.62
            },
            "position": {
                "x": 1010.6618684324169,
                "y": 42.73252143721402
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5acf19bcfdb7",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622627,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2707.26
            },
            "position": {
                "x": 1016.5913343889449,
                "y": 36.99997369666994
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad061fff2af",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622678,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2732.23
            },
            "position": {
                "x": 1024.5493018569166,
                "y": 31.417223420485016
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad1915d8bdf",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622692,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2723.62
            },
            "position": {
                "x": 1026.733841946164,
                "y": 33.34223262665057
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad20bbeab9b",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622707,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2747.08
            },
            "position": {
                "x": 1029.0744206132144,
                "y": 28.097085591035864
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad37f56d444",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622827,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2769.86
            },
            "position": {
                "x": 1047.7990499496186,
                "y": 23.003971802830222
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad49644dae5",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622869,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2791.92
            },
            "position": {
                "x": 1054.35267021736,
                "y": 18.071834394234315
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad599887e71",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622925,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2813.25
            },
            "position": {
                "x": 1063.0908305743487,
                "y": 13.30290914829817
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad685cd3bc5",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967622955,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2833.83
            },
            "position": {
                "x": 1067.7719879084498,
                "y": 8.70166763112212
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad7df092f51",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967623015,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2853.67
            },
            "position": {
                "x": 1077.1343025766519,
                "y": 4.265874059655971
            }
        },
        {
            "group": "nodes",
            "data": {
                "id": "01960c92-209f-7182-9b9c-5ad855d48dd0",
                "label": "",
                "change": "frequency",
                "color": "#6b00b8",
                "timestamp": 1743967623059,
                "parents": "Oscillator_Basilisk_16dbbcd4a632",
                "param": "frequency",
                "value": 2872.75
            },
            "position": {
                "x": 1084,
                "y": 0
            }
        }
    ],
    "scheduler": [],
    "loop": false,
    "startTime": 1743967616112,
    "endTime": 1743967623059,
    "length": 6947,
    "assign": {
        "parent": null,
        "param": "default",
        "range": null
    },
    "gesturePoints": [
        {
            "value": 591.67,
            "timestamp": 1743967616112,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 615.24,
            "timestamp": 1743967616361,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 638.75,
            "timestamp": 1743967616375,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 662.12,
            "timestamp": 1743967616392,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 664.91,
            "timestamp": 1743967616395,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 688.97,
            "timestamp": 1743967616406,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 692.95,
            "timestamp": 1743967616418,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 717.63,
            "timestamp": 1743967616420,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 741.91,
            "timestamp": 1743967616449,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 765.71,
            "timestamp": 1743967616476,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 772.85,
            "timestamp": 1743967616483,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 796.95,
            "timestamp": 1743967616500,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 820.41,
            "timestamp": 1743967616522,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 843.19,
            "timestamp": 1743967616545,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 853.31,
            "timestamp": 1743967616556,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 876.01,
            "timestamp": 1743967616566,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 897.9,
            "timestamp": 1743967616605,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 910.05,
            "timestamp": 1743967616609,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 931.61,
            "timestamp": 1743967616626,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 952.28,
            "timestamp": 1743967616640,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 966.21,
            "timestamp": 1743967616650,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 986.31,
            "timestamp": 1743967616675,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1001.51,
            "timestamp": 1743967616682,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1020.89,
            "timestamp": 1743967616707,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1037.3,
            "timestamp": 1743967616716,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1054.75,
            "timestamp": 1743967616784,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1073.33,
            "timestamp": 1743967616786,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1109.37,
            "timestamp": 1743967616819,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1128.93,
            "timestamp": 1743967616836,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1145.15,
            "timestamp": 1743967616843,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1165.55,
            "timestamp": 1743967616852,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1180.46,
            "timestamp": 1743967616854,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1201.52,
            "timestamp": 1743967616876,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1215.06,
            "timestamp": 1743967616882,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1236.62,
            "timestamp": 1743967616906,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1270.66,
            "timestamp": 1743967616922,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1293.36,
            "timestamp": 1743967616960,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1303.48,
            "timestamp": 1743967617005,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1326.26,
            "timestamp": 1743967617033,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1349.71,
            "timestamp": 1743967617085,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1373.81,
            "timestamp": 1743967617109,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1380.96,
            "timestamp": 1743967617134,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1404.76,
            "timestamp": 1743967617150,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1429.04,
            "timestamp": 1743967617172,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1453.72,
            "timestamp": 1743967617200,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1478.74,
            "timestamp": 1743967617220,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1481.76,
            "timestamp": 1743967617226,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1506.04,
            "timestamp": 1743967617233,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1530.48,
            "timestamp": 1743967617252,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1555,
            "timestamp": 1743967617275,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1531.42,
            "timestamp": 1743967618601,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1530.48,
            "timestamp": 1743967618609,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1506.04,
            "timestamp": 1743967618612,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1481.76,
            "timestamp": 1743967618632,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1478.74,
            "timestamp": 1743967618649,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1453.72,
            "timestamp": 1743967618653,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1429.04,
            "timestamp": 1743967618683,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1423.72,
            "timestamp": 1743967618693,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1398.5,
            "timestamp": 1743967618695,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1373.81,
            "timestamp": 1743967618712,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1366.08,
            "timestamp": 1743967618726,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1341.11,
            "timestamp": 1743967618733,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1316.85,
            "timestamp": 1743967618759,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1293.36,
            "timestamp": 1743967618795,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1282.45,
            "timestamp": 1743967618813,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1259.09,
            "timestamp": 1743967618816,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1236.62,
            "timestamp": 1743967618849,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1223.57,
            "timestamp": 1743967618854,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1201.52,
            "timestamp": 1743967618889,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1187,
            "timestamp": 1743967618916,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1165.55,
            "timestamp": 1743967618934,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1149.6,
            "timestamp": 1743967618957,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1128.93,
            "timestamp": 1743967618976,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1111.61,
            "timestamp": 1743967618999,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1091.91,
            "timestamp": 1743967619005,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1073.33,
            "timestamp": 1743967619026,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1054.75,
            "timestamp": 1743967619072,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1035.05,
            "timestamp": 1743967619116,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1017.73,
            "timestamp": 1743967619143,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 997.07,
            "timestamp": 1743967619156,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 959.66,
            "timestamp": 1743967619186,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 937.14,
            "timestamp": 1743967619211,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 923.09,
            "timestamp": 1743967619218,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 900.05,
            "timestamp": 1743967619236,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 887.58,
            "timestamp": 1743967619270,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 864.22,
            "timestamp": 1743967619272,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 839.98,
            "timestamp": 1743967619294,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 829.81,
            "timestamp": 1743967619302,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 805.56,
            "timestamp": 1743967619316,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 780.59,
            "timestamp": 1743967619418,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 805.56,
            "timestamp": 1743967620691,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 814.89,
            "timestamp": 1743967620709,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 839.98,
            "timestamp": 1743967620711,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 850.99,
            "timestamp": 1743967620722,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 888.79,
            "timestamp": 1743967620730,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 928.08,
            "timestamp": 1743967620744,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 943.87,
            "timestamp": 1743967620766,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 968.63,
            "timestamp": 1743967620768,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 986.31,
            "timestamp": 1743967620784,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1010.12,
            "timestamp": 1743967620787,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1029.6,
            "timestamp": 1743967620799,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1052.19,
            "timestamp": 1743967620802,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1073.33,
            "timestamp": 1743967620806,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1094.47,
            "timestamp": 1743967620818,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1117.06,
            "timestamp": 1743967620820,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1136.55,
            "timestamp": 1743967620832,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1160.36,
            "timestamp": 1743967620834,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1185.63,
            "timestamp": 1743967620850,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1202.79,
            "timestamp": 1743967620856,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1228.91,
            "timestamp": 1743967620866,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1270.66,
            "timestamp": 1743967620887,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1298.51,
            "timestamp": 1743967620910,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1327.54,
            "timestamp": 1743967620929,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1338.52,
            "timestamp": 1743967620933,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1367.41,
            "timestamp": 1743967620952,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1397.19,
            "timestamp": 1743967620966,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1404.76,
            "timestamp": 1743967620984,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1433.94,
            "timestamp": 1743967620994,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1463.69,
            "timestamp": 1743967621037,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1493.88,
            "timestamp": 1743967621076,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1524.36,
            "timestamp": 1743967621116,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1525.82,
            "timestamp": 1743967621117,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1555,
            "timestamp": 1743967621141,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1584.18,
            "timestamp": 1743967621159,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1613.23,
            "timestamp": 1743967621195,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1642.02,
            "timestamp": 1743967621226,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1646.31,
            "timestamp": 1743967621250,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1676.06,
            "timestamp": 1743967621263,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1682.25,
            "timestamp": 1743967621318,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1712.81,
            "timestamp": 1743967621320,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1742.59,
            "timestamp": 1743967621369,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1752.32,
            "timestamp": 1743967621400,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1782.46,
            "timestamp": 1743967621421,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1794.55,
            "timestamp": 1743967621450,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1807.92,
            "timestamp": 1743967621466,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1839.34,
            "timestamp": 1743967621469,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1869.24,
            "timestamp": 1743967621493,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1886.43,
            "timestamp": 1743967621513,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1915.61,
            "timestamp": 1743967621534,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1935.38,
            "timestamp": 1743967621563,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1963.42,
            "timestamp": 1743967621570,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 1985.68,
            "timestamp": 1743967621599,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2012.15,
            "timestamp": 1743967621604,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2036.67,
            "timestamp": 1743967621632,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2061.18,
            "timestamp": 1743967621649,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2087.66,
            "timestamp": 1743967621673,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2109.91,
            "timestamp": 1743967621726,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2137.95,
            "timestamp": 1743967621760,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2167.95,
            "timestamp": 1743967621802,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2186.91,
            "timestamp": 1743967621806,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2217.85,
            "timestamp": 1743967621867,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2233.99,
            "timestamp": 1743967621905,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2265.41,
            "timestamp": 1743967621950,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2298.31,
            "timestamp": 1743967622010,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2310.25,
            "timestamp": 1743967622037,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2342.9,
            "timestamp": 1743967622054,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2376.61,
            "timestamp": 1743967622103,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2384.23,
            "timestamp": 1743967622113,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2417.05,
            "timestamp": 1743967622163,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2450.47,
            "timestamp": 1743967622209,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2454.01,
            "timestamp": 1743967622252,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2486.09,
            "timestamp": 1743967622284,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2518.33,
            "timestamp": 1743967622326,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2548.97,
            "timestamp": 1743967622378,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2579.46,
            "timestamp": 1743967622402,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2609.64,
            "timestamp": 1743967622449,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2605.36,
            "timestamp": 1743967622471,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2633.77,
            "timestamp": 1743967622484,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2661.68,
            "timestamp": 1743967622534,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2655.39,
            "timestamp": 1743967622559,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2681.62,
            "timestamp": 1743967622589,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2707.26,
            "timestamp": 1743967622627,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2732.23,
            "timestamp": 1743967622678,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2723.62,
            "timestamp": 1743967622692,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2747.08,
            "timestamp": 1743967622707,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2769.86,
            "timestamp": 1743967622827,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2791.92,
            "timestamp": 1743967622869,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2813.25,
            "timestamp": 1743967622925,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2833.83,
            "timestamp": 1743967622955,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2853.67,
            "timestamp": 1743967623015,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        },
        {
            "value": 2872.75,
            "timestamp": 1743967623059,
            "parent": "Oscillator_Basilisk_16dbbcd4a632",
            "param": "frequency",
            "msg": "gesture"
        }
    ],
    "values": [
        591.67,
        615.24,
        638.75,
        662.12,
        664.91,
        688.97,
        692.95,
        717.63,
        741.91,
        765.71,
        772.85,
        796.95,
        820.41,
        843.19,
        853.31,
        876.01,
        897.9,
        910.05,
        931.61,
        952.28,
        966.21,
        986.31,
        1001.51,
        1020.89,
        1037.3,
        1054.75,
        1073.33,
        1109.37,
        1128.93,
        1145.15,
        1165.55,
        1180.46,
        1201.52,
        1215.06,
        1236.62,
        1270.66,
        1293.36,
        1303.48,
        1326.26,
        1349.71,
        1373.81,
        1380.96,
        1404.76,
        1429.04,
        1453.72,
        1478.74,
        1481.76,
        1506.04,
        1530.48,
        1555,
        1531.42,
        1530.48,
        1506.04,
        1481.76,
        1478.74,
        1453.72,
        1429.04,
        1423.72,
        1398.5,
        1373.81,
        1366.08,
        1341.11,
        1316.85,
        1293.36,
        1282.45,
        1259.09,
        1236.62,
        1223.57,
        1201.52,
        1187,
        1165.55,
        1149.6,
        1128.93,
        1111.61,
        1091.91,
        1073.33,
        1054.75,
        1035.05,
        1017.73,
        997.07,
        959.66,
        937.14,
        923.09,
        900.05,
        887.58,
        864.22,
        839.98,
        829.81,
        805.56,
        780.59,
        805.56,
        814.89,
        839.98,
        850.99,
        888.79,
        928.08,
        943.87,
        968.63,
        986.31,
        1010.12,
        1029.6,
        1052.19,
        1073.33,
        1094.47,
        1117.06,
        1136.55,
        1160.36,
        1185.63,
        1202.79,
        1228.91,
        1270.66,
        1298.51,
        1327.54,
        1338.52,
        1367.41,
        1397.19,
        1404.76,
        1433.94,
        1463.69,
        1493.88,
        1524.36,
        1525.82,
        1555,
        1584.18,
        1613.23,
        1642.02,
        1646.31,
        1676.06,
        1682.25,
        1712.81,
        1742.59,
        1752.32,
        1782.46,
        1794.55,
        1807.92,
        1839.34,
        1869.24,
        1886.43,
        1915.61,
        1935.38,
        1963.42,
        1985.68,
        2012.15,
        2036.67,
        2061.18,
        2087.66,
        2109.91,
        2137.95,
        2167.95,
        2186.91,
        2217.85,
        2233.99,
        2265.41,
        2298.31,
        2310.25,
        2342.9,
        2376.61,
        2384.23,
        2417.05,
        2450.47,
        2454.01,
        2486.09,
        2518.33,
        2548.97,
        2579.46,
        2609.64,
        2605.36,
        2633.77,
        2661.68,
        2655.39,
        2681.62,
        2707.26,
        2732.23,
        2723.62,
        2747.08,
        2769.86,
        2791.92,
        2813.25,
        2833.83,
        2853.67,
        2872.75
    ],
    "timestamps": [
        1743967616112,
        1743967616361,
        1743967616375,
        1743967616392,
        1743967616395,
        1743967616406,
        1743967616418,
        1743967616420,
        1743967616449,
        1743967616476,
        1743967616483,
        1743967616500,
        1743967616522,
        1743967616545,
        1743967616556,
        1743967616566,
        1743967616605,
        1743967616609,
        1743967616626,
        1743967616640,
        1743967616650,
        1743967616675,
        1743967616682,
        1743967616707,
        1743967616716,
        1743967616784,
        1743967616786,
        1743967616819,
        1743967616836,
        1743967616843,
        1743967616852,
        1743967616854,
        1743967616876,
        1743967616882,
        1743967616906,
        1743967616922,
        1743967616960,
        1743967617005,
        1743967617033,
        1743967617085,
        1743967617109,
        1743967617134,
        1743967617150,
        1743967617172,
        1743967617200,
        1743967617220,
        1743967617226,
        1743967617233,
        1743967617252,
        1743967617275,
        1743967618601,
        1743967618609,
        1743967618612,
        1743967618632,
        1743967618649,
        1743967618653,
        1743967618683,
        1743967618693,
        1743967618695,
        1743967618712,
        1743967618726,
        1743967618733,
        1743967618759,
        1743967618795,
        1743967618813,
        1743967618816,
        1743967618849,
        1743967618854,
        1743967618889,
        1743967618916,
        1743967618934,
        1743967618957,
        1743967618976,
        1743967618999,
        1743967619005,
        1743967619026,
        1743967619072,
        1743967619116,
        1743967619143,
        1743967619156,
        1743967619186,
        1743967619211,
        1743967619218,
        1743967619236,
        1743967619270,
        1743967619272,
        1743967619294,
        1743967619302,
        1743967619316,
        1743967619418,
        1743967620691,
        1743967620709,
        1743967620711,
        1743967620722,
        1743967620730,
        1743967620744,
        1743967620766,
        1743967620768,
        1743967620784,
        1743967620787,
        1743967620799,
        1743967620802,
        1743967620806,
        1743967620818,
        1743967620820,
        1743967620832,
        1743967620834,
        1743967620850,
        1743967620856,
        1743967620866,
        1743967620887,
        1743967620910,
        1743967620929,
        1743967620933,
        1743967620952,
        1743967620966,
        1743967620984,
        1743967620994,
        1743967621037,
        1743967621076,
        1743967621116,
        1743967621117,
        1743967621141,
        1743967621159,
        1743967621195,
        1743967621226,
        1743967621250,
        1743967621263,
        1743967621318,
        1743967621320,
        1743967621369,
        1743967621400,
        1743967621421,
        1743967621450,
        1743967621466,
        1743967621469,
        1743967621493,
        1743967621513,
        1743967621534,
        1743967621563,
        1743967621570,
        1743967621599,
        1743967621604,
        1743967621632,
        1743967621649,
        1743967621673,
        1743967621726,
        1743967621760,
        1743967621802,
        1743967621806,
        1743967621867,
        1743967621905,
        1743967621950,
        1743967622010,
        1743967622037,
        1743967622054,
        1743967622103,
        1743967622113,
        1743967622163,
        1743967622209,
        1743967622252,
        1743967622284,
        1743967622326,
        1743967622378,
        1743967622402,
        1743967622449,
        1743967622471,
        1743967622484,
        1743967622534,
        1743967622559,
        1743967622589,
        1743967622627,
        1743967622678,
        1743967622692,
        1743967622707,
        1743967622827,
        1743967622869,
        1743967622925,
        1743967622955,
        1743967623015,
        1743967623059
    ],
    "range": 2281.08,
    "min": 591.67,
    "max": 2872.75
}

calculate(gesture, 1, 120)