const Bluebird = require("bluebird");
const req = Bluebird.promisify(require("request"));

module.exports = {
    check(addr) {
        return RegExp('^(0x)?[0-9a-fA-F]{40}$').test(addr);
    },
    
    symbol(addr) {
        return "ETH";
    },

    fetch(addr) {
        const url = `https://etherscan.io/address/${addr}`;

        return req(url)
        .timeout(5000)
        .cancellable()
        .spread(function(resp, body) {
            if (resp.statusCode < 200 || resp.statusCode >= 300) throw new Error(JSON.stringify(resp));

            let tokens = [];
            
            const regex = /<br>([\d.,]+) (\w+)</g;
            let matches;
            while ((matches = regex.exec(body)) !== null) {
                tokens.push({
                    asset: matches[2],
                    quantity: parseFloat(matches[1].replace(",", ""))
                });
            }
            
            return tokens;
        });
    }
};