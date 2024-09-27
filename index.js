const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');

const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {cloudConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 8081;

database.connect();

//middleware
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser())
app.use(fileUpload({useTempFiles: true, tempFileDir: '/tmp'}));

// cloudinary connect
cloudConnect();
app.use((req, res, next) => {
    console.log("req.url :: ", req.url);
    console.log("req.body :: ", req.body);
    console.log("req.cookies :: ", req.cookies);
    next();
});
//
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Your server is up and running ...',
    });
})


app.get("*", (req, res) => {
    return res.status(404).send("Not Found");
})
app.listen(port, () => {
    // console.log("APP is running at ", port);
    console.log(`Server running at http://localhost:${port}`)


})
