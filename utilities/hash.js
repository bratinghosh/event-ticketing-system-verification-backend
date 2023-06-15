const { createHash } = require("crypto");

const computeSHA256 = data => createHash("sha256").update(data).digest("hex")

// Hash = SHA256(concat(SHA256(wallet_address), password_hash))
const computeHashForDatabaseStorage = (wallet_address, password_hash) => computeSHA256(computeSHA256(wallet_address)+password_hash)

module.exports = computeSHA256;
module.exports = computeHashForDatabaseStorage;