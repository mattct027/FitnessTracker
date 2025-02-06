const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb+srv://group7mongo:PyQShF7GsAUsp6dk@cluster0.r4cqh.mongodb.net/COP4331?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(url);
client.connect();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

//Creation

app.post('/api/signup', async (req, res, next) => {
    var error = '';

    const { firstname, lastname, login, password } = req.body;

    const db = client.db();
    const newUser = { FirstName: firstname, LastName: lastname, Login: login, Password: password };

    const results = await db.collection('Users').find({ Login: login }).toArray();

    if (results.length > 0) {
        error = 'User already exists';
    } else {
        try {
            const results = db.collection('Users').insertOne(newUser);
        } catch (e) {
            error = e.toString();
        }
    }

    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/create-exercise', async (req, res, next) => {
    var error = '';

    const { name, muscleGroup, equipmentType } = req.body;

    if (!name || !muscleGroup || !equipmentType) {
        error = 'All fields are required: name, muscleGroup, equipmentType';
    } else {
        const db = client.db();
        const newExercise = { Name: name, MuscleGroup: muscleGroup, EquipmentType: equipmentType };

        try {
            await db.collection('Exercises').insertOne(newExercise);
        } catch (e) {
            error = e.toString();
        }
    }

    var ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/create-set', async (req, res, next) => {
    let error = '';

    const { setName, exercises, userId } = req.body;

    const db = client.db();
    const newSet = { SetName: setName, Exercises: exercises, UserId: new ObjectId(userId) };

    try {
        const result = await db.collection('Sets').insertOne(newSet);
        if (!result.insertedId) {
            error = 'Failed to create the set';
        }
    } catch (e) {
        error = e.toString();
    }

    const ret = { error: error };
    res.status(200).json(ret);
});

//Retrieval

app.post('/api/login', async (req, res, next) => {
    var error = '';

    const { login, password } = req.body;

    const db = client.db();
    const results = await db.collection('Users').find({ Login: login, Password: password }).toArray();

    var id = -1;
    var fn = '';
    var ln = '';

    if (results.length > 0) {
        id = results[0]._id;
        fn = results[0].FirstName;
        ln = results[0].LastName;
    }

    var ret = { id: id, firstName: fn, lastName: ln, error: '' };
    res.status(200).json(ret);
});

app.post('/api/retrieve-exercise', async (req, res, next) => {
    var error = '';

    const { search } = req.body;

    var _search = search.trim();

    let results = [];
    try {
        const db = client.db();
        results = await db.collection('Exercises').find({ "Name": { $regex: _search + '.*', $options: 'i' } }).toArray();
    } catch (e) {
        error = e.toString();
    }

    if (results.length == 0) {
        error = 'Exercise does not exist';
    } else {
        var nameList = [];
        var muscleGroupList = [];
        var equipmentTypeList = [];

        for (var i = 0; i < results.length; i++) {
            nameList.push(results[i].Name);
            muscleGroupList.push(results[i].MuscleGroup);
            equipmentTypeList.push(results[i].EquipmentType);
        }
    }

    var ret = { names: nameList, musclegroups: muscleGroupList, equipmenttypes: equipmentTypeList, error: error };
    res.status(200).json(ret);
});


app.post('/api/retrieve-set', async (req, res, next) => {
    let error = '';

    const { userId } = req.body;

    if (!userId) {
        error = 'User ID is required';
        return res.status(400).json({ error });
    }

    try {
        const db = client.db();
        const results = await db.collection('Sets').find({ UserId: new ObjectId(userId) }).toArray();

        if (results.length === 0) {
            error = 'No sets found for this user';
        }

        res.status(200).json({ sets: results, error });
    } catch (e) {
        error = e.toString();
        res.status(500).json({ error });
    }
});


//Update


app.post('/api/update-exercise', async (req, res, next) => {
    let error = '';

    const { name, muscleGroup, equipmentType } = req.body;

    if (!name || !muscleGroup || !equipmentType) {
        error = 'All fields are required: name, muscleGroup, equipmentType';
    } else {
        try {
            const db = client.db();
            const result = await db.collection('Exercises').updateOne(
                { Name: { $regex: '^' + name + '$', $options: 'i' } },
                { $set: { MuscleGroup: muscleGroup, EquipmentType: equipmentType } }
            );

            if (result.matchedCount === 0) {
                error = 'Exercise not found';
            } else if (result.modifiedCount === 0) {
                error = 'No changes made to the exercise';
            }
        } catch (e) {
            error = e.toString();
        }
    }

    const ret = { error: error };
    res.status(200).json(ret);
});

app.post('/api/update-set', async (req, res, next) => {
    let error = '';

    const { setName, newSetName, exercises } = req.body;

    if (!setName || !newSetName || !Array.isArray(exercises)) {
        error = 'All fields are required: setName, newSetName, exercises (Array)';
    } else {
        try {
            const db = client.db();
            const result = await db.collection('Sets').updateOne(
                { SetName: { $regex: '^' + setName + '$', $options: 'i' } },
                { $set: { SetName: newSetName, Exercises: exercises } }
            );

            if (result.matchedCount === 0) {
                error = 'Set not found';
            } else if (result.modifiedCount === 0) {
                error = 'No changes made to the set';
            }
        } catch (e) {
            error = e.toString();
        }
    }

    const ret = { error: error };
    res.status(200).json(ret);
});

//Deletion

app.post('/api/delete-exercise', async (req, res, next) => {
    let error = '';

    const { exerciseName } = req.body;

    if (!exerciseName || exerciseName.trim() === '') {
        error = 'Exercise name is required';
        return res.status(400).json({ error });
    }

    try {
        const db = client.db();

        const result = await db.collection('Exercises').deleteOne({
            Name: { $regex: '^' + exerciseName.trim() + '$', $options: 'i' }
        });

        if (result.deletedCount === 0) {
            error = 'Exercise not found';
            return res.status(404).json({ error });
        }

        const ret = {
            message: `Exercise "${exerciseName}" deleted successfully`,
            error
        };

        res.status(200).json(ret);
    } catch (e) {
        error = e.toString();
        res.status(500).json({ error });
    }
});
    app.post('/api/delete-set', async (req, res, next) => {



    let error = '';

    const { setName } = req.body;

    if (!setName || setName.trim() === '') {
        error = 'Set name is required';
        return res.status(400).json({ error });
    }

    try {
        const db = client.db();


        const result = await db.collection('Sets').deleteOne({
            SetName: { $regex: '^' + setName.trim() + '$', $options: 'i' }
        });

        if (result.deletedCount === 0) {
            error = 'Set not found';
            return res.status(404).json({ error });
        }


        const ret = {
            message: `Set "${setName}" deleted successfully`,
            error
        };

        res.status(200).json(ret);
    } catch (e) {
        error = e.toString();
        res.status(500).json({ error });
    }
});



app.listen(5000);
