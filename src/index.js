const port = process.env.PORT || 3000;
const html = 8080;
const controllerDirectory = "./controllers/";

// Require dependancies
const express = require("express"),
	swagger = require("swagger-jsdoc"),
	bp = require("body-parser"),
	cors = require("cors"),
	fs = require("fs"),
	path = require('path'),
	dist = require("../package.json"),
	serveStatic = require("serve-static");

let controllers = [];

const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));

app.use(cors());
app.options("*", cors());

fs.readdirSync(path.join(__dirname, "./controllers")).forEach(file => {
	controllers.push(file.split(".")[0]);
});

controllers.forEach(controller => {
	const c = require(controllerDirectory + controller);
	app.use("/" + controller, c);
});

app.get("/swagger", (req, res) => {
	return res.json(swagger({
		swaggerDefinition: {
			info: {
				title: "Hackaton IoT Dataweek",
				version: dist.version,
				description: dist.description || "Nondescript",
			},
			host: "localhost:3000",
			basePath: "/",
		},
		apis: [ "controllers/*.js" ],
	}));
})

app.get("/", express.static(path.join(__dirname, 'static')));

app.use((req, res, next) => {
	res.status(404);
	res.json({
		ok: false,
		message: "The endpoint you requested was not found"
	});
	next();
});

app.use(serveStatic('public/html', {'index': ['default.html', 'default.htm']}))
app.listen(port, () => console.log("Starting the API on port " + port));

module.exports = app;
