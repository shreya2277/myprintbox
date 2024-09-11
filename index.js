var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
const multer = require("multer")
var path = require("path")
const app = express()
//app setup instance of express app



//middleware setup
app.use(bodyParser.json())
app.use(express.static('public'))    //server static files public directory
app.use(bodyParser.urlencoded({      //paser url encoded request body
    extended:true
}))
app.use(express.urlencoded({extended:false}));//newww

mongoose.connect('mongodb://localhost:27017/taxDB',{          //database connection
    useNewUrlParser: true,                                //uses latest url passer available avoiding warning from old parser
    useUnifiedTopology: true                        //uses more mordern server discovery and monitoring engine provide better performance
});


var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))
//multer for file upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/') // Upload files to the 'uploads' directory
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Append timestamp to file name
    }
});

var upload = multer({
    storage: storage
});

// Define a mongoose schema for file metadata   schema definition
var fileSchema = new mongoose.Schema({                //represent metadata
    filename: String,
    path: String,
    contentType: String,
    size: Number,
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

var File = mongoose.model('File', fileSchema);

// Handle file upload
app.post("/upload", upload.single('file'), function(req, res) {    //upload handaling handles file upward functionaklity
                                                       
        // Create a new File document
        var newFile = new File({
            filename: req.file.originalname,
            path: req.file.path,
            contentType: req.file.mimetype,
            size: req.file.size
        

        // Save the File document to MongoDB
        
                
    });
    newFile.save();
    res.redirect('dropdownfileupload.html');//redirection
   

});
//signup
app.post("/sign_up",(req,res)=>{             // extracts user data , constructs object data,and insert into mongodb
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    var address = req.body.address;
    var phonenumber = req.body.phonenumber;


    var data = {                           //constructs object data
        "firstName": firstName,
        "lastName" : lastName,
        "email" : email,
        "password" : password,
        "address" : address,
        "phonenumber": phonenumber
    }

    db.collection('users').insertOne(data,(err,collection)=>{  //constructs object data,and insert into mongodb
        if(err){
            throw err;
        }
        console.log("Record Inserted Successfully");
    });

    return res.redirect('dropdownfileupload.html')

})

app.post("/login", async (req, res) => {                //login tries to find a user collection based data on provided details 
    try {                                                                                   //compares the retrived user password with password provided
        const check = await db.collection('users').findOne({ firstName: req.body.username}); //redirects ,otherwise sends a error message
        if (check.password === req.body.password) {
            res.redirect('dropdownfileupload.html')
        }
        else {
            res.send("wrong Password");
        }
    }
    catch {
        res.send("wrong Details");
    }
});
app.post("/form-submit", function(req, res) {           //submissionb hanadling used to handale form submission  
    // Handle form submission data here if needed
    // Redirect back to the same page
    res.redirect('main4.html');         //route handaling that redirects user to dropdown 
});


app.get("/",(req,res)=>{                //setting response header "allows cross origin request from any origin" request from diff domains
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('main4.html');        //server listening ..listening on port 3000 ie makes application accessible viahttprequest 
}).listen(3000);                                      //on port 300

console.log("Listening on PORT 3000");
