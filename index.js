const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express()
const port = 7000

app.use(bodyParser.json());
app.use(cors());


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://test:test@cluster0.aifw0.mongodb.net/task?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const userCollection = client.db("task").collection("users");

    app.post('/newUser', (req, res) => {
        const userData = req.body;
        userCollection.insertOne(userData)
            .then((result) => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/isUser', (req, res) => {
        const loginType = req.body.username_or_email;
        const password = req.body.password
        userCollection.find({ username: loginType, password: password })
            .toArray((err, user) => {
                console.log(res.send(user.length > 0));
            })
        console.log(loginType, password);
    })

    console.log('MongoDB Connnected!');
});



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server is Running`)
})