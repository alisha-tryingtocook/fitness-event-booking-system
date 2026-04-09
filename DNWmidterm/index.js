
const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); 
app.use(express.static(__dirname + '/public')); 

//setting up SQLite database
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
        console.error(err);
        process.exit(1); 
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); 
    }
});

//Handle requests to the home page 
app.get('/', (req, res) => {
   res.render('mainhome')
});


 //Handle requests to the attendee home page 
app.get('/attendeeviews', (req, res) => {
    res.render('attendeeviews')
 });

  //Handle requests to the event home page 
app.get('/events', (req, res) => {
    res.render('events')
 });

   //Handle requests to the sitesetting home page 
app.get('/sitesetting', (req, res) => {
    res.render('sitesetting')
 });

//route to handle update to site setting
app.post('/sitesetting', (req, res) => {
    const { siteName, description } = req.body; 
    const query = "UPDATE settings SET siteName = ?, description = ? WHERE id = 1";

    global.db.run(query, [siteName, description], (err) => {
        if (err) {
            console.error("Error updating site settings:", err);
            res.status(500).send("Error updating site settings");
        } else {
            //reddirect to organizer page
            res.redirect('/organizer');
        }
    });
});


app.get('/organizer', (req, res) => {
    const settingsQuery = "SELECT * FROM settings LIMIT 1";
    const eventsQuery = "SELECT * FROM events ORDER BY lastModified DESC"; // Update query as needed

    global.db.get(settingsQuery, [], (err, settings) => {
        if (err) {
            console.error("Error fetching site settings:", err);
            res.status(500).send("Error fetching site settings");
        } else {
            global.db.all(eventsQuery, [], (err, events) => {
                if (err) {
                    console.error("Error fetching events:", err);
                    res.status(500).send("Error fetching events");
                } else {
                    res.render('organizer', {
                        settings: settings || { siteName: "", description: "" },
                        events: events, // Pass events data to the template
                        drafts: events.filter(event => event.status === 'draft'), // Separate drafts if needed
                        published: events.filter(event => event.status === 'published') // Separate published events
                    });
                }
            });
        }
    });
});



//for user managment 
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

//start server and lsiten on port
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

//create event page
app.get('/organizer/create-event', (req, res) => {
    res.render('organizeredit'); 
});

//route to handle login page
app.get('/login', (req, res) => {
    res.render('login');
});

//handle loogin page form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    //extract emaial and password
    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    global.db.get(query, [email, password], (err, user) => {
        if (err) {
            console.error("Error during login:", err);
            res.status(500).send("Login error");
        } else if (user) {
            res.redirect('/'); 
        } else {
            res.status(401).send("Invalid credentials");
        }
    });
});


//route to handle signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

//handle sigmup submission 
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    
    const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    global.db.run(query, [name, email, password], (err) => {
        if (err) {
            console.error("Error during sign-up:", err);
            res.status(500).send("Sign-up error");
        } else {
            res.redirect('/login'); 
        }
    });
});

app.get('/organizer/delete-draft/:id', (req, res) => {
    const draftId = req.params.id;

    const query = "DELETE FROM events WHERE id = ? AND status = 'draft'";
    
    global.db.run(query, [draftId], function (err) {
        if (err) {
            console.error("Error deleting draft:", err);
            res.status(500).send("Error deleting draft");
        } else {
            console.log("Draft deleted successfully");
            //back to home page
            res.redirect('/organizer'); 
        }
    });
});
