const parseQuickInput = (input) => {
    const trimmed = input.trim();

    // Pattern A: [Number][k] [Note]  → "50k cafe"
    const patternA = /^(\d+(?:\.\d+)?)([kK]?)\s+(.+)$/;
    const matchA = trimmed.match(patternA);

    if (matchA) {
        let amount = parseFloat(matchA[1]);
        if (matchA[2].toLowerCase() === 'k') amount *= 1000;
        return { amount: Math.round(amount), note: matchA[3].trim() };
    }

    // Pattern B: [Note] [Number][k]  → "cafe 50k"
    const patternB = /^(.+)\s+(\d+(?:\.\d+)?)([kK]?)$/;
    const matchB = trimmed.match(patternB);

    if (matchB) {
        let amount = parseFloat(matchB[2]);
        if (matchB[3].toLowerCase() === 'k') amount *= 1000;
        return { amount: Math.round(amount), note: matchB[1].trim() };
    }

    return null;
};

module.exports = { parseQuickInput };