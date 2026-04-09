//importing express lib
const express = require("express");
//creating route
const router = express.Router();

/**
 * @desc Display all events
 * @route GET/ events
 */
router.get("/events", (req, res, next) => {
    //SQL to fetch all events
    const query = "SELECT * FROM classes"; 
    global.db.all(query, [], (err, rows) => {
        if (err) {
            //logginf and sending error if process fails
            console.error("Error retrieving events:", err);
            res.status(500).send("Error retrieving events");
        } else {
            //logging retrieved events
            console.log("Events retrieved:", rows);
            res.render("events", { events: rows }); 
        }
    });
});

/**
 * @desc Display all events
 * @route GET/ events
 */
router.post("/sitesetting", (req, res, next) => {
    //site name and description 
    const { siteName, description } = req.body;

    const query = `
        INSERT INTO settings (siteName, description)
        VALUES (?, ?)
        ON CONFLICT (id) DO UPDATE SET siteName = ?, description = ?;
    `; 

    const queryParams = [siteName, description, siteName, description];

    global.db.run(query, queryParams, function (err) {
        if (err) {
            console.error("Error updating site settings:", err);
            res.status(500).send("Error updating site settings");
        } else {
            //redirect to organizer home page
            res.redirect("/organizer");
        }
    });
});

/**
 * @desc Display all events
 * @route GET/ events
 */
//updating book counts 
router.post("/users/book", (req, res) => {
    const { classId, fullPriceQuantity, concessionQuantity } = req.body;


    if (!fullPriceQuantity || !concessionQuantity || isNaN(fullPriceQuantity) || isNaN(concessionQuantity)) {
        return res.status(400).send("Invalid ticket quantities");
    }

    const totalQuantity = parseInt(fullPriceQuantity) + parseInt(concessionQuantity);

    
    const query = `
        UPDATE classes
        SET booked = booked + ?, 
            fullPriceTickets = fullPriceTickets - ?, 
            concessionTickets = concessionTickets - ?
        WHERE id = ? AND booked + ? <= capacity
    `;

    global.db.run(query, [totalQuantity, fullPriceQuantity, concessionQuantity, classId, totalQuantity], function (err) {
        if (err) {
            console.error("Error booking tickets:", err);
            res.status(500).send("Error booking tickets");
        } else if (this.changes === 0) {
            res.send("Not enough tickets available.");
        } else {
            res.redirect("/users/events"); 
        }
    });
});

/**
 * @desc Display all events
 * @route GET/ events
 */

router.get("/editevent", (req, res, next) => {
    const eventId = req.query.id;
    if (eventId) {
        global.db.get("SELECT * FROM events WHERE id = ?", [eventId], (err, event) => {
            if (err) return next(err);
            res.render("editevent", { event });
        });
    } else {
        res.render("editevent", { event: null });
    }
});


// Handle event creation
router.post("/organizer/create-event", (req, res) => {
    const { name, date, time } = req.body; 

    const query = `
        INSERT INTO events (title, description, full_price_tickets, full_price_cost, concession_tickets, concession_cost, status, last_modified)
        VALUES (?, ?, ?, ?, ?, ?, 'draft', datetime('now'))
    `;

    const values = [name, "Default Description", 10, 20.0, 5, 10.0];

    // Execute the query
    global.db.run(query, values, function (err) {
        if (err) {
            console.error("Error saving event:", err);
            res.status(500).send("Error saving event");
        } else {
            console.log("Event saved with ID:", this.lastID);
            res.redirect("/organizer"); 
        }
    });
});


router.post('/editevent', (req, res) => {
    console.log('Received POST data:', req.body); 

    const { title, description, full_price_tickets, full_price_cost, concession_tickets, concession_cost } = req.body;

    //verifying all 
    if (!title || !description || !full_price_tickets || !full_price_cost || !concession_tickets || !concession_cost) {
        console.error('Missing fields in POST data');
        return res.status(400).send('All fields are required');
    }

    const query = `
        INSERT INTO events (title, description, fullPriceTickets, fullPriceCost, concessionTickets, concessionCost, status, lastModified)
        VALUES (?, ?, ?, ?, ?, ?, 'draft', datetime('now'))
    `;  //sql query to add new event 

    const values = [title, description, full_price_tickets, full_price_cost, concession_tickets, concession_cost];

    global.db.run(query, values, function (err) {
        if (err) {
            console.error('Error saving draft event:', err);
            return res.status(500).send('Error saving draft event');
        } else {
            console.log('Draft event saved with ID:', this.lastID);
            res.redirect('/organizer'); 
        }
    });
});

module.exports = router; //exposrting the router for use

