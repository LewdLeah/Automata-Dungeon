// ===== Library =====
// Made by LewdLeah on 6/3/2025
function AutomataDungeon(HOOK) {
    "use strict";
    if (HOOK === "input") {
        return "\u200B";
    }
    const O = {
        f: obj => Object.freeze(obj),
        s: obj => Object.seal(obj)
    };
    // Initialize config settings
    if (!state.CellularAutomata) {
        state.CellularAutomata = {
            rule: 30,
            width: 16,
            generations: 18
        };
    }
    const CA = O.s(state.CellularAutomata);
    const configTemplate = O.f({
        name: "Configure Automata",
        type: "class",
        entry: getConfigEntry(),
        description: prose(
            "Elementary cellular automata are simple, one-dimensional systems where each cell can be in one of two states (on or off). The next state of each cell is determined by its current state and the state of its two immediate neighbors, based on a fixed rule. There are 256 possible rules (0 to 255), each defining how the 3-cell neighborhood maps to a new state. Despite their simplicity, these systems can produce surprisingly complex and varied patterns over time. Some rules are particularly interesting, including Rule 30 which is chaotic, Rule 54 which is believed to be universal, and Rule 90 which generates the Sierpiński triangle from a single starting cell.",
            "",
            "Yes, this is indeed a joke scenario 😜",
            "Here's my source code lol:",
            "",
            "https://github.com/LewdLeah/Automata-Dungeon"
        )
    });
    let configCard = null;
    // Remove all story cards except the config card (if present)
    for (let i = storyCards.length - 1; 0 <= i; i--) {
        if (
            (configCard === null)
            && (storyCards[i].title === configTemplate.name)
        ) {
            configCard = O.s(storyCards[i]);
        } else {
            removeStoryCard(i);
        }
    }
    if (configCard === null) {
        // If the config card wasn't found, construct a new one
        addStoryCard("%@%");
        configCard = O.s(storyCards[0]);
        configCard.type = configTemplate.type;
        configCard.title = configCard.keys = configTemplate.name;
        configCard.entry = configTemplate.entry;
    } else if (configCard.entry !== configTemplate.entry) {
        // Parse settings
        const simpleEntry = (configCard.entry
            .toLowerCase()
            .replace(/[^a-z:0-9]/g, "")
        );
        const ruleMatch = simpleEntry.match(/rulenumber:(\d+)/);
        if (ruleMatch) {
            CA.rule = parseSettingMatch(0, ruleMatch, 255);
        }
        const widthMatch = simpleEntry.match(/gridwidth:(\d+)/);
        if (widthMatch) {
            CA.width = parseSettingMatch(5, widthMatch, 1000);
        }
        const generationsMatch = simpleEntry.match(/generations:(\d+)/);
        if (generationsMatch) {
            CA.generations = parseSettingMatch(1, generationsMatch, 1000);
        }
        O.f(CA);
        configCard.entry = getConfigEntry();
        // Clamps integers between bounds
        function parseSettingMatch(lower, settingMatch, upper) {
            return Math.min(Math.max(
                lower,
                parseInt(settingMatch[1], 10)),
                upper
            );
        }
    }
    configCard.description = configTemplate.description;
    // Get starting row (line with ⬜ and ⬛, fallback to default pattern)
    const [gridString, startIndex] = (() => {
        for (let i = history.length - 1; 0 <= i; i--) {
            const gridString = (history[i].text
                .trimEnd()
                .split("\n")
                .pop()
                .replace(/[^⬜⬛]/g, "")
            );
            if (4 < gridString.length) {
                if (
                    gridString.includes("⬜")
                    && gridString.includes("⬛")
                ) {
                    return [gridString, 1];
                } else {
                    break;
                }
            }
        }
        return ["⬛⬛⬛⬛⬛⬛⬛⬛⬜⬛⬛⬛⬛⬛⬛⬛", 0];
    })()
    // Initialize the grid history (array of boolean arrays)
    const grids = [[
        ...[...gridString].map(char => (char === "⬜")),
        ...Array(CA.width).fill(false)
    ].slice(0, CA.width)];
    const size = grids[0].length;
    // Simulate the 1D elementary cellular automata for n many generations
    for (let i = 0; i < CA.generations; i++) {
        const grid = O.f(grids[grids.length - 1]);
        grids.push(grid.map((_, i) => (((CA.rule >> (
            // Left neighbor
            ((grid[(i - 1 + size) % size] ? 1 : 0) << 2)
            // Current cell
            | ((grid[i] ? 1 : 0) << 1)
            // Right neighbor
            | (grid[(i + 1) % size] ? 1 : 0)
        )) & 1) === 1)));
    }
    function getConfigEntry() {
        return prose(
            "> You may adjust the three settings below",
            "> Rule number: " + CA.rule,
            "> Grid width: " + CA.width,
            "> Generations: " + CA.generations
        );
    }
    function prose(...args) {
        return args.join("\n");
    }
    // Display the CA's time evolution as a string
    return [...grids.slice(startIndex).map(grid => (
        grid.map(cell => (cell ? "⬜" : "⬛")).join("")
    )), ""].join("\n");
}
