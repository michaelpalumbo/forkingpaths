query tool: make it so users can select multiple options (i.e. selected module changes & cable changes = only the cable changes of that selected module)

query tool: have another dropdown next to it for logic: ( &&, OR etc) i.e. && means all checked items have to be satisfied, OR means any items that are checked

query tool: multi-select and assign all results to the sequencer table

query tool: filtering by time range, recency, or collaborator (i.e. peer name) (IMPORTANT: is peer name even stored in any of the change data?)

query tool: highlight all results in the history graph


gesture editor: gestures can be trimmed, extended, or otherwise shaped before reassignment? E.g., clipping to first 2 seconds, or looping the first N values?


sequencer: when playing a gesture as a step, load that gesture into the editor

legibility: after saving a gesture, its node is highlighted. but if you click another node, the first node remains highlighted (should unhighlight)

sequencer: add a burst feature to all steps. i figured out that this can work because i accidentally clicked a gesture change node twice and it played back both (and they competed with each other and it sounded awesome)


node hover: gestures aren't displaying module names correctly when param has more than one word

**PRIORITY: history graph gesture node: when player clicks on a gesture node, that gesture should begin playing back in the editor just once.**

**priority: get merges working. merges on gestures too**

**priority: when creating merges, the colour of the node needs to be specific, AND when you hover over it, you should have info on the 2 parent changes (what their change nodes are)**

go through script src tags in html and download them. put in dir so that player can use the app offline?