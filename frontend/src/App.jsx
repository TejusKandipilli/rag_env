import React, { useState } from 'react';
import { Send, BookOpen, Loader2, MessageCircle } from 'lucide-react';

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newQA = { question: question.trim(), answer: data.answer };
      
      setHistory(prev => [newQA, ...prev]);
      setAnswer(data.answer);
      setQuestion('');
    } catch (err) {
      setError('Failed to get answer. Please check if the backend is running on localhost:8000');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleQuestion = (exampleQ) => {
    setQuestion(exampleQ);
  };

const exampleQuestions = [
  "What defines a foundation model and how does it differ from traditional ML models?",
  "What are the main capabilities and limitations of foundation models?",
  "How do scaling laws apply to foundation models?",
  "What types of datasets are commonly used for training foundation models?",
  "How does data quality impact the performance of foundation models?",
  "What techniques are used for fine-tuning foundation models on domain-specific data?",
  "What is the role of transformers in foundation models?",
  "How do attention mechanisms work in these architectures?",
  "What are the main challenges of deploying large foundation models in production?",
  "How can model inference be optimized for latency and cost?",
  "What are common strategies for serving models at scale?",
  "How do you evaluate the performance of foundation models beyond accuracy?",
  "What are the key metrics for monitoring model performance post-deployment?",
  "How can drift detection be implemented for models in production?",
  "What are the ethical risks associated with foundation models?",
  "How can bias be detected and mitigated in these models?",
  "What governance frameworks are proposed for responsible AI deployment?"
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">AI Study Assistant</h1>
          </div>
          <p className="text-gray-600 text-lg">Ask questions about Computer Science  and get answers from the textbook</p>
        </div>

        {/* Question Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <div className="relative">
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about AI Engineering..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={loading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Getting Answer...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Ask Question
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Example Questions */}
        {history.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Try these example questions:</h3>
            <div className="grid gap-2">
              {exampleQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleQuestion(q)}
                  className="text-left p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <span className="text-indigo-600 font-medium">"{q}"</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Answer */}
        {answer && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Answer</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{answer}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question History */}
        {history.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Questions</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.slice(1).map((qa, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-indigo-600">Q: </span>
                    <span className="text-gray-800">{qa.question}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-600">A: </span>
                    <span className="text-gray-700 text-sm">{qa.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by RAG (Retrieval-Augmented Generation) • AI Engineering Textbook</p>
        </div>
      </div>
    </div>
  );
}