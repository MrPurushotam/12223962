const express = require("express")

let PORT = 4000 || process.env.PORT
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Api is running.", sucess: true })
})

app.use("/", require("./route/shorten"));
app.use("/",require("./route/stats"));

app.listen(PORT,() => {
    console.log("Server running on " + PORT)
})