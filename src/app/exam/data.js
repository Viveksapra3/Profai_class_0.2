export const subjects = [
  {
    id: 'math', slug: 'math',
    name: 'Mathematics',
    chapters: [
      {
        id: 'arithmetic', slug: 'arithmetic',
        name: 'Arithmetic',
        questions: [
          { id: 'm1q1', type: 'single', title: 'What is 2 + 2?', options: ['1','2','3','4'], correct: 3, marks: 1 },
          { id: 'm1q2', type: 'single', title: 'What is 10 - 6?', options: ['1','2','3','4'], correct: 2, marks: 1 },
          { id: 'm1q3', type: 'multiple', title: 'Select even numbers', options: ['1','2','3','4'], correct: [1,3], marks: 2 },
          { id: 'm1q4', type: 'single', title: 'What is 5 × 3?', options: ['8','15','10','20'], correct: 1, marks: 1 },
          { id: 'm1q5', type: 'single', title: 'What is 18 ÷ 3?', options: ['5','6','7','9'], correct: 1, marks: 1 },
          { id: 'm1q6', type: 'text', title: 'Explain the difference between addition and multiplication.', marks: 2 },
        ],
      },
      {
        id: 'algebra', slug: 'algebra',
        name: 'Algebra',
        questions: [
          { id: 'm2q1', type: 'single', title: 'Solve for x: 2x = 8', options: ['2','3','4','5'], correct: 2, marks: 1 },
          { id: 'm2q2', type: 'single', title: 'Solve: x + 5 = 9', options: ['3','4','5','6'], correct: 1, marks: 1 },
          { id: 'm2q3', type: 'multiple', title: 'Which are solutions of x^2 = 9?', options: ['-3','-2','0','3'], correct: [0,3], marks: 2 },
          { id: 'm2q4', type: 'single', title: 'If y = 3x, y when x = 2 is', options: ['3','5','6','9'], correct: 2, marks: 1 },
          { id: 'm2q5', type: 'text', title: 'Describe what a variable is in algebra.', marks: 2 },
        ],
      },
    ],
  },
  {
    id: 'english', slug: 'english',
    name: 'English',
    chapters: [
      {
        id: 'grammar', slug: 'grammar',
        name: 'Grammar',
        questions: [
          { id: 'e1q1', type: 'single', title: 'Pick the noun', options: ['Run','Blue','Apple','Quickly'], correct: 2, marks: 1 },
          { id: 'e1q2', type: 'multiple', title: 'Pick adjectives', options: ['Happy','Jump','Green','Swim'], correct: [0,2], marks: 2 },
          { id: 'e1q3', type: 'single', title: 'Pick the verb', options: ['Joy','Jump','Green','Soft'], correct: 1, marks: 1 },
          { id: 'e1q4', type: 'single', title: 'Correct plural of "child"', options: ['childs','childes','children','childrens'], correct: 2, marks: 1 },
          { id: 'e1q5', type: 'text', title: 'Write a sentence using an adjective and a noun.', marks: 2 },
        ],
      },
      {
        id: 'comprehension', slug: 'comprehension',
        name: 'Comprehension',
        questions: [
          { id: 'e2q1', type: 'text', title: 'Summarize a short story you like.', marks: 3 },
          { id: 'e2q2', type: 'single', title: 'What is the main idea of a paragraph?', options: ['Title','Central point','First line','Last line'], correct: 1, marks: 1 },
        ],
      },
    ],
  },
  {
    id: 'science', slug: 'science',
    name: 'Science',
    chapters: [
      {
        id: 'physics-basics', slug: 'physics-basics',
        name: 'Physics Basics',
        questions: [
          { id: 's1q1', type: 'single', title: 'SI unit of force?', options: ['Joule','Pascal','Newton','Watt'], correct: 2, marks: 1 },
          { id: 's1q2', type: 'single', title: 'Speed = ?', options: ['Distance/Time','Time/Distance','Mass/Volume','Force/Area'], correct: 0, marks: 1 },
          { id: 's1q3', type: 'multiple', title: 'Select vector quantities', options: ['Velocity','Speed','Acceleration','Mass'], correct: [0,2], marks: 2 },
          { id: 's1q4', type: 'single', title: 'Acceleration unit is', options: ['m/s','m/s²','N','kg'], correct: 1, marks: 1 },
          { id: 's1q5', type: 'text', title: 'State Newton’s second law of motion.', marks: 2 },
        ],
      },
      {
        id: 'biology-cells', slug: 'biology-cells',
        name: 'Biology - Cells',
        questions: [
          { id: 's2q1', type: 'single', title: 'Powerhouse of the cell', options: ['Nucleus','Mitochondria','Ribosome','Golgi body'], correct: 1, marks: 1 },
          { id: 's2q2', type: 'single', title: 'Genetic material is found in the', options: ['Cell wall','Nucleus','Cytoplasm','Membrane'], correct: 1, marks: 1 },
          { id: 's2q3', type: 'multiple', title: 'Select cell organelles', options: ['Chloroplast','Mitochondria','Enzyme','Nucleolus'], correct: [0,1,3], marks: 2 },
          { id: 's2q4', type: 'text', title: 'Explain the function of the cell membrane.', marks: 3 },
        ],
      },
    ],
  },
  {
    id: 'history', slug: 'history',
    name: 'History',
    chapters: [
      {
        id: 'ancient', slug: 'ancient',
        name: 'Ancient Civilizations',
        questions: [
          { id: 'h1q1', type: 'single', title: 'The pyramids are located in', options: ['Greece','Egypt','India','China'], correct: 1, marks: 1 },
          { id: 'h1q2', type: 'single', title: 'Mesopotamia is between which rivers?', options: ['Nile & Amazon','Tigris & Euphrates','Hudson & Thames','Ganga & Yamuna'], correct: 1, marks: 1 },
          { id: 'h1q3', type: 'text', title: 'Describe the significance of the Roman Empire.', marks: 3 },
        ],
      },
      {
        id: 'modern', slug: 'modern',
        name: 'Modern History',
        questions: [
          { id: 'h2q1', type: 'multiple', title: 'Industrial Revolution key inventions', options: ['Steam engine','Smartphone','Spinning jenny','Printing press'], correct: [0,2], marks: 2 },
          { id: 'h2q2', type: 'single', title: 'World War II ended in', options: ['1918','1939','1945','1965'], correct: 2, marks: 1 },
        ],
      },
    ],
  },
  {
    id: 'japanese', slug: 'japanese',
    name: 'Japanese',
    chapters: [
      {
        id: 'hiragana', slug: 'hiragana',
        name: 'Hiragana Basics',
        questions: [
          { id: 'j1q1', type: 'single', title: 'What is the Hiragana for "a"?', options: ['あ','い','う','え'], correct: 0, marks: 1 },
          { id: 'j1q2', type: 'single', title: 'What is the Hiragana for "i"?', options: ['あ','い','う','え'], correct: 1, marks: 1 },
          { id: 'j1q3', type: 'single', title: 'What is the Hiragana for "u"?', options: ['え','お','う','あ'], correct: 2, marks: 1 },
          { id: 'j1q4', type: 'multiple', title: 'Select vowels in Hiragana', options: ['か','さ','い','え'], correct: [2,3], marks: 2 },
          { id: 'j1q5', type: 'text', title: 'Write あいうえお in romaji.', marks: 2 },
        ],
      },
      {
        id: 'vocab-n5', slug: 'vocab-n5',
        name: 'Vocabulary N5',
        questions: [
          { id: 'j2q1', type: 'single', title: '日本語: "water" is', options: ['みず','おちゃ','さけ','みそ'], correct: 0, marks: 1 },
          { id: 'j2q2', type: 'single', title: '日本語: "thank you" is', options: ['こんにちは','ありがとう','さようなら','すみません'], correct: 1, marks: 1 },
          { id: 'j2q3', type: 'multiple', title: 'Select common greetings', options: ['おはよう','こんばんは','ありがとう','テーブル'], correct: [0,1], marks: 2 },
          { id: 'j2q4', type: 'text', title: 'Write a simple self-introduction in Japanese (romaji allowed).', marks: 3 },
        ],
      },
    ],
  },
];

// Normalize helper: lowercase, trim, collapse spaces/dashes, map common typos
const aliasMap = {
  arithmatics: 'arithmetic',
  arithmetics: 'arithmetic',
};

function normalizeKey(key) {
  if (!key) return key;
  const k = String(key).toLowerCase().trim();
  return aliasMap[k] || k;
}

export function getExam(subjectKey, chapterKey) {
  const sk = normalizeKey(subjectKey);
  const ck = normalizeKey(chapterKey);
  const subject = subjects.find((s) => s.id === sk || s.slug === sk);
  if (!subject) return null;
  const chapter = subject.chapters.find((c) => c.id === ck || c.slug === ck);
  if (!chapter) return null;
  return { subject, chapter };
}
