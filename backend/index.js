const express = require("express")
const cors = require("cors")
let PORT = process.env.PORT || 4000
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());


app.get("/", (req, res) => {
    res.json({ message: "Api is running.", sucess: true })
})

app.use("/", require("./route/shorten"));
app.use("/",require("./route/stats"));

app.listen(PORT,() => {
    console.log("Server running on " + PORT)
})