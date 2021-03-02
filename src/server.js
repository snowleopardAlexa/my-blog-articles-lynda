import express from 'express';
// NPM module - it allows our server to extract JSON data that we send along with our request.
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

// fake database - json object that we modify when the specific routes are hit.
// The keys of this JSON object will be the unique name fields of our articles
// from front end, and the values will be JSON objects. 
// const articlesInfo = {
//    'learn-react': {
//       upvotes: 0,
       // empty array [],
//       comments: [],
//    },
//    'take-care-of-mainecoon-cat': {
//        upvotes: 0,
//        comments: [],
//    },
//    'how-to-tame-dragon': {
//        upvotes: 0,
//        comments: [],
//    }
//}

const app = express();
// where we store out static files
app.use(express.static(path.join(__dirname, '/build')));
// it parses the JSON object that we've included along 
// with our post request, and it adds a body property to the request
// parameter of whatever the matching route is. 
app.use(bodyParser.json());


// DRY CODE starts here - do not repeat yourself
// This FUNCTION will take care of all setup and tear down it
// whatever operations we want to perform on the database such as:
// find the article, update the article --> we will simply pass
// our own functions with DB functions that perform all these operations 
// once our database is setup.
// withDB function will take a function that we define as argument - operations
// this function will take care of connecting to the database that's why we need to
// use the keyword AWAIT, so our withDB function needs to be ASYNC
const withDB = async (operations, res) => {
    try {
        // const articleName = req.params.name; --> DELETED
        const client = await MongoClient.connect('mongodb://localhost: 27017', {useNewUrlParser: true});
        const db = client.db('my-blog');

        await operations(db);
    
        // const articleInfo = await db.collection('articles').findOne({name: articleName})
        // res.status(200).json(articleInfo); --> DELETED 
    
        client.close();
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to db', error });
    }
}

// NAME
app.get('/api/articles/:name', async (req, res) => {
    // we need to wrap our code in a TRY CATCH block in case something goes wrong
    // with the database operations. Inside the catch block, we send a response
    // which contains the error that occured. 
    // try {
    //    const articleName = req.params.name;

    //    const client = await MongoClient.connect('mongodb://localhost: 27017', {useNewUrlParser: true});
    //    const db = client.db('my-blog');
    
    //    const articleInfo = await db.collection('articles').findOne({name: articleName})
    //    res.status(200).json(articleInfo);
    
    //    client.close();
    // } catch (error) {
    //    res.status(500).json({ message: 'Error connecting to db', error });
    // }

    // SIMPLYFING THE CODE with withDB function
    withDB(async (db) => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({name: articleName})
        res.status(200).json(articleInfo);
    }, res);
 })

// When the app recieves the GET request ->
// CALLBACK - two main arguments - req - request - contains the details about
// the request we recieve, res - response - we use the response back to whoever sent the request.
// app.get('/hello', (req, res) => res.send('Hello'));
// app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}`));
// app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}!`));

// UPVOTE
// we need to use async with the keyword await
app.post('/api/articles/:name/upvote', async (req, res) => { 
//    try {
    // extract the article name from URL parameters
//    const articleName = req.params.name;
    // connect to database
//    const client = await MongoClient.connect('mongodb://localhost: 27017', {useNewUrlParser: true});
//    const db = client.db('my-blog');
    // find the article in the database whose name matches our url parameter
//    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    // increment the number of upvotes in the article database
//    await db.collection('articles').updateOne({ name: articleName}, {
    // the actual update of votes    
//      '$set': {
//          upvotes: articleInfo.upvotes + 1,
//      },
//    });
    // updated database
//    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    // we send updated article info back to the client
//    res.status(200).json(updatedArticleInfo);

//    client.close();
//  } catch (error) {
//    res.status(500).json({ message: 'Error connecting to db', error });
// }

// SIMPLYFING THE CODE WITH withDB function
  withDB(async (db) => {
      const articleName = req.params.name;

      const articleInfo = await db.collection('articles').findOne({ name: articleName });
       await db.collection('articles').updateOne({ name: articleName}, {
      // the actual update of votes    
         '$set': {
           upvotes: articleInfo.upvotes + 1,
        },
      });
      const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    // we send updated article info back to the client
      res.status(200).json(updatedArticleInfo);
   }, res);
}); 

// New endpoint that we can send requests to in order to update the number of upvotes on
// a given article. 
// app.post and for the endpoint path, we're going to use URL parameters ->
// we are going to do /api/articles/:name. 
    // THEY WORK ONLY WITH FAKE DATABASE
    // articlesInfo[articleName].upvotes += 1;
    // a reponse telling the client how many upvotes the article has
    // res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes`)

// COMMENTS
app.post('/api/articles/:name/add-comment', (req, res) => {
    // const { username, text } = req.body;
    // add comments
    // const articleName = req.params.name;

    // articlesInfo[articleName].comments.push({username, text});

    // res.status(200).send(articlesInfo[articleName]);

    // SIMPLYFING THE CODE WITH withDB 
    const { username, text } = req.body;
    const articleName = req.params.name;

    withDB(async (db) => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName })
        await db.collection('articles').updatedOne({ name: articleName }, {
            '$set': {
                comments: articleInfo.comments.concat({username, text}),
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);
    }, res);
});

// needs to be at the end, after the last api route
// all of requests that are not caughtby any of our other API routes should
// be passes on to our app. 
app.get('*', (req, res) => { 
    res.sendFile(path.join(__dirname + '/build/index.html'));
})

app.listen(8000, () => console.log('Listening on port 8000'));

// WHY WE NEED TO USE REAL DATABASE LIKE MONGODB
// All our article data is stored inside SERVER CODE, every time our server
// restarts, all our data will be gone and reset to its original values.
// If we kill our server and start it again, we can see that it got rid of the
// other comments. --> we need to use a database. 

// WHY MONGODB
// can push data to database without worrying about format 
// (in other words, accepts any JSON object)
// structure of data does not have to be defined in advance
// SQL not required
// Allows for creation of modular, reusable components that can be
// arranged into a fully-functioning site. 

// REFACTORING CODE --> a lot of repetition in the code
// DRY - DON'T REPEAT YOURSELF