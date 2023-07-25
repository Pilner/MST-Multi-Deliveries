// SETUP
import * as dotenv from "dotenv";
import express from "express";

dotenv.config();

const	app 	= express(),
		port	= 3000 || process.env.PORT;


app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

// ROUTES
app.get("/", (req, res) => {
	try {
		res.render("home");
	} catch(err) {
		res.render("errorpage");
		console.log(err);
	}
})

app.get("/map", (req, res) => {
	try {
		const data = JSON.parse(decodeURIComponent(req.query.data || "{}"));
		res.render("mapPage", {data: data});
	} catch (err) {
		res.render("errorpage");
		console.log(err);
	}
});

app.get("/getData", (req, res) => {
	try {
		let data = req.query;
		console.log(data);
		res.redirect(`/map?data=${encodeURIComponent(JSON.stringify(data))}`);
	} catch (err) {
		res.send("error");
		console.log(err);
	}
});

app.get("*", (req, res) => {
	res.render("errorpage");
})


// LISTEN
app.listen(port, () => {
	console.log(`Server starting on port ${port}`);
})