require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const CUSTOM_OBJECT_ID = process.env.CUSTOM_OBJECT_ID;

const hubspotHeaders = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
};

// Render homepage with custom object records
app.get('/', async (req, res) => {
    const endpoint = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_ID}?properties=name,species,breed`;

    try {
        const response = await axios.get(endpoint, { headers: hubspotHeaders });
        const records = response.data.results;
        res.render('homepage', {
            title: 'Home | Integrating With HubSpot I Practicum',
            data: records
        });
    } catch (error) {
        console.error('Error fetching custom objects:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to load records from HubSpot.');
    }
});

// Render form page to create a new record
app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
    });
});

// Handle form submission and create new record in HubSpot
app.post('/update-cobj', async (req, res) => {
    const endpoint = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_ID}`;
    const payload = {
        properties: {
            name: req.body.name,
            species: req.body.species,
            breed: req.body.breed
        }
    };

    try {
        await axios.post(endpoint, payload, { headers: hubspotHeaders });
        res.redirect('/');
    } catch (error) {
        console.error('Error creating custom object:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to create new record.');
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));