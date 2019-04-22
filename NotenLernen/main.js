"use strict"

let VF = Vex.Flow;

let element = document.getElementById("output_notes");
let possibleNote = "cdefgab";
let possibleArray = [];
let isBassKey = false;
let currentNote = "";

window.addEventListener("load", function () {
    document.getElementById("button_reload").addEventListener("click", initiateArray);
    initiateArray();
    drawInElement(createRandomNote());
})

window.addEventListener("keydown", function(e) {
    let input = String.fromCharCode(e.keyCode);
    if (possibleNote.indexOf(input.toLowerCase()) == -1)
        return;
    let resultElement = document.getElementById("result");
    if (input.toUpperCase() == currentNote.toUpperCase())
        resultElement.innerText = "richtig! das war ein " + currentNote;
    else
        resultElement.innerText = "nope, richtig wäre " + currentNote;
    drawInElement(createRandomNote());
})

let initiateArray = function () {
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

    isBassKey = document.getElementById("input_key_bass").checked;
}

function createRandomNote() {
    let key = possibleArray[Math.floor(Math.random() * possibleArray.length)];
    while (key.charAt(0) == currentNote)
        key = possibleArray[Math.floor(Math.random() * possibleArray.length)];
    currentNote = key.charAt(0);
    let Note;
    if (isBassKey)
        Note = new VF.StaveNote({clef: "bass", keys: [key], duration: "q" });
    else
        Note = new VF.StaveNote({clef: "treble", keys: [key], duration: "q" });
    //Note.setStyle({fillStyle: "blue", strokeStyle: "blue"});
    return Note;
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
    if (isBassKey)
        stave.addClef("bass").addTimeSignature("4/4");
    else
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