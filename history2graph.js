let branches = {
    "ForkingPaths_initial_branch": {
        "head": "5fbc6e4f35769bdf36c3a3c4f0a548f7fbb94e9b7bc40f29209ec5933579714b",
        "root": "thisIsTheRoot",
        "history": [
            {
                "actor": "4059705d5df14e11a5ae34fb503f355c",
                "hash": "ada35b43ae56e0afec6ebb8f72ace470857909072f54189147b3843d6c688edc",
                "seq": 1,
                "startOp": 1,
                "time": 1731982163,
                "message": "{\"branch\":\"ForkingPaths_initial_branch\",\"msg\":\"blank_patch\"}",
                "deps": []
            }
        ]
    },
    "0193422e-a38d-7963-8e20-17386fa5b29f": {
        "head": "fae6499dec79e62b96e4f368cb725be40b453badc82c82c8ca2f30ef06ed4d4a",
        "parent": "78a56d5bf41809f2d46696746b260fe842091d90a3def82c38e1b51dc376b067",
        "history": [
            {
                "actor": "4059705d5df14e11a5ae34fb503f355c",
                "hash": "ada35b43ae56e0afec6ebb8f72ace470857909072f54189147b3843d6c688edc",
                "seq": 1,
                "startOp": 1,
                "time": 1731982163,
                "message": "{\"branch\":\"ForkingPaths_initial_branch\",\"msg\":\"blank_patch\"}",
                "deps": []
            },
            {
                "actor": "4059705d5df14e11a5ae34fb503f355c",
                "hash": "95db15a812bd86f9957979f03b01869ba2f3f503632132902684828e076cbda8",
                "seq": 2,
                "startOp": 3,
                "time": 1731982163,
                "message": "{\"branch\":\"ForkingPaths_initial_branch\",\"msg\":\"add oscillator_f6832ead18e7\"}",
                "deps": [
                    "ada35b43ae56e0afec6ebb8f72ace470857909072f54189147b3843d6c688edc"
                ]
            },
            {
                "actor": "4059705d5df14e11a5ae34fb503f355c",
                "hash": "f4799e3fda7d8f9a5273acffb9736878a834ea65375265da6326082e47d90f4e",
                "seq": 3,
                "startOp": 140,
                "time": 1731982164,
                "message": "{\"branch\":\"ForkingPaths_initial_branch\",\"msg\":\"add oscillator_aa4e94ccf611\"}",
                "deps": [
                    "95db15a812bd86f9957979f03b01869ba2f3f503632132902684828e076cbda8"
                ]
            },
            {
                "actor": "4059705d5df14e11a5ae34fb503f355c",
                "hash": "78a56d5bf41809f2d46696746b260fe842091d90a3def82c38e1b51dc376b067",
                "seq": 4,
                "startOp": 277,
                "time": 1731982165,
                "message": "{\"branch\":\"ForkingPaths_initial_branch\",\"msg\":\"add oscillator_fb78c31c7ab3\"}",
                "deps": [
                    "f4799e3fda7d8f9a5273acffb9736878a834ea65375265da6326082e47d90f4e"
                ]
            }
        ]
    }
}

let branchNames = Object.keys(branches)

console.log(branchNames)

// Iterate over each object and collect all 'history' entries
const historyArray = [];
let historyObj = {}
Object.keys(branches).forEach(branch => {
  const branchData = branches[branch];
  let branchArray = []
  if (branchData.history && Array.isArray(branchData.history)) {
    branchArray.push(...branchData.history);
  }
//   console.log(branch, '\n\n', branchArray)
});

// console.log(historyArray);

const matchingObjects = [];

historyArray.forEach(entry => {
  historyArray.forEach(target => {
    if (entry.deps.includes(target.hash)) {
      matchingObjects.push({source: target.hash, dest: entry.hash });
    }
  });
});

// console.log(matchingObjects);

let arr = []

console.log(arr.push('steve'))
// todo:
// * 
//! uyou're very close. we have the branch edges, just need to also iterate over the individual changes on each branch and get edges for those. 