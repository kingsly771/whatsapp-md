module.exports = {
  name: 'Anime Trivia',
  description: 'Challenges users with anime trivia questions',
  version: '1.0.0',
  code: `const triviaQuestions = [
  {
    question: "What is the name of the main character in Naruto?",
    options: ["Naruto Uzumaki", "Sasuke Uchiha", "Kakashi Hatake", "Iruka Umino"],
    answer: "Naruto Uzumaki"
  },
  {
    question: "Which anime features the 'Stand' ability?",
    options: ["JoJo's Bizarre Adventure", "Dragon Ball Z", "One Piece", "Bleach"],
    answer: "JoJo's Bizarre Adventure"
  },
  {
    question: "What is the name of the giant robot in Neon Genesis Evangelion?",
    options: ["EVA-01", "Gundam", "Mazinger Z", "Voltron"],
    answer: "EVA-01"
  }
];

const userScores = new Map();

async function animeTrivia(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'trivia') {
    const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
    let optionsText = '';
    
    randomQuestion.options.forEach((option, index) => {
      optionsText += \`\${index + 1}. \${option}\\n\`;
    });
    
    await client.sendMessage(message.from, 
      \`❓ Anime Trivia Question:\\n\\n` +
      \`\${randomQuestion.question}\\n\\n` +
      \`\${optionsText}\\n` +
      \`Reply with \${prefix}answer <number> to answer!\`
    );
    
    // Store the current question for the user
    if (!userScores.has(message.from)) {
      userScores.set(message.from, { score: 0, currentQuestion: null });
    }
    userScores.get(message.from).currentQuestion = randomQuestion;
  }
  
  if (message.body.startsWith(prefix + 'answer')) {
    if (!userScores.has(message.from)) {
      await client.sendMessage(message.from, "Start a trivia game first with " + prefix + "trivia");
      return;
    }
    
    const userData = userScores.get(message.from);
    const answerIndex = parseInt(message.body.split(' ')[1]) - 1;
    
    if (userData.currentQuestion && 
        userData.currentQuestion.options[answerIndex] === userData.currentQuestion.answer) {
      userData.score++;
      await client.sendMessage(message.from, 
        \`✅ Correct! Your score: \${userData.score}\\n\\n` +
        \`The answer was: \${userData.currentQuestion.answer}\`
      );
    } else {
      await client.sendMessage(message.from, 
        \`❌ Wrong! The correct answer was: \${userData.currentQuestion.answer}\\n` +
        \`Your score: \${userData.score}\`
      );
    }
    
    userData.currentQuestion = null;
  }
  
  if (message.body === prefix + 'triviascore') {
    const score = userScores.has(message.from) ? userScores.get(message.from).score : 0;
    await client.sendMessage(message.from, \`🏆 Your trivia score: \${score}\`);
  }
}`
};
