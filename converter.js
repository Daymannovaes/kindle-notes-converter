const fs = require('fs');
const { promisify } = require('util');
const cheerio = require('cheerio');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);


const DEFAULT_INPUT = "input.html";
const DEFAULT_OUTPUT = "output.json";
const DEFAULT_NOTE_HTML_CLASS = ".noteHeading";
const DEFAULT_NOTE_COLOR = "yellow";

const inputArg = process.argv[2] || DEFAULT_INPUT;
const outputArg = process.argv[3] || DEFAULT_OUTPUT;
const NOTE_HTML_CLASS = process.argv[4] || DEFAULT_NOTE_HTML_CLASS;

const noteRegex = /(.*).*-.*Location (.*)/;

const LOCATION_LENGTH = 150;

let notes = [];

let $ = 1;
const run = async () => {
    const input = await readFileAsync(inputArg);
    console.log(input.toString());
    $ = cheerio.load(input.toString());

    notes = $(NOTE_HTML_CLASS).map((i, el) => ({
        note: $(el).text(),
        content: $(el).next().text()
    })).get();

    notes = notes.map(note => ({
        type: getNoteType(note.note),
        startPosition: getNotePosition(note.note),
        note: note.note,
        content: note.content
    }));

    notes = notes.map(note => {
        if(note.note.match(/Highlight/)) return extractHighlight(note);
        if(note.note.match(/Note/)) return extractNote(note);
    });


};
async function run2() {
    let notesBuffer = new Uint8Array(Buffer.from(JSON.stringify(notes)));
    await writeFileAsync(outputArg, notesBuffer);
}
run2();

function extractHighlight(note) {
    const startPosition = getNotePosition(note.note);
    return {
        startPosition: startPosition,
        endPosition: startPosition + note.content.length,
        type: "kindle.highlight",
        metadata: {
            mchl_color: getNoteColor(note.note)
        }
    };
}

function extractNote(note) {
    const startPosition = getNotePosition(note.note);
    return {
        startPosition: startPosition,
        endPosition: startPosition,
        text: note.content,
        type: "kindle.note"
    }
}

function getNoteType(text) {
    console.log(text);
    if(text.match(/Highlight/)) return "kindle.highlight";
    if(text.match(/Note/)) return "kindle.note";
    return "kindle.undefined_note_type";
}

function getNotePosition(text) {
    return parseInt(text.match(noteRegex)[2]) * (LOCATION_LENGTH + 1);
}

function getNoteColor(text) {
    const match = text.match(/.*\((.*)\).*/);
    if(match && match[1]) return match[1];
    return DEFAULT_NOTE_COLOR;
}

run();
