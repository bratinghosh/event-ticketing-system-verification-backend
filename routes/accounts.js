const express = require("express");
const computeHashForDatabaseStorage = require("../utilities/hash");
const Account = require("../models/account");
const router = express.Router();

// master path: /api/v1/accounts

// get the id (to be displayed as QR-Code) using the wallet_address and password_hash
router.get("/id", (req, res) => {
    // return the id of an account
    // body: { wallet_address, password_hash }
    const wallet_address = req.body.wallet_address;
    const password_hash = req.body.password_hash;

    Account.exists({ wallet_address: wallet_address, hash: computeHashForDatabaseStorage(wallet_address, password_hash) })
    .then((output) => {
        if (output) {
            res.status(200).json({ id: output._id });
        } else {
            res.status(404).json({ message: "account not found." });
        }
    }).catch((err) => res.status(500).json({ message: err }));
});

// create a new account for a new wallet_address login to the organizer UI
router.post("/create", (req, res) => {
    // create a new account if does not exist
    // body: { wallet_address, password_hash }
    const wallet_address = req.body.wallet_address;
    const password_hash = req.body.password_hash;

    const doc = new Account({
        wallet_address: wallet_address,
        hash: computeHashForDatabaseStorage(wallet_address, password_hash),
        tickets: []
    });

    Account.exists({ wallet_address: wallet_address })
    .then((output) => {
        if (!output) {
            doc.save()
            .then(() => res.status(200).json(doc))
            .catch((err) => res.status(500).json({ message: "failed to create account." }));
        } else {
            res.status(401).json({ message: "account already exists." });
        }
    }).catch((err) => res.status(500).json({ message: err }));
});

router.get("/tickets/:id", (req, res) => {
    // get all the tickets (list of ticket ids) of an account
    // params : { id }
    const id = req.params.id;

    Account.findById(id)
    .then((output) => {
        if (output) {
            res.status(200).json({ tickets: output.tickets });
        } else {
            res.status(404).json({ message: "account not found." });
        }
    }).catch((err) => res.status(500).json({ message: err }));
});

// Update the database with the latest wallet_address-tickets mapping information
router.post("/tickets/:id", (req, res) => {
    // update all the tickets (list of ticket ids) of an account
    // params : { id }
    // body: { tickets }
    const id = req.params.id;
    const tickets = req.body.tickets; // list of ticket ids

    Account.findByIdAndUpdate(id, { tickets: tickets })
    .then((output) => {
        res.status(200).json({ message: "tickets of wallet_address "+ output.wallet_address +" updated." });
    }).catch((err) => res.status(500).json({ message: err }));
});

// Use a ticket by scanning the id off the QR-Code and calling this endpoint
router.delete("/tickets/:id", (req, res) => {
    // delete 1 ticket (last ticket id of the list) of an account
    // params : { id }
    const id = req.params.id;

    Account.findById(id)
    .then((output) => {
        if (output) {
            var tickets = output.tickets;
            const ticket_id = output.tickets.pop(); // delete ticket id from the list
            Account.findByIdAndUpdate(id, { tickets: tickets })
            .then((output) => {
                // return the used ticket of the corresponding wallet_address
                // subsequently call the contract from the frontend using ticket_id to register the used ticket in the blockchain
                res.status(200).json({
                    wallet_address: output.wallet_address,
                    ticket_id: ticket_id
                });
            }).catch((err) => res.status(500).json({ message: err }));
        } else {
            res.status(404).json({ message: "account not found." });
        }
    }).catch((err) => res.status(500).json({ message: err }));
});

module.exports = router;