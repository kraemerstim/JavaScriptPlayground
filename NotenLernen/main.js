"use strict"

let VF = Vex.Flow;

const possibleNote = "cdefgab";
let currentNote = "";
let configuration;
let renderer;
let game;

class Renderer {
    constructor(element) {
        this.element = element;

        this.setup();
    }

    setup() {
        let renderer = new VF.Renderer(this.element, VF.Renderer.Backends.SVG);

        // Configure the rendering context.
        renderer.resize(500, 500);
        this.context = renderer.getContext(); 
        this.context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");  
    }


    render(notes) {
        this.context.clear();

        let notesObject = this.createNoteFromString(notes);

        // Create a stave of width 400 at position 10, 40 on the canvas.
        let stave = new VF.Stave(10, 40, 100);

        // Add a clef and time signature.
        if (configuration.isBassKey)
            stave.addClef("bass");//.addTimeSignature("4/4");
        else
            stave.addClef("treble");//.addTimeSignature("4/4");

        // Connect it to the rendering context and draw!
        stave.setContext(this.context).draw();

        // Create the notes
        let vfNotes = [notesObject];

        // Create a voice in 4/4 and add above notes
        let voice = new VF.Voice().setMode(VF.Voice.Mode.SOFT);
        //voice.setMode(Voice.Mode.SOFT)
        voice.addTickables(vfNotes);

        var beams = VF.Beam.generateBeams(vfNotes);

        // Format and justify the notes to 400 pixels.
        let formatter = new VF.Formatter().joinVoices([voice]).format([voice], 80);

        // Render voice
        voice.draw(this.context, stave);
    }

    createNoteFromString(notes) {
        let noteObject;
        if (configuration.isBassKey)
            noteObject = new VF.StaveNote({ clef: "bass", keys: notes, duration: "q" });
        else
            noteObject = new VF.StaveNote({ clef: "treble", keys: notes, duration: "q" });
        //Note.setStyle({fillStyle: "blue", strokeStyle: "blue"});
        return noteObject;
    }
}

class Configuration {
    constructor() {
        this.setup();
    }

    setup() {
        let lowest = document.getElementById("input_low").value;
        let highest = document.getElementById("input_high").value;

        let lowestArray = [lowest.charAt(0), parseInt(lowest.charAt(1))];
        let highestArray = [highest.charAt(0), parseInt(highest.charAt(1))];

        let firstIndex = possibleNote.indexOf(lowestArray[0]);
        let lastIndex = possibleNote.indexOf(highestArray[0]);

        this.possibleArray = []
        for (let i = lowestArray[1]; i <= highestArray[1]; i++) {
            for (let c of possibleNote.split('')) {
                if (i == lowestArray[1] && possibleNote.indexOf(c) < firstIndex) {
                    continue;
                }
                if (i == highestArray[1] && possibleNote.indexOf(c) > lastIndex) {
                    continue;
                }
                this.possibleArray.push(c + "/" + i);
            }
        }

        this.isBassKey = document.getElementById("input_key_bass").checked;
    }
}

class Game {
    createRandomNotes(count) {
        let key = []
        for (let i = 0; i < count; i++)
        {
             key.push(configuration.possibleArray[Math.floor(Math.random() * configuration.possibleArray.length)]);
        }
        /*
        while (key.charAt(0) == currentNote)
            key = configuration.possibleArray[Math.floor(Math.random() * configuration.possibleArray.length)];
        */
        this.currentNote = 'a'; //key.charAt(0);
        return key;
    }
}

window.addEventListener("load", function () {
    configuration = new Configuration();
    game = new Game();
    renderer = new Renderer(document.getElementById("output_notes"));
    renderer.render(game.createRandomNotes(3))
    document.getElementById("button_reload").addEventListener("click", () => { configuration.setup(); renderer.render(game.createRandomNotes(3)) });
})

window.addEventListener("keydown", (e) => {
    let input = String.fromCharCode(e.keyCode);
    if (possibleNote.indexOf(input.toLowerCase()) == -1)
        return;
    let resultElement = document.getElementById("result");
    if (input.toUpperCase() == game.currentNote.toUpperCase())
        resultElement.innerText = "richtig! das war ein " + game.currentNote;
    else
        resultElement.innerText = "nope, richtig wäre " + game.currentNote;
    renderer.render(game.createRandomNotes(3));
})