const express  =  require('express');
const cors = require("cors");
const mongodb = require("mongodb");
const app = express();
let ObjectId = require('mongodb').ObjectID;

app.use(express.static('public'));
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());

let db = null;
let collection = null;

async function startServer(){
    const client = await mongodb.MongoClient.connect(`mongodb://localhost:27017/wpr-quiz`);
    db = client.db();
    collection = db.collection('questions');
    console.log('connected to db');

    await app.listen(3000);
    console.log("Listening on port 3000");
}

startServer();

app.post('/attempts', async function(req, res){
    let attempts = {
        "questions": [],
        "completed": false,
        "score": 0,
        "startedAt": new Date(),
        "__v": 0
    };

    attempts.questions = shuffleArray(await db.collection('questions').find().toArray());
    for(let i =0; i<5;i++){
        attempts.questions.pop();
    }

    const results = await db.collection('attempts').insertOne(attempts);
    
    attempts = await db.collection('attempts').findOne({_id : results.insertedId});
    res.status(200).json(attempts);
});

// app.post('/attempts/:id/submit', async function(req, res){
//     const answers = req.body;
//     const id = req.params.id;
//     let attempt = await db.collection('attempts').findOne({_id : new ObjectId(id)});
//     let score = 0;
//     let correctAnswers = {}
//     let scoreText = '';

//     for(let i =0; i< attempt.questions.length; i++){
//         correctAnswers[`${attempt.questions[i]._id}`] = attempt.questions[i].correctAnswer;
//     }

//     for (const key in correctAnswers){
//         if(answers.answers[key] == correctAnswers[key]){
//             score+=1;
//         }
//     }

//     scoreText = calculateScore(score);

//     attempt.score = score;
//     attempt.correctAnswers = correctAnswers;
//     attempt.answers = answers.answers;
//     attempt.completed = true;
//     attempt.scoreText = scoreText;

//     await db.collection('attempts').updateOne({_id : new ObjectId(id)}, {$set: attempt});
    
//     res.status(200).send(attempt);
// });

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function calculateScore(score){
    if(score < 5){
        return 'Practice more to improve it :D'
    } else if( 5 <= score <= 7){
        return 'Good, keep up!';
    } else if( 7 <= score <= 9){
        return 'Well done!';
    } else if(score >= 9){
        return 'Perfect!!';
    }
}
