const db = require("./utils/db"); // adjust path if needed

// Add a new achievement for student1
db.get("achievements")
  .push({
    id: Date.now(), // unique ID
    userId: 1,
    title: "Open Source Contribution",
    description: "Contributed to an open-source project on GitHub",
    points: 50,
  })
  .write();

console.log("✅ New achievement added!");

// Verify it worked
const updatedAchievements = db.get("achievements").filter({ userId: 1 }).value();
console.log("Student1 achievements:", updatedAchievements);
