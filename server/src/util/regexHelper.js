const parseQuickInput = (input) => {
    // Regex bắt số, hậu tố k, và nội dung sau đó
    const regex = /^(\d+)([kK]?)\s+(.+)$/;
    const match = input.match(regex);

    if (!match) return null;

    let amount = parseInt(match[1]);
    if (match[2].toLowerCase() === 'k') amount *= 1000;

    return {
        amount,
        note: match[3].trim()
    };
};

module.exports = { parseQuickInput };