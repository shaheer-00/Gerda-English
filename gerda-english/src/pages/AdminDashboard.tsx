import { useState } from 'react';
import { Settings, Plus, Upload, BookOpen, Video, Image as ImageIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'rewards'>('quizzes');

  // Quiz Builder State
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    questions: [] as any[],
  });

  // Reward Uploader State
  const [rewardForm, setRewardForm] = useState({
    title: '',
    description: '',
    xpRequired: 500,
    type: 'video',
    file: null as File | null,
  });

  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        {
          id: Date.now(),
          question: '',
          options: ['', '', '', ''],
          correct: 0,
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-cute text-cute-purple-700 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Admin Panel 🛠️
        </h2>
        <p className="text-cute-pink-600">Create quizzes and upload rewards!</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-cute-pink-50'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Create Quiz
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'rewards'
              ? 'bg-gradient-to-r from-cute-pink-400 to-cute-purple-400 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-cute-pink-50'
          }`}
        >
          <Upload className="w-5 h-5" />
          Upload Rewards
        </button>
      </div>

      {/* Quiz Builder */}
      {activeTab === 'quizzes' && (
        <div className="card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Quiz
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Quiz Title (e.g., IELTS Listening Practice)"
              className="input-cute"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            />
            <textarea
              placeholder="Description (e.g., Practice numbers and dates for IELTS)"
              className="input-cute"
              rows={2}
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
            />

            {/* Questions */}
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-cute-purple-700">Questions</h4>
                <button
                  onClick={handleAddQuestion}
                  className="btn-cute btn-secondary text-sm py-2"
                >
                  + Add Question
                </button>
              </div>

              {quizForm.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-cute-pink-50 rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No questions yet. Click "Add Question" to start!</p>
                </div>
              ) : (
                quizForm.questions.map((q: any, index: number) => (
                  <div key={q.id} className="p-4 bg-cute-pink-50 rounded-2xl border-2 border-cute-pink-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 bg-cute-pink-400 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Question text..."
                        className="input-cute flex-1"
                        value={q.question}
                        onChange={(e) => {
                          const newQuestions = [...quizForm.questions];
                          newQuestions[index].question = e.target.value;
                          setQuizForm({ ...quizForm, questions: newQuestions });
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 ml-11">
                      {q.options.map((opt: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correct === optIndex}
                            onChange={() => {
                              const newQuestions = [...quizForm.questions];
                              newQuestions[index].correct = optIndex;
                              setQuizForm({ ...quizForm, questions: newQuestions });
                            }}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            className="input-cute flex-1"
                            value={opt}
                            onChange={(e) => {
                              const newQuestions = [...quizForm.questions];
                              newQuestions[index].options[optIndex] = e.target.value;
                              setQuizForm({ ...quizForm, questions: newQuestions });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Save Button */}
            <button className="btn-cute btn-primary w-full mt-6">
              Save Quiz ✨
            </button>
          </div>
        </div>
      )}

      {/* Reward Uploader */}
      {activeTab === 'rewards' && (
        <div className="card-cute">
          <h3 className="text-xl font-bold text-cute-purple-700 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Reward
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Reward Title (e.g., Special Message #1)"
              className="input-cute"
              value={rewardForm.title}
              onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
            />

            <textarea
              placeholder="Description (e.g., A sweet video message to motivate you!)"
              className="input-cute"
              rows={2}
              value={rewardForm.description}
              onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cute-purple-700 mb-2">
                  XP Required
                </label>
                <input
                  type="number"
                  className="input-cute"
                  value={rewardForm.xpRequired}
                  onChange={(e) => setRewardForm({ ...rewardForm, xpRequired: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cute-purple-700 mb-2">
                  Type
                </label>
                <select
                  className="input-cute"
                  value={rewardForm.type}
                  onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })}
                >
                  <option value="video">🎥 Video</option>
                  <option value="image">🖼️ Image Gallery</option>
                  <option value="text">💝 Text Message</option>
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-cute-pink-300 rounded-2xl p-8 text-center">
              {rewardForm.file ? (
                <div className="text-cute-purple-700">
                  <p className="font-bold">{rewardForm.file.name}</p>
                  <p className="text-sm">{(rewardForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  {rewardForm.type === 'video' ? (
                    <Video className="w-12 h-12 mx-auto mb-3 text-cute-pink-400" />
                  ) : (
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-cute-pink-400" />
                  )}
                  <p className="text-cute-purple-700 font-semibold mb-2">
                    Click to upload {rewardForm.type}
                  </p>
                  <p className="text-sm text-gray-500">MP4, JPG, PNG supported</p>
                </>
              )}
              <input
                type="file"
                accept={rewardForm.type === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setRewardForm({ ...rewardForm, file: e.target.files[0] });
                  }
                }}
              />
              <label htmlFor="file-upload" className="btn-cute btn-secondary mt-4 inline-block cursor-pointer">
                Choose File
              </label>
            </div>

            {/* Save Button */}
            <button className="btn-cute btn-primary w-full">
              Upload Reward 🎁
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card-cute bg-gradient-to-r from-cute-mint-50 to-cute-blue-50">
        <h4 className="font-bold text-cute-purple-700 mb-3">💡 Admin Tips</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Create short quizzes (3-5 questions) for daily practice</li>
          <li>• Upload personal videos/messages as rewards to keep her motivated</li>
          <li>• Set reasonable XP requirements based on her progress</li>
          <li>• Update mistakes bank regularly from her quiz results</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
