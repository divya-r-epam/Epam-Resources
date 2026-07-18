const items = [
    { name: "Divya" },
    {
        age: 23,
    },
    {
        designation: "JSE",
    },
];

console.table(items);

let a = 0;

console.time("Loop time")
for (let i = 0; i < 100000; i++) {
    a += i;
}

console.timeEnd("Loop time");