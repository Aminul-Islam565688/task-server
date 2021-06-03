const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 7000;

app.use(bodyParser.json());
app.use(express.json())
app.use(cors());


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://test:test@cluster0.aifw0.mongodb.net/task?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const userCollection = client.db("task").collection("users");

    // to check user name is already in database or not
    app.post('/isUserNameOk', (req, res) => {
        const username = req.body.username
        userCollection.find({ username: username })
            .toArray((err, result) => {
                res.send(result.length > 0)
            })
    })
    // to check email address is already in database or not
    app.post('/isEmailOk', (req, res) => {
        const email = req.body.email
        userCollection.find({ email: email })
            .toArray((err, result) => {
                res.send(result.length > 0)
            })
    })
    // to create new user
    app.post('/newUser', async (req, res) => {
        try {
            const userData = req.body;
            const password = userData.password
            const hash = await bcrypt.hashSync(password, 10)
            const userInfo = { ...userData, password: hash }
            await userCollection.insertOne(userInfo)
                .then((result) => {
                    res.send(result.insertedCount > 0)
                })
        } catch (err) {
            console.log(err);
        }

    })
    // to login 
    app.post('/login', async (req, res) => {

        try {
            const loginWith = req.body.username_or_email;
            const password = req.body.password
            const user = await userCollection.findOne({ $or: [{ username: loginWith }, { email: loginWith }] });
            console.log(user);
            if (user) {
                const compare = await bcrypt.compareSync(password, user.password);
                if (compare) {
                    res.send(user);
                } else {
                    res.send("Wrong User name Or password");
                }
            } else {
                res.send("wrong user name or password");
            }
        } catch (err) {
            console.log(err);
        }
    })

    console.log('MongoDB Connnected!');
});



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server is Running`)
})