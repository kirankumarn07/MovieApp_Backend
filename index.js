//const express = require("express"); // third party package import
import express, { request, response } from 'express'; // latest export method
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';
import movieRouter from "./routes/movies.route.js" //importing routes
import userRouter from "./routes/user.route.js"
import cors from "cors";
import { auth } from "./middleware/auth.js"
import nodemailer from "nodemailer";
dotenv.config()

const app = express(); // calling the express package

const PORT = process.env.PORT; //auto assign port

//mongodb connection
//const MONGO_URL = "mongodb://127.0.0.1"; //default ip of mongo
// connection guide - https://ragavkumarv.com/blog/mongo-atlas-setup/
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL); // creating new client 
await client.connect(); //top level await can be used without async function
console.log('mongo is connected');

//declare conversion - converts json data to js object - app. will apply of all api requests
app.use(express.json());
app.use(cors());

app.get("/", function (request, response) { //get method
    response.send("This is the home page 😍😍😍😍");
});

app.use("/movies", movieRouter);
app.use("/user", userRouter);

// get mobiles

app.get("/mobiles", auth, async (request, response) => {
    const mobiles = await client.db("mongoTest")
        .collection('mobiles')
        .find({})
        .toArray();

    response.send(mobiles);
});

// post mobiles

app.post("/mobiles", async (request, response) => {
    const data = request.body;
    const result = await client.db('mongoTest')
        .collection('mobiles').
        insertMany(data);

    response.send(result);
})

//delete mobiles

const ROLE_ID = {
    ADMIN: "0",
    NORMAL_USER: "1"
}

app.delete("/mobiles/:id", auth, async function (request, response) { //delete method
    const { id } = request.params;
    const { roleid } = request;

    if (roleid === ROLE_ID.ADMIN) {
        const result = await client.db("mongoTest")
            .collection("mobiles")
            .deleteOne({ _id: ObjectId(id) });

        console.log(result);
        result.deletedCount > 0 ? response.send({ message: "mobile deleted" }) :
            response.send({ message: "mobile not found" });
    } else {
        response.status(401).send({ message: "Unauthorized" });
    }


});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));


export { client }; 
async function main() {
    let testAccount = await nodemailer.createTestAccount();
    // create  transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gamil.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user:process.env.NODE_MAILER_USER, 
            pass:process.env.NODE_MAILER_PASSWORD, // generated  password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Naga kiran kumar" <kirankumar.naga7@gmail.com>', // sender address
        to: "kirankumar77717@gmail.com", // list of receivers
        subject: "Hello ✔", 
        text: "Hello kirankumar",
        html: "<h4>Hello kirankumar</h4>", 
    });

    console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);
