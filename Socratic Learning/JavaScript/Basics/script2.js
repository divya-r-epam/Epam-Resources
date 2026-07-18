console.time("A");


for (let i = 0; i < 100000; i++) {}

console.timeEnd("A");
console.time("B");
for (let i = 0; i < 100000; i++) {}

console.timeEnd("B");

// -----------

console.time("Task");

for (let i = 0; i < 50000; i++) {}

console.timeLog("Task");

for (let i = 0; i < 50000; i++) {}

console.timeEnd("Task");