const express = require("express");
const computeHashForDatabaseStorage = require("../utilities/hash");
const Account = require("../models/account");
const router = express.Router();

// master path: /api/v1/accounts

// get the id (to be displayed as QR-Code) using the wallet_address and password_hash
router.post("/id", (req, res) => {
    // return the id of an account
    // body: { wallet_address, password_hash }
    const wallet_address = req.body.wallet_address;
    const password_hash = req.body.password_hash;

    Account.exists({ wallet_address: wallet_address, hash: computeHashForDatabaseStorage(wallet_address, password_hash) })
    .then((output) => {
        if (!output) {
            res.status(404).json({ message: "account not found." });
        } else {
            res.status(200).json({ id: output._id });
        }
    }).catch((err) => res.status(500).json({ message: err }));
});

// create a new account if not present for a wallet_address login to the organizer UI
router.post("/login", (req, res) => {
    // create a new account if does not exist else verify wallet_address and password
    // body: { wallet_address, password_hash }
    const wallet_address = req.body.wallet_address;
    const password_hash = req.body.password_hash;

    const doc = new Account({
        wallet_address: wallet_address,
        hash: computeHashForDatabaseStorage(wallet_address, password_hash),
        tickets: []
    });

    Account.exists({ wallet_address: wallet_address, hash: computeHashForDatabaseStorage(wallet_address, password_hash)})
    .then((output) => {
        if (!output) {
            Account.exists({ wallet_address: wallet_address })
            .then((output) => {
                if (!output) {
                    doc.save()
                    .then(() => res.status(200).json(doc))
                    .catch((err) => res.status(500).json({ message: "failed to create account." }));
                } else {
                    res.status(401).json({ message: "wrong password." });
                }
            }).catch((err) => res.status(500).json({ message: err }));
        } else {
            res.status(200).json(doc);
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

// Update the database with the all latest wallet_address-tickets mapping information
router.post("/tickets/updatemapping", (req, res) => {
    // update the tickets owned by all the accounts
    // body: { wallet_address: tickets, wallet_address: tickets, ... }
    const map = req.body;

    Object.keys(map).forEach(wallet_address => {  
        Account.findOneAndUpdate({ wallet_address: wallet_address.toLowerCase() }, { tickets: map[wallet_address] })
            .catch((err) => res.status(500).json({ message: err }));
    })

    return res.status(200).json({ message: "wallet_address-tickets mapping information updated." });
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
            if (tickets.length > 0) {
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
                res.status(403).json({ message: "account has no remaining tickets." });
            }
        } else {
            res.status(404).json({ message: "account not found." });
        }
    }).catch((err) => res.status(500).json({ message: err }));
});

module.exports = router;