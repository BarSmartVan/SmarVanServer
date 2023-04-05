
const jwt = require('jsonwebtoken');

class TokenParser {
    static getEmail(bearerToken) {
        const tokenArray = bearerToken.split(" ");
        const token = tokenArray[1];
        const email = jwt.decode(token).email
        return email
    }
}

module.exports = TokenParser;