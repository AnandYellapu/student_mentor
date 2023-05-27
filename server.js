const express = require('express');
const mongoose = require('mongoose');

// const app = express.app();
const app = express();
const PORT = 8000; // You can change the port number if needed

// Connect to MongoDB
mongoose.connect('mongodb+srv://anandsaiii1200:Yanandsai@cluster1.nzqg4k4.mongodb.net/student-mentorDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Define the Mentor and Student models and schemas
const mentorSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
});

const studentSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
  },
  mentorName: String,
});

const Mentor = mongoose.model('Mentor', mentorSchema);
const Student = mongoose.model('Student', studentSchema);

// Set up the views directory and template engine
app.set('views', './views');
app.set('view engine', 'ejs');

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route handler for the root URL
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Student Mentor app</title>
    </head>
    <body>
      <h1>Welcome to the Student Mentor app</h1>
      <p>This is the homepage of the app.</p>
      <p>Use the following routes to interact with the app:</p>
      <ul>
        <li><a href="/mentors/new">Create New Mentor</a></li>
        <li><a href="/students/new">Create New Student</a></li>
        <li><a href="/students/:studentId/assign-mentor">Assign-Mentor to student</a></li>
        <li><a href="/students/:studentId/change-mentor">change-mentor to student</a></li>
      </ul>
    </body>
    </html>
  `);
});

// API endpoint to create a new Mentor
app.post('/mentors', async (req, res) => {
  try {
    const { name, id, email } = req.body;
    const mentor = await Mentor.create({ name, id, email });
    res.status(201).json(mentor);
  } catch (error) {
    console.error('Error creating Mentor:', error);
    res.status(500).send('Error creating Mentor');
  }
});

// API endpoint to create a new Student
app.post('/students', async (req, res) => {
  try {
    const { name, id, email } = req.body;
    const student = await Student.create({ name, id, email });
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating Student:', error);
    res.status(500).send('Error creating Student');
  }
});

// API endpoint to assign a Student to a Mentor
app.put('/students/:studentId/assign-mentor', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { mentorId, mentorName } = req.body;

    // Assign the mentor to the student
    const student = await Student.findOneAndUpdate({ _id: studentId }, { mentor: mentorId, mentorName: mentorName }, { new: true });

    res.json(student);
  } catch (error) {
    console.error('Error assigning Mentor to Student:', error);
    res.status(500).send('Error assigning Mentor to Student');
  }
});

// API endpoint to assign a Mentor to a Student (POST)
app.post('/students/:studentId/assign-mentor', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { mentorId } = req.body;

    // Assign the mentor to the student
    const student = await Student.findByIdAndUpdate(
      studentId,
      { mentor: mentorId },
      { new: true }
    );

    res.json(student);
  } catch (error) {
    console.error('Error assigning Mentor to Student:', error);
    res.status(500).send('Error assigning Mentor to Student');
  }
});



// API endpoint to assign or change the Mentor for a particular Student
app.put('/students/:studentId/change-mentor', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { mentorId } = req.body;

    // Assign or change the mentor for the student
    const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });

    res.json(student);
  } catch (error) {
    console.error('Error assigning/changing Mentor for Student:', error);
    res.status(500).send('Error assigning/changing Mentor for Student');
  }
});

// API endpoint to show all students for a particular mentor
app.get('/mentors/:mentorId/students', async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Find all students assigned to the mentor
    const students = await Student.find({ mentor: mentorId });

    res.json(students);
  } catch (error) {
    console.error('Error retrieving students for Mentor:', error);
    res.status(500).send('Error retrieving students for Mentor');
  }
});

// API endpoint to show the previously assigned mentor for a particular student
app.get('/students/:studentId/previous-mentor', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find the student and populate the mentor field
    const student = await Student.findById(studentId).populate('mentor');

    res.json(student.mentor);
  } catch (error) {
    console.error('Error retrieving previous Mentor for Student:', error);
    res.status(500).send('Error retrieving previous Mentor for Student');
  }
});

// API endpoint to render an HTML page with the form to create a Mentor
app.get('/mentors/new', (req, res) => {
  res.send(`<html>
    <head>
      <title>Create New Mentor</title>
    </head>
    <body>
      <h1>Create New Mentor</h1>
      <form action="/mentors" method="POST">
        <label for="mentorName">Mentor Name:</label>
        <input type="text" id="mentorName" name="name" required><br>

        <label for="mentorId">Mentor ID:</label>
        <input type="text" id="mentorId" name="id" required><br>

        <label for="mentorEmail">Mentor Email:</label>
        <input type="email" id="mentorEmail" name="email" required><br>

        <button type="submit">Create Mentor</button>
      </form>
    </body>
    </html>`);
});


// API endpoint to get a list of all mentors
app.get('/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (error) {
    console.error('Error retrieving mentors:', error);
    res.status(500).send('Error retrieving mentors');
  }
});

// API endpoint to render an HTML page with the form to create a Student
app.get('/students/new', (req, res) => {
  res.send(`<html>
    <head>
      <title>Create New Student</title>
    </head>
    <body>
      <h1>Create New Student</h1>
      <form action="/students" method="POST">
        <label for="studentName">Student Name:</label>
        <input type="text" id="studentName" name="name" required><br>

        <label for="studentId">Student ID:</label>
        <input type="text" id="studentId" name="id" required><br>

        <label for="studentEmail">Student Email:</label>
        <input type="email" id="studentEmail" name="email" required><br>

        <button type="submit">Create Student</button>
      </form>
    </body>
    </html>`);
});


// API endpoint to get a list of all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Error retrieving students:', error);
    res.status(500).send('Error retrieving students');
  }
});

// API endpoint to render an HTML page with the form to assign-mentor to students
app.get('/students/:studentId/assign-mentor', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    const { studentId } = req.params;

    let mentorOptions = '';
    mentors.forEach((mentor) => {
      mentorOptions += `<option value="${mentor._id}">${mentor.name}</option>`;
    });

    res.send(`<html>
      <head>
        <title>Assign Mentor to Student</title>
      </head>
      <body>
        <h1>Assign Mentor to Student</h1>
        <form action="/students/${studentId}/assign-mentor" method="POST">
          <label for="mentorId">Select Mentor:</label>
          <select id="mentorId" name="mentorId" required>
            ${mentorOptions}
          </select><br>

          <button type="submit">Assign Mentor</button>
        </form>
      </body>
    </html>`);
  } catch (error) {
    console.error('Error retrieving Mentors:', error);
    res.status(500).send('Error retrieving Mentors');
  }
});

app.post('/students/:studentId/assign-mentor', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    const { studentId } = req.params;

    let mentorOptions = '';
    mentors.forEach((mentor) => {
      mentorOptions += `<option value="${mentor._id}">${mentor.name}</option>`;
    });

    res.send(`<html>
      <head>
        <title>Assign Mentor to Student</title>
      </head>
      <body>
        <h1>Assign Mentor to Student</h1>
        <form action="/students/${studentId}/assign-mentor" method="POST">
          <label for="mentorId">Select Mentor:</label>
          <select id="mentorId" name="mentorId" required>
            ${mentorOptions}
          </select><br>

          <button type="submit">Assign Mentor</button>
        </form>
      </body>
    </html>`);
  } catch (error) {
    console.error('Error retrieving Mentors:', error);
    res.status(500).send('Error retrieving Mentors');
  }
});


// API endpoint to render an HTML page with the form to change the Mentor for a Student
app.get('/students/:studentId/change-mentor', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    const { studentId } = req.params;

    let mentorOptions = '';
    mentors.forEach((mentor) => {
      mentorOptions += `<option value="${mentor._id}">${mentor.name}</option>`;
    });

    res.send(`<html>
      <head>
        <title>Change Mentor for Student</title>
      </head>
      <body>
        <h1>Change Mentor for Student</h1>
        <form action="/students/${studentId}/change-mentor" method="PUT">
          <label for="mentorId">Select Mentor:</label>
          <select id="mentorId" name="mentorId" required>
            ${mentorOptions}
          </select><br>

          <button type="submit">Change Mentor</button>
        </form>
      </body>
      </html>`);
  } catch (error) {
    console.error('Error retrieving Mentors:', error);
    res.status(500).send('Error retrieving Mentors');
  }
});

app.post('/students/:studentId/change-mentor', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { mentorId } = req.body;

    // Update the student's mentor in the database
    await Student.findByIdAndUpdate(studentId, { mentorId });

    res.send('Mentor changed successfully!');
  } catch (error) {
    console.error('Error changing mentor:', error);
    res.status(500).send('Error changing mentor');
  }
});


// API endpoint to render an HTML page with the form to change the Mentor for a Student
app.put('/students/:studentId/change-mentor', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    const { studentId } = req.params;

    let mentorOptions = '';
    mentors.forEach((mentor) => {
      mentorOptions += `<option value="${mentor._id}">${mentor.name}</option>`;
    });

    res.send(`<html>
      <head>
        <title>Change Mentor for Student</title>
      </head>
      <body>
        <h1>Change Mentor for Student</h1>
        <form action="/students/${studentId}/change-mentor" method="PUT">
          <label for="mentorId">Select Mentor:</label>
          <select id="mentorId" name="mentorId" required>
            ${mentorOptions}
          </select><br>

          <button type="submit">Change Mentor</button>
        </form>
      </body>
      </html>`);
  } catch (error) {
    console.error('Error retrieving Mentors:', error);
    res.status(500).send('Error retrieving Mentors');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});