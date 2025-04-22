import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import { FaTrash } from "react-icons/fa";

const UpdateQuiz = () => {
    const { URLAPI, getTokenAdmin } = useContext(DataContext);
    const { quizId ,groupId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState({
        title: "",
        description: "",
        duration: "",
        questions: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`${URLAPI}/api/quizzes/${quizId}`, {
                    headers: {
                        Authorization: `${getTokenAdmin}`,
                    },
                });
                setQuiz(response.data);
            } catch (error) {
                console.error("Error fetching quiz:", error);
                toast.error(error.response?.data?.message || "Error fetching quiz");
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId, getTokenAdmin, URLAPI]);

    const handleQuestionChange = (questionIndex, field, value) => {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            [field]: value
        };
        setQuiz({ ...quiz, questions: updatedQuestions });
    };

    const handleAnswerChange = (questionIndex, answerIndex, field, value) => {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[questionIndex].answers[answerIndex] = {
            ...updatedQuestions[questionIndex].answers[answerIndex],
            [field]: value
        };
        setQuiz({ ...quiz, questions: updatedQuestions });
    };

    const handleDeleteQuestion = (questionIndex) => {
        const updatedQuestions = quiz.questions.filter((_, index) => index !== questionIndex);
        setQuiz({ ...quiz, questions: updatedQuestions });
        toast.success("delete Question Success");
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            question: "",
            answers: [
                { text: "", correct: false },
                { text: "", correct: false },
                { text: "", correct: false },
                { text: "", correct: false }
            ]
        };
        setQuiz({
            ...quiz,
            questions: [...quiz.questions, newQuestion]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${URLAPI}/api/quizzes/${quizId}`,
                quiz,
                {
                    headers: {
                        Authorization: `${getTokenAdmin}`,
                    },
                }
            );
            toast.success("success Update Quiz");
            if (window.location.pathname.includes("/admin")) {
                navigate(`/admin/${groupId}/quiz`);
            } else {
                window.history.back();
            }
        } catch (error) {
            console.error("Error updating quiz:", error);
            toast.error(error.response?.data?.message || "Error Update Quiz");
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="mb-4 text-center">Update Quiz</h2>
                            <form onSubmit={handleSubmit} className="w-100">
                                <div className="row">
                                    <div className="col-12 col-lg-6">
                                        <label htmlFor="title" className="form-label fw-bold mb-2">Title    </label>
                                        <input type="text" className="form-control" value={quiz.lectureId.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
                                    </div>
                                    <div className="col-12 col-lg-6">
                                        <label htmlFor="description" className="form-label fw-bold mb-2">Description</label>
                                        <input type="text" className="form-control" value={quiz.lectureId.description} onChange={(e) => setQuiz({ ...quiz, description: e.target.value })} />
                                    </div>
                                    {/* <div>
                                        <label htmlFor="duration" className="form-label">Duration</label>
                                        <input type="number" className="form-control" value={quiz.duration} onChange={(e) => setQuiz({ ...quiz, duration: e.target.value })} />
                                    </div> */}
                                </div>
                                <div className="mb-4">
                                    <h3 className="mb-3">Questions</h3>
                                    <div className="row g-4">
                                        {quiz.questions.map((question, questionIndex) => (
                                            <div key={questionIndex} className="col-12 col-md-6">
                                                <div className="card h-100">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <label className="form-label fw-bold mb-0">Question {questionIndex + 1}</label>
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDeleteQuestion(questionIndex)}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="form-control mb-3"
                                                            value={question.question}
                                                            onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
                                                            required
                                                        />

                                                        <div className="mb-3">
                                                            <label className="form-label fw-bold">Answers</label>
                                                            {question.answers.map((answer, answerIndex) => (
                                                                <div key={answerIndex} className="input-group mb-2">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={answer.text}
                                                                        onChange={(e) => handleAnswerChange(questionIndex, answerIndex, "text", e.target.value)}
                                                                        required
                                                                    />
                                                                    <div className="input-group-text">
                                                                        <input
                                                                            type="radio"
                                                                            name={`correct-${questionIndex}`}
                                                                            checked={answer.correct}
                                                                            onChange={() => {
                                                                                const updatedAnswers = question.answers.map((a, i) => ({
                                                                                    ...a,
                                                                                    correct: i === answerIndex
                                                                                }));
                                                                                handleQuestionChange(questionIndex, "answers", updatedAnswers);
                                                                            }}
                                                                            className="form-check-input mt-0"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-success px-4"
                                        onClick={handleAddQuestion}
                                    >
                                        Add Question
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4">
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary px-4"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateQuiz;
