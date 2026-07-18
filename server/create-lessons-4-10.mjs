import mysql from 'mysql2/promise';
import 'dotenv/config';

const lessons = [
  {
    id: 180004,
    title: "Lesson 4: At School",
    description: "Learn school vocabulary, classroom expressions, and education topics",
    story: `**A Day at Riverside High School**

Emily is a 16-year-old student at Riverside High School. She wakes up at 6:30 AM every weekday to get ready for school.

Her first class is English Literature with Mrs. Thompson. "Good morning, class! Today we're going to discuss Shakespeare's Romeo and Juliet," announces Mrs. Thompson. Emily raises her hand to answer a question. "Excellent answer, Emily!" says the teacher.

During the break, Emily meets her best friend Jake at the lockers. "Did you finish the math homework?" Jake asks nervously. "Yes, but problem number 5 was really difficult," Emily replies. They walk together to the cafeteria for lunch.

In the afternoon, Emily has Biology class in the science laboratory. The teacher, Mr. Chen, demonstrates an experiment. "Please put on your safety goggles and lab coats," he instructs. Emily and her lab partner carefully observe the chemical reaction.

After Biology, Emily goes to the library to study for tomorrow's History test. She takes notes from her textbook and reviews the important dates. The librarian, Ms. Rodriguez, helps her find additional reference books.

At 3:30 PM, school ends. Emily has soccer practice with the school team. Coach Martinez teaches them new strategies. "Great teamwork, everyone!" he shouts encouragingly.

On her way home, Emily thinks about her day. "I love learning new things every day," she says to herself with a smile.`,
    vocabulary: [
      {word:"classroom",phonetic:"/ˈklæsruːm/",translation:"sala de aula",synonyms:["class"],slang:"room",example:"Our classroom has 30 desks."},
      {word:"homework",phonetic:"/ˈhoʊmwɜːrk/",translation:"lição de casa",synonyms:["assignment"],slang:"hw",example:"I have a lot of homework tonight."},
      {word:"textbook",phonetic:"/ˈtekstbʊk/",translation:"livro didático",synonyms:["coursebook"],slang:"book",example:"Don't forget your textbook."},
      {word:"test",phonetic:"/test/",translation:"prova",synonyms:["exam","quiz"],slang:"pop quiz",example:"We have a math test tomorrow."},
      {word:"library",phonetic:"/ˈlaɪbreri/",translation:"biblioteca",synonyms:["media center"],slang:"lib",example:"I study at the library."},
      {word:"cafeteria",phonetic:"/ˌkæfəˈtɪriə/",translation:"refeitório",synonyms:["lunchroom"],slang:"caf",example:"Let's meet at the cafeteria."}
    ],
    grammar: [
      {topic:"Present Simple for Routines",explanation:"Use present simple to describe daily school routines.",examples:["Emily wakes up at 6:30 AM.","She has English class first."],exercises:["Complete: I _____ (go) to school every day."]},
      {topic:"Imperatives for Instructions",explanation:"Use imperatives to give classroom instructions.",examples:["Open your books to page 45.","Please raise your hand."],exercises:["Give instruction: _____ (listen) carefully."]}
    ],
    phonetics: [
      {sound:"Silent b",ipa:"/klaɪm/",tips:"The b is silent in climb",examples:["climb /klaɪm/"]},
      {sound:"th sound",ipa:"/θ/",tips:"Voiceless th",examples:["math /mæθ/","three /θriː/"]},
      {sound:"Word stress",ipa:"Emphasis",tips:"Stress patterns",examples:["CLASS-room","home-WORK"]}
    ],
    prompts: ["What is your favorite subject at school?","Who is your favorite teacher and why?","Do you prefer studying alone or in groups?","What time does your school start and end?","Do you participate in any school clubs or sports?","What is the most difficult subject for you?","Do you enjoy doing homework?","Have you ever won any school awards?","What do you want to study in university?","What is your dream job?"]
  },
  {
    id: 180005,
    title: "Lesson 5: At Work",
    description: "Learn workplace vocabulary, professional communication, and office expressions",
    story: `**A Busy Day at Tech Solutions Inc.**

David is a software developer at Tech Solutions Inc. He arrives at the office at 8:45 AM, ready for another productive day.

"Good morning, David!" greets his colleague Sarah. "Ready for the big presentation today?" David nods confidently. "Yes, I've been preparing all week."

At 9:00 AM, the team has their daily stand-up meeting. Everyone shares their progress and plans for the day. David's manager, Mr. Roberts, listens carefully and provides feedback. "Great work on the new feature, David. Keep it up!"

David spends the morning coding and debugging. He collaborates with his team using video calls and instant messaging. "Can you review my code?" asks his junior colleague Tom. "Of course! Let me take a look," David replies helpfully.

At noon, David takes his lunch break in the company cafeteria. He discusses the upcoming project deadline with his teammates while eating.

In the afternoon, David presents his project to the clients via video conference. "This solution will increase your efficiency by 40%," he explains professionally. The clients are impressed and approve the proposal.

Before leaving at 5:30 PM, David sends a summary email to his team and schedules tomorrow's tasks. "Another successful day!" he thinks as he heads home.`,
    vocabulary: [
      {word:"office",phonetic:"/ˈɔːfɪs/",translation:"escritório",synonyms:["workplace"],slang:"the place",example:"I work in an office downtown."},
      {word:"meeting",phonetic:"/ˈmiːtɪŋ/",translation:"reunião",synonyms:["conference"],slang:"meet-up",example:"We have a meeting at 10 AM."},
      {word:"deadline",phonetic:"/ˈdedlaɪn/",translation:"prazo",synonyms:["due date"],slang:"crunch time",example:"The deadline is next Friday."},
      {word:"colleague",phonetic:"/ˈkɑːliːɡ/",translation:"colega de trabalho",synonyms:["coworker"],slang:"work buddy",example:"My colleagues are very friendly."},
      {word:"presentation",phonetic:"/ˌprezənˈteɪʃən/",translation:"apresentação",synonyms:["pitch"],slang:"preso",example:"I have to give a presentation."},
      {word:"email",phonetic:"/ˈiːmeɪl/",translation:"e-mail",synonyms:["electronic mail"],slang:"mail",example:"Please send me an email."}
    ],
    grammar: [
      {topic:"Present Continuous for Current Actions",explanation:"Use present continuous for actions happening now at work.",examples:["I am working on a project.","She is attending a meeting."],exercises:["Complete: He _____ (prepare) the report right now."]},
      {topic:"Modal Verbs for Requests",explanation:"Use can, could, would for polite workplace requests.",examples:["Could you help me with this?","Can you review my document?"],exercises:["Make polite: Help me. → _____ you help me, please?"]}
    ],
    phonetics: [
      {sound:"Schwa sound",ipa:"/ə/",tips:"Unstressed vowel sound",examples:["office /ˈɔːfɪs/","colleague /ˈkɑːliːɡ/"]},
      {sound:"Word stress",ipa:"Emphasis",tips:"Stress first syllable",examples:["OF-fice","MEET-ing","DEAD-line"]}
    ],
    prompts: ["What do you do for work?","What time do you usually start and finish work?","Do you work from home or in an office?","What is your typical workday like?","Do you enjoy your job? Why or why not?","What is the most challenging part of your job?","Do you have good relationships with your colleagues?","Have you ever had to give a presentation?","What are your career goals?","Would you like to change your career? To what?"]
  }
];

async function createLessons() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    for (const lesson of lessons) {
      console.log(`Creating ${lesson.title}...`);
      
      await connection.execute(
        `INSERT INTO lessons (id, courseId, title, description, orderIndex, languageCode, estimatedMinutes, storyText, vocabularyDetailed, grammarDetailed, phonetics, conversationPrompts)
         VALUES (?, 90001, ?, ?, ?, 'en-US', 30, ?, ?, ?, ?, ?)`,
        [
          lesson.id,
          lesson.title,
          lesson.description,
          lesson.id - 180000,
          lesson.story,
          JSON.stringify(lesson.vocabulary),
          JSON.stringify(lesson.grammar),
          JSON.stringify(lesson.phonetics),
          JSON.stringify(lesson.prompts)
        ]
      );
      
      console.log(`✅ ${lesson.title} created!`);
    }
    
    console.log('\n🎉 Lessons 4-5 created successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createLessons();
