const request = require('request');
const express = require('express');
const JSONparse = require('body-parser');
const path = require('path');
const port = 3000;
require('dotenv-expand').expand(require('dotenv').config());

const app = express();
app.use(JSONparse.json());
app.use(JSONparse.urlencoded({ extended: true }));


app.get('/', (request, response) => {
    if (request.username) {
        return response.json({
            username: request.username,
            logout: 'http://localhost:3000/logout',
        });
    }
    response.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/api/login', (request, response) => {
    const { login, password } = request.body;
    const getAccessToken = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
            grant_type: 'password',
            audience: process.env.AUDIENCE,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            username: login,
            password: password,
            scope: 'offline_access',
        },
    };

    request(getAccessToken, (error, response, body) => {
        if (error) {
            response.status(401).send();
            return;
        }

        const status = response.statusCode;

        if (status >= 200 && status < 300) {
            const response = JSON.parse(body);

            process.env.USER_ACCESS_TOKEN = response.access_token;
            console.log(response);
            response.json({ token: response.access_token});
            return;
        }

        response.status(status).send();
    });
});

app.get('/logout', (request, response) => {
    response.redirect('/');
});



const getAccessToken = {
    method: 'POST',
    url: `https://${process.env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE,
        grant_type: 'client_credentials',
    },
};

request(getAccessToken, (error, response, body) => {
    if (error) throw new Error(error);

    const resp = JSON.parse(body);
    process.env.ACCESS_TOKEN = resp.access_token;
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
