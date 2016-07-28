// declare dependencies here
var AWS = require('aws-sdk');
var util = require('util');
var pdfkit = require('pdfkit');
var fs = require('fs');
var async = require('async');
var blobStream  = require('blob-stream');

// declare constants here

// get reference to S3 client 
var s3 = new AWS.S3();

exports.handler = function (event, context) {
    // Read options from the event.
    var dstBucket = "PDF_Bucket_Name";
    var dstKey = "PDF_" + event.file_name + ".pdf";
    var heading = event.heading;
	// Create a document
    doc = new pdfkit();

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    var file_path = "/tmp/" + dstKey;

	doc.pipe(fs.createWriteStream(file_path));
    // Embed a font, set the font size, and render some text
    doc.fontSize(25).text(heading, 100, 100);

    // Add another page
    doc.addPage().fontSize(25).text('Here is some vector graphics...', 100, 100);

    // Draw a triangle
    doc.save().moveTo(100, 150).lineTo(100, 250).lineTo(200, 250).fill("#FF3300");

    // // Apply some transforms and render an SVG path with the 'even-odd' fill rule
    doc.scale(0.6).translate(470, -380).path('M 250,75 L 323,301 131,161 369,161 177,301 z').fill('red', 'even-odd').restore();

    // Add some text with annotations
    doc.addPage().fillColor("blue").text('Here is a link!', 100, 100).link(100, 100, 160, 27, 'http://google.com/');

    // Finalize PDF file
    doc.end();
	
	// stream = doc.pipe(blobStream());
	// stream.on('finish', function() {
	// // get a blob 
	// var blob = this.toBlob();
	// console.log(blog);
	// console.log(blog.toString());
	// });
	
    //Get the stream and save it in a string
	var stats = fs.statSync(file_path);
	
	console.log(stats);
	
    fs.readFile(file_path, 'utf8' ,function (err, data) {
        if (err) {
            return console.log(err);
        }
		console.log(data);
		console.log(data.toString());
        var params = {
            Bucket: dstBucket,
            Key: dstKey,
            Body: data,
            ContentType: "application/pdf"
        };
        AWS.config.region = 'us-west-1';
        var s3bucket = new AWS.S3({ params: { Bucket: dstBucket } });
        s3bucket.upload(params, function (err, data) {
            if (err) {
                console.log("Error uploading data: ", err);
            } else {
                console.log("Successfully uploaded data");
            }
        });
    });
    context.succeed(a);

};