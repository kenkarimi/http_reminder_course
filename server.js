const express = require("express");
const bodyParser = require("body-parser");

//Initialize express into a varaible called app.
const app = express();

//add body-parser middleware.
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false })); //needed to send urlencoded 

//Can run this get endpoint on postman or the browser. 
//If reloaded, produces a 304 error(not modified) on the network tab of browser because it was cached and never changed. If res.send is modified and reloaded, status changes to 200.
//If a string is sent with res.send, then the content-type in the header will be text/html. html tags can even be put in the string as done below.
app.get('/', (req, res) => {
    res.send('<h1>Hello from express</h1>');
});

//res.send will lead to text/html as the content-type in the response header. Can use res.send or res.json. Preferable to use res.json for json.
app.get('/json_content_type', (req, res) => {
    //res.send({ msg: 'Hello from express' });
    res.json({ msg: 'Hello from express' });
});

//Getting the raw headers(an array with all the headers)
app.get('/raw_headers', (req, res) => {
    const raw_headers = req.rawHeaders;
    res.send(raw_headers);
});

app.get('/headers', (req, res) => { //Remember this is a get request so you can't try and get the content-type from the header since it doesn't send any data/content to the server.
    const host = req.header('Host');
    const user_agent = req.header('User-Agent');
    const accept = req.header('Accept');
    const accept_encoding = req.header('Accept-Encoding');
    const connection = req.header('Connection');
    res.json({ host, user_agent, accept, accept_encoding, connection });
});

//Sending data to the server in the request body. We use postman post to simulate data being submitted from a form by including key-value pairs in the body section of a postman post request.
//To do this you have to click on the 'x-www-form-urlencoded' radio button option in the body tab of a postman request. 
//This means that express.urlencoded() middleware is needed for this to work.
//Also notable that as soon as we click on the 'x-www-form-urlencoded' radio on the body tab, even before any key-value pairs are entered, the content-type changes to application/x-www-form-urlencoded because postman expects that form data is about to be sent to the server. 
app.post('/contact', (req, res) => {
    if(!req.body.name || !req.body.email || !req.body.phone){
        return res.status(400).send('At least one of name, email or phone is missing');
    }
    
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    //res.json({ name, email, phone }); //application/json object sent back to client.
    //res.send(req.body); //also sends an application/json object with name, email and phone key-value pairs back to client even though it's not res.json. res.send needs quotation marks to send a string, which we can't do here with an object.
    
    const content_type = req.header('Content-Type'); //content type of data sent from client to server.
    res.json({ content_type, name, email, phone });
});

//Same as previous but here, instead of the client sending 'x-www-form-urlencoded'(form data) to the client, they send a json object.
//To do this, choose the 'raw' radio button on the body tab of a postman request instead of 'x-www-form-urlencoded', then choose JSON from the blue dropdown that appears left of the readio buttons.
//This uses bodyParser.json() middleware. Without it its impossible to send json data from the client to the server.
app.post('/contact_json', (req, res) => {
    if(!req.body.name || !req.body.email || !req.body.phone){
        return res.status(400).json({ msg: 'One of name, email or phone is missing.' });
        //return res.status(403).send('One of name, email or phone is missing.');
    }

    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    //res.json({ name, email, phone }); //application/json object sent back to client.
    //res.send(req.body); //also sends an application/json object with name, email and phone key-value pairs back to client even though it's not res.json. res.send needs quotation marks to send a string, which we can't do here with an object.
    
    const content_type = req.header('Content-Type'); //content type of data sent from client to server.
    res.json({ content_type, name, email, phone });
});

//Status codes:
//200: Ok. Indicates that the request has succeeded. A 200 response is cacheable by default.
//201: Created. The request has been completed and resulted in a new resource being created. Commonly used as the result of a POST request.
//304: Not Modified. Indicates that there is no need to retransmit the requested resources. It is an implicit redirection to a cached resource.
//307: Temporary Redirect. Indicates requested resources temporarily moved to the URL given.
//308: Permanent Redirect.
//400: Bad Request. The request cannot be completed due to bad syntax. e.g. a missing parameter in the requests body, invalid request message framing or deceptive request routing.
//401: Unauthorized.  The request cannot be completed because it lacks valid authentication credentials for the requested resource.
//403: Forbidden. Indicates that the request was a legal request that the server understands, but refuses to authorize. Unlike 401, reauthentication makes no difference as access is tied to application logic, such as insufficient rights to a resource(access control)
//404: Not found. The requested resource could not be found but may be available again in the future. Subsequent requests by the client are permissible.
//500: Internal Server Error. Indicates that the server encountered an unexpected condition that prevented it from fulfilling the request. This is a “catch-all” response that usually indicates that the server couldn’t get a better 5xx error code to respond with.
//504: 504: Gateway Timeout. Indicates that the server, while acting as a proxy or gateway, couldn’t get a timely response from the upstream server that it needed to complete the request.
app.post('/status_codes', (req, res) => {
    if(!req.body.name){
        //return res.status(400).send('Name is required.');
        return res.status(400).json({ msg: 'Name is required.'});
    }

    //DATABASE STUFF HERE
    res.status(201).send(`Thank you ${req.body.name}. Your account has been created.`);
});

//To test this, add a key-value pair to the postman request header. Try it without the key first, then with the key, but with an unauthorized value, then with 12345
app.post('/login', (req, res) => {
    if(!req.header('x-auth-token')){
        return res.status(400).send('No token.'); //400 due to bad syntax. x-auth-token parameter missing from header.
    }

    if(req.header('x-auth-token') !== '12345'){
        return res.status(401).send('Log in failed. Not authorized.'); //401 due to authentication failure.
    }

    res.send('Logged in.'); //status 200 sent by default with the response.
});

//Use put instead of post if a dynamic parameter is to be used in the pathname. Put still allows you to include parameters in the request's body alongside the dynamic parameter.
app.put('/post/create/:id', (req, res) => {
    if(!req.body.title){
        return res.status(400).send('Title is required.'); //Bad request. Title missing.
    }
    //DATABASE STUFF

    res.json({
        id: req.params.id, //request.params accesses the url value unlike request.body which accesses the form data(x-www-form-urlencoded) or json data(raw) sent in the body.
        title: req.body.title
    });
});

app.delete('/post/delete/:id', (req, res) => {
    //DATABASE STUFF

    res.json({ msg: `Post ${req.params.id} deleted.` });
});

//If the intention is to deploy this to heroku, then it requires the process.ENV.port, if not when running locally it'll use 5000;
const port = process.env.PORT || 3000; //There's currently an error if port 5000 is used. Maybe it's in use. For now use 3000.

app.listen(port, () => console.log(`Server started on port ${port}`));