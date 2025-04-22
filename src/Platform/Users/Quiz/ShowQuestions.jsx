import React, { useContext } from "react";
import { QuizContext } from "./QuizProvider";

function ShowQuestions() {
  const {
    quiz,
    currentQuestion,
    userAnswers,
    handleAnswer,
    handleNextQuestion,
    handlePrevQuestion,
  } = useContext(QuizContext);

  if (!quiz) return null;

  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="card shadow-lg p-4 mt-4 mb-3 text-center w-80 ms-2 me-2">
      <div className="progress mb-3" style={{ height: "10px" }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      <h2 className="fw-bold text-primary">
        Question {currentQuestion + 1} of {quiz.questions.length}
      </h2>
      <h3 className="mt-4">{currentQuestionData.question}</h3>

      <div className="container mt-3">
        <div className="row g-2">
          {currentQuestionData.answers.map((answer, index) => (
            <div key={answer._id} className="col-12 col-sm-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={`question${currentQuestion}`}
                  id={`answer${index}`}
                  value={index}
                  checked={userAnswers[currentQuestion] === index}
                  onChange={() => handleAnswer(index)}
                  style={{ display: 'none' }}
                />
                <label
                  className={`form-check-label w-100 p-3 fw-bold border rounded-3 ${
                    userAnswers[currentQuestion] === index
                      ? 'border-primary bg-primary text-white'
                      : 'border-secondary'
                  }`}
                  htmlFor={`answer${index}`}
                  style={{ cursor: 'pointer' }}
                >
                  {index + 1} - {answer.text}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 d-flex justify-content-between">
        <button
          className="btn btn-secondary mx-2"
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button
          className="btn btn-success mx-2"
          onClick={handleNextQuestion}
          disabled={userAnswers[currentQuestion] === null}
        >
          {currentQuestion === quiz.questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default ShowQuestions;
