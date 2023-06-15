const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
        wallet_address: { type: String, unique: true, required: true, default: "" },
        hash: { type: String, required: true, default: "" },
        tickets: { type: [String], required: true, default: [] }
});

module.exports = mongoose.model("Account", AccountSchema);