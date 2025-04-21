**!**
**!**
**!**
**MEGA PRIORITY: recall patch history on page load. this will also help speed up development**
**!**
**!**
**!**

query tool + graph analysis: graph analysis: https://networkx.org/ (very lightweight, much, much better at it than cytoscape i.e. cytoscape excels at rendering, networkx is for analysis)

query tool: make it so users can select multiple options (i.e. selected module changes & cable changes = only the cable changes of that selected module)

query tool: have another dropdown next to it for logic: ( &&, OR etc) i.e. && means all checked items have to be satisfied, OR means any items that are checked

query tool: multi-select and assign all results to the sequencer table

query tool: filtering by time range, recency, or collaborator (i.e. peer name) (IMPORTANT: is peer name even stored in any of the change data?)

query tool: highlight all results in the history graph

query tool: merges aren't being retrieved

gesture editor: gestures can be trimmed, extended, or otherwise shaped before reassignment? E.g., clipping to first 2 seconds, or looping the first N values?

sequencer: when playing a gesture as a step, load that gesture into the editor

sequencer: save sequencer state (all steps and their settings) as a change node. (then experiment with ways to add this AS a step in another sequencer)

legibility: after saving a gesture, its node is highlighted. but if you click another node, the first node remains highlighted (should unhighlight)

chris vanderwees asked about creating changeNodes based on analysis of the graph (in other words, machine agency based on affordances of the patch history)


**priority: when creating merges, when you hover over it, you should have info on the 2 parent changes (what their change nodes are)**


go through script src tags in html and download them. put in dir so that player can use the app offline?

lit review:

look into Mental time travel by endel tulving (u of t psychologist) (someone at freq freaks recommended him)



# Feature: Nested Sequencer Playback via ChangeNode

## Overview
- Save **sequencer settings** as a **changeNode**
- This allows one sequencer (e.g., `seq2`) to **embed** another sequencer (e.g., `seq1`) as a **step**

---

## Behavior When Used as a Step

- When `seq1` is added as a step in `seq2`, playback behaves as follows:
  - **All settings and steps of `seq1` are recalled**
  - Playback of `seq1`:
    - If **monophonic**: plays through once, step by step
    - If **polyphonic**: plays until the **longest stepLength** of `seq1` completes
  - After playback, `seq2` resumes at the **next step**, reloading its own settings
- Requires:
  - **Temporarily storing `seq2`’s current sequence and settings** during the nested playback
  - Then **restoring** `seq2` after `seq1` finishes

---

## Interaction / UI Logic

- Clicking on a **sequencer changeNode** does **not** immediately load it as a step, it — it prepares it for use:
  - **Click** → makes it available to be added as a step
  - **Cmd + Click** → directly **loads** the sequencer settings into the current sequencer

---

## Additional Notes

- Must differentiate between:
  - **Loading sequencer settings** into the current sequencer (overwriting settings)
  - **Using a sequencer as a step** (nested sequencer behavior)
- The same UI for adding other changeNodes to steps can be reused here


What You're Proposing:
When a sequence changeNode is added as a step in the main sequencer:

It contains gesture steps, but only includes minimal metadata (label, id, branch, etc.)

At that point, send a message/request to the main app (or central data store) to:

Preload the full gesture data for any gesture-type steps in the embedded sequence.

Store the results (gesture data blobs) in a lookup — maybe a simple Map or object — something like:

js
Copy
Edit
gestureDataCache[gestureNodeID] = fullGestureData;
Then when you're inside the embedded sequencer playback, you just:

js
Copy
Edit
if (row.stepChange?.startsWith("gesture")) {
  const gestureData = gestureDataCache[row.node.id];
  playGestureFromSequencerStep(gestureData, `${subStepDuration}s`);
}
🔧 A Few Tips
A. Where to trigger the preload
You could do this:

When the sequence changeNode is clicked/loaded into a step

Or as part of your updateStepRow() logic

Or when the playback reaches a step that references a sequence, and it hasn't been preloaded yet

B. Avoid duplicate fetches
If you’re sending messages back to the main app (e.g., via postMessage() or event bus), make sure to check:

js
Copy
Edit
if (!gestureDataCache[nodeID]) {
  requestGestureDataFromMainApp(nodeID);
}
C. Async or blocking?
Ideally, do the preload ahead of time, but if it’s async and late:

You could delay playback until data is available (if musically necessary), or

Fallback to a message like “gesture data not available” in testing mode

🧠 This approach is actually modular and scalable
It decouples storage from execution — your table rows don’t bloat with gesture data

You gain the ability to store and load gestures independently, even reuse them

It opens the door to adding other types of data-on-demand features later