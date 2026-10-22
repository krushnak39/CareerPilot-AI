
import { useMemo, useState } from "react";
import {
  BrainCircuit,
  Code2,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  ListChecks,
  Lightbulb,
} from "lucide-react";

const QUESTION_BANK = [
  {
    category: "Technical",
    question: "What is the difference between let, const and var in JavaScript?",
    answer:
      "var is function-scoped and can be redeclared. let is block-scoped and can be reassigned, but cannot be redeclared in the same scope. const is block-scoped and cannot be reassigned after initialization. Use const by default and let when reassignment is needed.",
    tip: "Explain scope, redeclaration and reassignment separately.",
  },
  {
    category: "Technical",
    question: "What is the difference between SQL and NoSQL databases?",
    answer:
      "SQL databases store structured data in tables and commonly use a predefined schema. NoSQL databases support models such as documents, key-value pairs and graphs, often allowing more flexible data structures. The right choice depends on the data, relationships, consistency and scalability requirements.",
    tip: "Give one example of each: PostgreSQL for SQL and MongoDB for document-based NoSQL.",
  },
  {
    category: "Technical",
    question: "Explain the four pillars of Object-Oriented Programming.",
    answer:
      "The four pillars are encapsulation, abstraction, inheritance and polymorphism. Encapsulation bundles data and methods together. Abstraction hides implementation details. Inheritance allows a class to reuse or extend another class. Polymorphism allows the same interface or method name to behave differently in different contexts.",
    tip: "Give a short real-world or code example for each pillar.",
  },
  {
    category: "Technical",
    question: "What is the difference between authentication and authorization?",
    answer:
      "Authentication verifies who a user is, such as by checking a password or token. Authorization determines what that authenticated user is allowed to access or do. Authentication comes first; authorization checks permissions afterward.",
    tip: "Remember: identity versus permissions.",
  },
  {
    category: "Technical",
    question: "What is an API, and what is REST?",
    answer:
      "An API defines how software components communicate. REST is an architectural style for designing web APIs around resources, commonly using HTTP methods such as GET, POST, PUT, PATCH and DELETE. REST APIs commonly exchange JSON data and use HTTP status codes to communicate results.",
    tip: "Mention a simple resource such as /api/interviews.",
  },
  {
    category: "Technical",
    question: "What is the difference between a process and a thread?",
    answer:
      "A process is an executing program with its own memory space and resources. A thread is an execution unit within a process. Threads in the same process can share memory and resources, while separate processes are generally more isolated.",
    tip: "Compare memory sharing and isolation.",
  },
  {
    category: "Technical",
    question: "What is database normalization?",
    answer:
      "Normalization organizes relational database tables to reduce unnecessary duplication and prevent insertion, update and deletion anomalies. Common normal forms include 1NF, 2NF and 3NF, each applying additional rules to the structure of data and dependencies.",
    tip: "Explain why normalization matters before listing normal forms.",
  },
  {
    category: "Coding",
    question: "How would you reverse a string in Python?",
    answer:
      "A simple Python solution is: text = 'career'; reversed_text = text[::-1]. The slice notation uses a step of -1 to read the string backward. Another approach is ''.join(reversed(text)).",
    tip: "Be ready to explain slicing and its step argument.",
  },
  {
    category: "Coding",
    question: "How can you check whether a string is a palindrome?",
    answer:
      "One approach is to normalize the string if required, then compare it with its reverse. For example: text = 'level'; is_palindrome = text == text[::-1]. This returns True for 'level'. If the problem ignores spaces and capitalization, normalize those first.",
    tip: "Clarify whether case, spaces and punctuation matter.",
  },
  {
    category: "Coding",
    question: "What is the time complexity of binary search?",
    answer:
      "Binary search takes O(log n) time because it halves the remaining search space after each comparison. It requires sorted data. Its iterative version uses O(1) auxiliary space; a recursive implementation typically uses O(log n) call-stack space.",
    tip: "Explain why the input must be sorted.",
  },
  {
    category: "Coding",
    question: "How do you find the largest element in an array?",
    answer:
      "Initialize a variable with the first element, then traverse the remaining elements. Whenever an element is larger than the current maximum, update the maximum. This takes O(n) time and O(1) extra space for a non-empty array.",
    tip: "Handle an empty array separately if the problem allows it.",
  },
  {
    category: "Coding",
    question: "What is the difference between a stack and a queue?",
    answer:
      "A stack follows LIFO: Last In, First Out. A queue follows FIFO: First In, First Out. Stacks are useful for undo operations and depth-first search. Queues are useful for scheduling and breadth-first search.",
    tip: "Draw a small example showing insertion and removal.",
  },
  {
    category: "Coding",
    question: "What is recursion? What is a base case?",
    answer:
      "Recursion is a technique in which a function calls itself to solve smaller instances of a problem. A base case stops the recursive calls. Without a reachable base case, recursion may continue until a stack overflow or recursion limit is reached.",
    tip: "Use factorial or countdown as a simple example.",
  },
  {
    category: "Coding",
    question: "How would you detect duplicates in a list?",
    answer:
      "One approach is to compare the length of the list with the length of its set: has_duplicates = len(items) != len(set(items)). This usually takes O(n) time and O(n) extra space. If original order or frequency matters, another approach may be needed.",
    tip: "Mention the trade-off between time and extra memory.",
  },
  {
    category: "HR",
    question: "Tell me about yourself.",
    answer:
      "A good answer covers your current education or role, relevant technical skills, one or two projects or achievements, and the kind of opportunity you are seeking. Keep it structured and relevant to the job. Avoid repeating your entire resume.",
    tip: "Use your own real experience; aim for roughly 60–90 seconds.",
  },
  {
    category: "HR",
    question: "What are your strengths?",
    answer:
      "Choose two or three strengths relevant to the role and support them with genuine examples. For instance, if problem-solving is a strength, explain a specific project issue you analyzed and how you resolved it. Avoid listing qualities without evidence.",
    tip: "Use a real example rather than memorizing a generic answer.",
  },
  {
    category: "HR",
    question: "What is one weakness you are working on?",
    answer:
      "Choose a genuine, manageable area for improvement and explain what you are doing about it. For example, you might be improving your presentation skills by practicing short technical explanations and asking for feedback. Avoid fake weaknesses or claims that you have no weaknesses.",
    tip: "Show awareness, action and progress.",
  },
  {
    category: "HR",
    question: "Why should we hire you?",
    answer:
      "Connect your relevant skills, project experience, learning ability and work habits to the role's requirements. Support your claims with evidence, and explain how you could contribute to the team. Keep the answer specific to the company and position.",
    tip: "Match your actual strengths to the job description.",
  },
  {
    category: "HR",
    question: "Describe a challenge you faced and how you handled it.",
    answer:
      "Use the STAR structure: Situation, Task, Action and Result. Describe the context, your responsibility, the steps you personally took and the outcome. Be honest about the result and what you learned.",
    tip: "Prepare one real example from a project, internship or college activity.",
  },
  {
    category: "HR",
    question: "Where do you see yourself in five years?",
    answer:
      "Describe a realistic direction for professional growth, such as becoming stronger in your technical area, taking ownership of larger projects and contributing more independently. Connect your goals to learning and the type of role you are applying for.",
    tip: "Focus on growth relevant to the role rather than an overly rigid plan.",
  },
  {
    category: "HR",
    question: "Tell me about a time you worked in a team.",
    answer:
      "Describe the team's goal, your specific responsibility, how you communicated or handled a disagreement, and the outcome. Emphasize your own contribution while acknowledging the team's work.",
    tip: "STAR works well for this question too.",
  },
];

const CATEGORIES = [
  { name: "All", icon: ListChecks },
  { name: "Technical", icon: BrainCircuit },
  { name: "Coding", icon: Code2 },
  { name: "HR", icon: Users },
];

function InterviewPractice() {
  const [category, setCategory] = useState("All");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const questions = useMemo(
    () =>
      QUESTION_BANK.filter(
        (item) => category === "All" || item.category === category
      ),
    [category]
  );

  const currentQuestion = questions[questionIndex];
  const progress = questions.length
    ? ((questionIndex + 1) / questions.length) * 100
    : 0;

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory);
    setQuestionIndex(0);
    setShowAnswer(false);
  };

  const goToQuestion = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= questions.length) return;

    setQuestionIndex(nextIndex);
    setShowAnswer(false);
  };

  const resetPractice = () => {
    setQuestionIndex(0);
    setShowAnswer(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Interview Practice
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Practice common interview questions and review suggested answers.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400">
          <BrainCircuit size={16} />
          {QUESTION_BANK.length} Questions
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Choose a category
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Switch categories to focus on a particular interview round.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => changeCategory(name)}
              aria-pressed={category === name}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${
                category === name
                  ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
              }`}
            >
              <Icon size={17} />
              {name}
            </button>
          ))}
        </div>
      </section>

      {currentQuestion && (
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                {currentQuestion.category}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Question {questionIndex + 1} of {questions.length}
              </span>
            </div>

            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
              role="progressbar"
              aria-label="Question progress"
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-valuenow={questionIndex + 1}
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Interview question
            </p>

            <h2 className="mt-3 break-words text-xl font-black leading-relaxed text-slate-900 dark:text-white sm:text-2xl">
              {currentQuestion.question}
            </h2>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAnswer((visible) => !visible)}
                aria-expanded={showAnswer}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto"
              >
                {showAnswer ? <EyeOff size={17} /> : <Eye size={17} />}
                {showAnswer ? "Hide Answer" : "Show Answer"}
              </button>
            </div>

            {showAnswer && (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    <Lightbulb size={17} />
                    Suggested answer
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {currentQuestion.answer}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    Practice tip
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {currentQuestion.tip}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <button
              type="button"
              onClick={() => goToQuestion(questionIndex - 1)}
              disabled={questionIndex === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <button
              type="button"
              onClick={resetPractice}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <RotateCcw size={16} />
              Start Over
            </button>

            <button
              type="button"
              onClick={() => goToQuestion(questionIndex + 1)}
              disabled={questionIndex === questions.length - 1}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      )}

      <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
        Tip: Try answering aloud before revealing the suggested answer. Use it as a
        guide and adapt it to your own experience.
      </p>
    </div>
  );
}

export default InterviewPractice;
