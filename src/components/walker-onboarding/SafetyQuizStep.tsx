import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FaDog, FaCheck, FaTimes } from 'react-icons/fa';

interface SafetyQuizStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const quizQuestions = [
  {
    id: 'stress-signs',
    question: 'Which of these are signs of stress in dogs?',
    options: [
      'Yawning, nose-licking, and shaking',
      'Wagging tail and panting',
      'Sitting and staying calm',
      'Playing with toys'
    ],
    correct: 0,
    explanation: 'Yawning, nose-licking, and shaking are all stress signals that dogs use to communicate discomfort.'
  },
  {
    id: 'threatening-behavior',
    question: 'What should you look for to identify a dog feeling threatened?',
    options: [
      'Sleeping peacefully',
      'Barking with hair standing up',
      'Eating treats',
      'Rolling on their back'
    ],
    correct: 1,
    explanation: 'Hair standing up while barking indicates the dog feels threatened and may react defensively.'
  },
  {
    id: 'whale-eye',
    question: 'What does "whale eye" mean in dog body language?',
    options: [
      'The dog is happy and playful',
      'The dog is showing the whites of their eyes when they want space',
      'The dog is sleepy',
      'The dog wants food'
    ],
    correct: 1,
    explanation: 'Whale eye occurs when dogs show the whites of their eyes, signaling they need distance and space.'
  },
  {
    id: 'dog-scuffle',
    question: 'How should you interrupt a dog scuffle?',
    options: [
      'Jump in between the dogs',
      'Grab the dogs by their collars',
      'Make a loud noise or put a barrier between the dogs',
      'Ignore it and let them work it out'
    ],
    correct: 2,
    explanation: 'Making loud noises or using barriers is the safest way to interrupt dog conflicts without putting yourself at risk.'
  },
  {
    id: 'cat-behavior',
    question: 'If you encounter a cat that is crouching with fur standing up, you should:',
    options: [
      'Pick them up immediately',
      'Give them space and don\'t crowd them',
      'Force them to move',
      'Make loud noises'
    ],
    correct: 1,
    explanation: 'A crouching cat with raised fur is defensive. Give them space and avoid crowding or forcing interaction.'
  },
  {
    id: 'emergency-contact',
    question: 'In case of a pet emergency during a walk, your first action should be:',
    options: [
      'Take the pet home immediately',
      'Contact the owner and emergency services if needed',
      'Continue the walk as normal',
      'Leave the pet and go home'
    ],
    correct: 1,
    explanation: 'Always contact the owner first and emergency services if the situation is serious. Owner communication is crucial.'
  }
];

export const SafetyQuizStep = ({ data, updateData, onNext, onPrev }: SafetyQuizStepProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const questionId = quizQuestions[currentQuestion].id;
    const newAnswers = { ...answers, [questionId]: answerIndex };
    setAnswers(newAnswers);
    updateData({ quizAnswers: newAnswers });
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const getScore = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    return correct;
  };

  const isPassing = () => getScore() >= 5; // Need 5/6 to pass

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPassing()) {
      onNext();
    }
  };

  const retakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowExplanation(false);
    setQuizCompleted(false);
    updateData({ quizAnswers: {} });
  };

  if (!quizCompleted) {
    const question = quizQuestions[currentQuestion];
    const selectedAnswer = answers[question.id];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Safety Knowledge Quiz</h2>
          <p className="text-gray-600">
            Test your knowledge of dog and cat body language to ensure safe pet care
          </p>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
          </div>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {question.question}
              </h3>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== undefined}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === undefined
                        ? 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        : selectedAnswer === index
                          ? index === question.correct
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-red-500 bg-red-50 text-red-800'
                          : index === question.correct
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {selectedAnswer !== undefined && (
                        <div>
                          {index === question.correct ? (
                            <FaCheck className="h-5 w-5 text-green-600" />
                          ) : selectedAnswer === index ? (
                            <FaTimes className="h-5 w-5 text-red-600" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  selectedAnswer === question.correct
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {selectedAnswer === question.correct ? (
                    <FaCheck className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <FaTimes className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-medium mb-1 ${
                      selectedAnswer === question.correct ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {selectedAnswer === question.correct ? 'Correct!' : 'Not quite right'}
                    </h4>
                    <p className={`text-sm ${
                      selectedAnswer === question.correct ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              {currentQuestion === 0 ? (
                <Button type="button" variant="outline" onClick={onPrev}>
                  ← Back
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setCurrentQuestion(currentQuestion - 1);
                    setShowExplanation(false);
                  }}
                >
                  ← Previous Question
                </Button>
              )}
              
              {showExplanation && (
                <Button 
                  onClick={nextQuestion}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Quiz Results
  const score = getScore();
  const passing = isPassing();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h2>
      </div>

      <Card className="p-8 text-center">
        <div className="space-y-6">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
            passing ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passing ? (
              <FaCheck className="h-12 w-12 text-green-600" />
            ) : (
              <FaTimes className="h-12 w-12 text-red-600" />
            )}
          </div>

          <div>
            <h3 className={`text-2xl font-bold mb-2 ${
              passing ? 'text-green-800' : 'text-red-800'
            }`}>
              {passing ? 'Congratulations!' : 'Not Quite There'}
            </h3>
            <p className="text-lg text-gray-600 mb-4">
              You scored {score} out of {quizQuestions.length}
            </p>
            <p className="text-sm text-gray-500">
              {passing 
                ? 'You passed! You have a good understanding of pet safety and body language.'
                : 'You need at least 5 correct answers to pass. Review the information and try again.'
              }
            </p>
          </div>

          {!passing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-3">Want to learn more?</h4>
              <p className="text-sm text-blue-700 mb-4">
                Review our pet care guides to better understand animal behavior and safety protocols.
              </p>
              <Button
                type="button"
                onClick={retakeQuiz}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Retake Quiz
              </Button>
            </div>
          )}

          {passing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <FaDog className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-green-800 mb-2">Safety Certified! 🎉</h4>
              <p className="text-sm text-green-700">
                You're ready to provide safe, professional pet care services through PupRoute.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onPrev}>
                ← Back
              </Button>
              {passing && (
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Application →
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>
    </motion.div>
  );
};
