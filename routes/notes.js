const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Notes');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/fetchallnotes', fetchuser, async(req, res) => {
    const notes = await Note.find({ user: req.user.id })

    res.json(notes);
})

router.post('/addnote', fetchuser, [
        body('title', 'Enter a valid title').isLength({ nim: 3 }),
        body('description', 'Description must be atleast 5 character ').isLength({ min: 5 }),
    ],
    async(req, res) => {
        const { title, description, tag } = req.body;
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array() });

            }
            const note = new Note({
                title,
                description,
                tag,
                user: req.user.id
            })
            const saveNotes = await note.save()
            res.json(saveNotes)
        } catch (err) {
            console.log(err.message);
            // res.status(500).send(err.message); // Handling the error and sending an error response
        }


    })

//  Route3 : Update an existing Note using : Post "/api/notes/updatenote" . Login required
// router.put('/updatenote/:id', fetchuser, async(req, res) => {

//     const { title, description, tag } = req.body
//         // create a newNote object
//     const newNote = {};
//     if (title) { newNote.title = title };
//     if (description) { newNote.description = description };
//     if (tag) { newNote.tag = tag };

//     // Find the note to be updated and update it 
//     let note = await Note.findById(req.params.id);
//     if (!note) {
//         res.status(404).send("Not Found")
//     }
//     if (note.user.toString() !== req.user.id) {
//         return res.status(401).send("Not Allowed")
//     }
//     note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
//     res.json({ note });

// })



router.put('/updatenote/:id', fetchuser, async(req, res) => {
    const { title, description, tag } = req.body;

    // Create a newNote object
    const newNote = {};
    if (title) { newNote.title = title; }
    if (description) { newNote.description = description; }
    if (tag) { newNote.tag = tag; }

    try {
        // Find the note to be updated
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }

        // Check user ownership
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Update the note and return the updated note
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note }); // Sending the updated note in the response
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

router.delete('/deletenote/:id', fetchuser, async(req, res) => {
    const { title, description, tag } = req.body;
    try {
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("NOt Found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ " Success": "Note has been deleted ", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }

})




module.exports = router;