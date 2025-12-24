{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 9,
            "minor": 1,
            "revision": 2,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [ 1673.0, 782.0, 628.0, 786.0 ],
        "boxes": [
            {
                "box": {
                    "id": "obj-40",
                    "linecount": 10,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 243.0, 489.0, 154.0, 141.0 ],
                    "text": "current limitation is that when forking paths loads it also needs to get the full state of the namespace. without it, earlier changeNodes will contain fewer parameters than later changes (but we need the full spec at the beginning. "
                }
            },
            {
                "box": {
                    "id": "obj-34",
                    "linecount": 13,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 46.0, 542.0, 151.0, 194.0 ],
                    "text": "todo: write a script that automatically configures all UI objects in a patch the following: \n\n- parameter mode enabled\n- gives a name to the parameter based on: (first checks if there's a scripting name, or short or long label; if not, maybe something generic like object-name-#)\n"
                }
            },
            {
                "box": {
                    "id": "obj-31",
                    "maxclass": "multislider",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 363.0, 210.0, 174.0, 149.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_invisible": 1,
                            "parameter_longname": "multislider[1]",
                            "parameter_modmode": 0,
                            "parameter_osc_name": "multislider2",
                            "parameter_shortname": "multislider",
                            "parameter_type": 3
                        }
                    },
                    "size": 4,
                    "varname": "multislider[1]"
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "multislider",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 157.0, 210.0, 174.0, 149.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_invisible": 1,
                            "parameter_longname": "multislider",
                            "parameter_modmode": 0,
                            "parameter_osc_name": "multislider",
                            "parameter_shortname": "multislider",
                            "parameter_type": 3
                        }
                    },
                    "size": 4,
                    "varname": "multislider"
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "slider",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 106.0, 26.0, 20.0, 140.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_longname": "slider[1]",
                            "parameter_modmode": 3,
                            "parameter_osc_name": "slider2",
                            "parameter_shortname": "slider",
                            "parameter_type": 0
                        }
                    },
                    "varname": "slider[1]"
                }
            },
            {
                "box": {
                    "id": "obj-20",
                    "maxclass": "slider",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 46.0, 26.0, 20.0, 140.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_longname": "slider",
                            "parameter_modmode": 3,
                            "parameter_osc_name": "slider1",
                            "parameter_shortname": "slider",
                            "parameter_type": 0
                        }
                    },
                    "varname": "slider"
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 853.0, 124.0, 153.0, 22.0 ],
                    "text": "/max-bridge/slider2/raw 0."
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 875.0, 71.0, 104.0, 22.0 ],
                    "text": "udpreceive 30338"
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "number",
                    "maximum": 127,
                    "minimum": 0,
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 897.0, 245.0, 50.0, 22.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_linknames": 1,
                            "parameter_longname": "number[1]",
                            "parameter_modmode": 4,
                            "parameter_osc_name": "gain2",
                            "parameter_shortname": "number",
                            "parameter_type": 1
                        }
                    },
                    "varname": "number[1]"
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "number",
                    "maximum": 127,
                    "minimum": 0,
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 46.0, 206.0, 50.0, 22.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_longname": "number",
                            "parameter_modmode": 4,
                            "parameter_osc_name": "gain",
                            "parameter_shortname": "number",
                            "parameter_type": 1
                        }
                    },
                    "varname": "number"
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-18", 1 ],
                    "source": [ "obj-16", 0 ]
                }
            }
        ],
        "parameters": {
            "obj-12": [ "number", "number", 0 ],
            "obj-15": [ "number[1]", "number", 0 ],
            "obj-20": [ "slider", "slider", 0 ],
            "obj-21": [ "slider[1]", "slider", 0 ],
            "obj-25": [ "multislider", "multislider", 0 ],
            "obj-31": [ "multislider[1]", "multislider", 0 ],
            "inherited_shortname": 1
        },
        "autosave": 0,
        "oscreceiveudpport": 0
    }
}