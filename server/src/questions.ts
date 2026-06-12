export const categories = {
  'Basic Python': ['Variables and Data Types', 'Input and Output', 'Operators', 'Conditional Statements', 'Loops'],
  'Intermediate Python': ['Functions', 'Recursion', 'Strings', 'Lists', 'Tuples', 'Dictionaries', 'Sets'],
  'Advanced Python': ['File Handling', 'Exception Handling', 'OOP Concepts', 'Modules and Packages', 'Regular Expressions']
} as const;

const templates = [
  {
    title: 'Sum of Two Numbers',
    statement: 'Read two integers and print their sum.',
    sampleInput: '7 5\n',
    sampleOutput: '12',
    starter: 'a, b = map(int, input().split())\n# print the answer\n',
    cases: [
      ['7 5\n', '12'],
      ['-4 9\n', '5'],
      ['100 250\n', '350']
    ]
  },
  {
    title: 'Largest Element',
    statement: 'Read n followed by n integers and print the largest value.',
    sampleInput: '5\n4 8 1 9 3\n',
    sampleOutput: '9',
    starter: 'n = int(input())\narr = list(map(int, input().split()))\n# print largest value\n',
    cases: [
      ['5\n4 8 1 9 3\n', '9'],
      ['4\n-5 -2 -9 -1\n', '-1'],
      ['1\n42\n', '42']
    ]
  },
  {
    title: 'Palindrome String',
    statement: 'Read a string and print YES if it is a palindrome, otherwise print NO.',
    sampleInput: 'madam\n',
    sampleOutput: 'YES',
    starter: 's = input().strip()\n# print YES or NO\n',
    cases: [
      ['madam\n', 'YES'],
      ['python\n', 'NO'],
      ['level\n', 'YES']
    ]
  },
  {
    title: 'Factorial',
    statement: 'Read a non-negative integer n and print n factorial.',
    sampleInput: '5\n',
    sampleOutput: '120',
    starter: 'n = int(input())\n# compute factorial\n',
    cases: [
      ['5\n', '120'],
      ['0\n', '1'],
      ['7\n', '5040']
    ]
  },
  {
    title: 'Word Frequency',
    statement: 'Read one line of words and print each distinct word with its frequency in sorted order.',
    sampleInput: 'to be or not to be\n',
    sampleOutput: 'be 2\nnot 1\nor 1\nto 2',
    starter: 'words = input().split()\n# print word frequencies in sorted order\n',
    cases: [
      ['to be or not to be\n', 'be 2\nnot 1\nor 1\nto 2'],
      ['a b a c b a\n', 'a 3\nb 2\nc 1'],
      ['python\n', 'python 1']
    ]
  }
];

export function buildQuestionSeed(count = 520) {
  const rows = [];
  const cats = Object.entries(categories);
  const difficulties = ['Easy', 'Medium', 'Hard'] as const;
  for (let i = 0; i < count; i += 1) {
    const [category, topics] = cats[i % cats.length];
    const topic = topics[i % topics.length];
    const template = templates[i % templates.length];
    const difficulty = difficulties[i % difficulties.length];
    const serial = i + 1;
    rows.push({
      title: `${template.title} ${serial}`,
      slug: `${template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${serial}`,
      category,
      topic,
      difficulty,
      statement: `${template.statement}\n\nThis ${difficulty.toLowerCase()} practice problem focuses on ${topic}, a common topic in second-year Indian engineering Python labs.`,
      constraints: '1 <= n <= 10^5 where applicable. Input values fit in signed 32-bit integers.',
      sampleInput: template.sampleInput,
      sampleOutput: template.sampleOutput,
      starterCode: template.starter,
      points: difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30,
      cases: template.cases.map(([input, output], index) => ({ input, output, hidden: index > 0 }))
    });
  }
  return rows;
}
