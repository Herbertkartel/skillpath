const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./models/index');
const Skill = require('./models/Skill');
const Course = require('./models/Course');


const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Sync models with the database
sequelize.sync({ force: true }) // force: true will drop the tables first and recreate them
  .then(() => {
    console.log("Database synced successfully.");
    // Prepopulate some sample data for testing
    return Promise.all([
      Skill.bulkCreate([
        { name: 'JavaScript' },
        { name: 'React' },
        { name: 'Node.js' },
        { name: 'Python' },
        { name: 'SQL' }
      ]),
      Course.bulkCreate([
        { name: 'Learn JavaScript', provider: 'Udemy' },
        { name: 'Master React', provider: 'Coursera' },
        { name: 'Node.js for Beginners', provider: 'Pluralsight' }
      ])
    ]);
  })
  .catch(error => console.error("Error syncing database:", error));

// Analyze skills endpoint
app.post('/analyze_skills', async (req, res) => {
  const { user_skills, desired_role } = req.body;

  try {
    // Fetch all skills from the database
    const allSkills = await Skill.findAll({ attributes: ['name'] });
    const skillsInDB = allSkills.map(skill => skill.name);

    // Find missing skills
    const missingSkills = skillsInDB.filter(skill => !user_skills.includes(skill));

    // Mock similarity score calculation
    const similarityScore = Math.random(); // Replace with actual logic if needed

    const response = {
      similarity_score: similarityScore,
      missing_skills: missingSkills,
    };

    console.log("Analyzing skills for role:", desired_role);
    res.json(response);
  } catch (error) {
    console.error("Error analyzing skills:", error);
    res.status(500).json({ message: "Server error during skill analysis." });
  }
});

// Fetch recommended courses based on missing skills
app.get('/get_courses', async (req, res) => {
  const { skills } = req.query;
  const missingSkills = Array.isArray(skills) ? skills : [skills];

  try {
    // Fetch courses from the database based on missing skills
    const recommendedCourses = await Course.findAll({
      where: {
        name: {
          [sequelize.Op.iLike]: missingSkills.map(skill => `%${skill}%`) // Match any of the missing skills
        }
      }
    });

    res.json(recommendedCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Server error fetching courses." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

