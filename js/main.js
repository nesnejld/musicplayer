const myWorker = new Worker("js/worker.js");
const first = document.querySelector("input#number1");
const second = document.querySelector("input#number2");
const result = document.querySelector("pre#result");

first.onchange = () => {
    myWorker.postMessage([first.value, second.value]);
    console.log("Message posted to worker");
};
second.onchange = () => {
    myWorker.postMessage([first.value, second.value]);
    console.log("Message posted to worker");
};
myWorker.onmessage = (e) => {
    if (e.data.type == 'result') {
        console.log(e.data);
        result.textContent = JSON.stringify(e.data, null, 2);
        // console.log("Message received from worker");
    }
    else if (e.data.type == 'url') {
        console.log(e.data.url);
        result.textContent = e.data.url;
        // console.log("Message received from worker");
    }
};
let json = myWorker.postMessage([]);

