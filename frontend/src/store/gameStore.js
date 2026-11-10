import { create } from 'zustand'

const useGameStore = create((set) => ({
  // Current quiz state
  currentQuiz: null,
  currentAttemptId: null,
  answers: {},
  currentQuestionIndex: 0,
  timeLeft: 0,
  quizResult: null,

  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz, answers: {}, currentQuestionIndex: 0 }),
  setAttemptId: (id) => set({ currentAttemptId: id }),
  setAnswer: (questionId, optionId, timeTaken) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: { optionId, timeTaken } } })),
  setQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setQuizResult: (result) => set({ quizResult: result }),
  resetQuiz: () =>
    set({
      currentQuiz: null,
      currentAttemptId: null,
      answers: {},
      currentQuestionIndex: 0,
      timeLeft: 0,
      quizResult: null,
    }),

  // Notifications / XP popup
  xpPopup: null,
  achievementPopup: null,
  setXpPopup: (data) => set({ xpPopup: data }),
  setAchievementPopup: (data) => set({ achievementPopup: data }),
  clearPopups: () => set({ xpPopup: null, achievementPopup: null }),
}))

export default useGameStore

