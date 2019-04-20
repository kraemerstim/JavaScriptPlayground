"use strict"

let VF = Vex.Flow;

let element = document.getElementById("output_notes");
let possibleArray = [];
let currentNote = "";

window.addEventListener("load", function () {
    document.getElementById("button_next").addEventListener("click", nextButtonPressed);
    document.getElementById("button_reload").addEventListener("click", initiateArray);
    initiateArray();
})

window.addEventListener("keydown", keyDownFunction);

function keyDownFunction(e) {
    var input = String.fromCharCode(e.keyCode);
    if (input.toUpperCase() == currentNote.toUpperCase())
        console.log("yeah");
    else
        console.log("nope, richtig wäre " + currentNote)
    nextButtonPressed();
}

let initiateArray = function () {
    let possibleNote = "cdefgab";
    let lowest = document.getElementById("input_low").value;
    let highest = document.getElementById("input_high").value;

    let lowestArray = [lowest.charAt(0), parseInt(lowest.charAt(1))];
    let highestArray = [highest.charAt(0), parseInt(highest.charAt(1))];

    let firstIndex = possibleNote.indexOf(lowestArray[0]);
    let lastIndex = possibleNote.indexOf(highestArray[0]);

    possibleArray = []
    for (let i = lowestArray[1]; i <= highestArray[1]; i++) {
        for (let c of possibleNote.split('')) {
            if (i == lowestArray[1] && possibleNote.indexOf(c) < firstIndex)
                continue;
            if (i == highestArray[1] && possibleNote.indexOf(c) > lastIndex)
                continue;
            possibleArray.push(c + "/" + i);
        }
    }
}

let nextButtonPressed = function () {
    drawInElement(createRandomNote());
}

function createRandomNote() {
    let key = possibleArray[Math.floor(Math.random() * possibleArray.length)];
    currentNote = key.charAt(0);
    //document.getElementById("button_next").innerText = key;
    return new VF.StaveNote({ keys: [key], duration: "q" });
}

function drawInElement(note) {
    element.innerHTML = "";
    let renderer = new VF.Renderer(element, VF.Renderer.Backends.SVG);

    // Configure the rendering context.
    renderer.resize(500, 500);
    let context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    // Create a stave of width 400 at position 10, 40 on the canvas.
    let stave = new VF.Stave(10, 40, 100);

    // Add a clef and time signature.
    stave.addClef("treble").addTimeSignature("4/4");

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();

    // Create the notes
    let notes = [note];

    // Create a voice in 4/4 and add above notes
    let voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
    voice.addTickables(notes);

    var beams = VF.Beam.generateBeams(notes);

    // Format and justify the notes to 400 pixels.
    let formatter = new VF.Formatter().joinVoices([voice]).format([voice], 150);

    // Render voice
    voice.draw(context, stave);
}