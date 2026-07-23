import { useState } from 'react';
import { Settings, Plus, Upload, BookOpen, Video, Image as ImageIcon, XCircle } from 'lucide-react';
import { createQuiz, createReward, addMistake } from '../lib/db';
import { supabase } from '../lib/supabase';
import { QuizQuestion, Mistake } from '../lib/supabase';

interface BuilderQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'rewards' | 'mistakes'>('quizzes');

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    xpReward: 50,
    questions: [] as BuilderQuestion[],
  });
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizMessage, setQuizMessage] = useState('');

  const [rewardForm, setRewardForm] = useState<{
    title: string;
    description: string;
    xpRequired: number;
    type: 'video' | 'image';
    file: File | null;
  }>({
    title: '',
    description: '',
    xpRequired: 500,
    type: 'video',
    file: null,
  });
  const [uploadingReward, setUploadingReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');

  const [mistakeForm, setMistakeForm] = useState({
    original_text: '',
    corrected_text: '',
    error_type: 'grammar' as Mistake['error_type'],
    explanation: '',
  });
  const [savingMistake, setSavingMistake] = useState(false);
  const [mistakeMessage, setMistakeMessage] = useState('');

  const handleAddQuestion = () => {
    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        { id: Date.now(), question: '', options: ['', '', '', ''], correct: 0 },
      ],
    });
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title || quizForm.questions.length === 0 || savingQuiz) return;
    setSavingQuiz(true);
    setQuizMessage('');
    try {
      const questions: QuizQuestion[] = quizForm.questions.map((q) => ({
        id: String(q.id),
        quiz_id: '',
        type: 'multiple_choice',
        question_text: q.question,
        options: q.options,
        correct_answer: q.options[q.correct],
      }));
      await createQuiz({
        title: quizForm.title,
        description: quizForm.description,
        questions,
        xp_reward: quizForm.xpReward,
      });
      setQuizForm({ title: '', description: '', xpReward: 50, questions: [] });
      setQuizMessage('Quiz saved! ✨');
    } catch (err) {
      console.error('Failed to save quiz:', err);
      setQuizMessage('Failed to save quiz — check the console.');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleUploadReward = async () => {
    if (!rewardForm.title || !rewardForm.file || uploadingReward) return;
    setUploadingReward(true);
    setRewardMessage('');
    try {
      const fileExt = rewardForm.file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('rewards')
        .upload(filePath, rewardForm.file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('rewards').getPublicUrl(filePath);

      await createReward({
        title: rewardForm.title,
        description: rewardForm.description,
        media_url: urlData.publicUrl,
        media_type: rewardForm.type,
        xp_required: rewardForm.xpRequired,
      });

      setRewardForm({ title: '', description: '', xpRequired: 500, type: 'video', file: null });
      setRewardMessage('Reward uploaded! 🎁');
    } catch (err) {
      console.error('Failed to upload reward:', err);
      setRewardMessage('Upload failed — check the console.');
    } finally {
      setUploadingReward(false);
    }
  };

  const handleAddMistake = async () => {
    if (!mistakeForm.original_text || !mistakeForm.corrected_text || savingMistake) return;
    setSavingMistake(true);
    setMistakeMessage('');
    try {
      await addMistake(mistakeForm);
      setMistakeForm({ original_text: '', corrected_text: '', error_type: 'grammar', explanation: '' });
      setMistakeMessage('Mistake added! 📚');
    } catch (err) {
      console.error('Failed to add mistake:', err);
      setMistakeMessage('Failed to add mistake — check the console.');
    } finally {
      setSavingMistake(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-warm-brown-800 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Admin Panel 🛠️
        </h2>
        <p className="text-warm-terracotta-600">Create quizzes and upload rewards!</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'quizzes'
              ? 'bg-warm-terracotta-500 text-white shadow-sm'
              : 'bg-white text-warm-brown-600 hover:bg-warm-cream-100 border border-warm-tan-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Create Quiz
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'rewards'
              ? 'bg-warm-terracotta-500 text-white shadow-sm'
              : 'bg-white text-warm-brown-600 hover:bg-warm-cream-100 border border-warm-tan-200'
          }`}
        >
          <Upload className="w-5 h-5" />
          Upload Rewards
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'mistakes'
              ? 'bg-warm-terracotta-500 text-white shadow-sm'
              : 'bg-white text-warm-brown-600 hover:bg-warm-cream-100 border border-warm-tan-200'
          }`}
        >
          <XCircle className="w-5 h-5" />
          Add Mistake
        </button>
      </div>

      {activeTab === 'quizzes' && (
        <div className="card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Quiz
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Quiz Title (e.g., IELTS Listening Practice)"
              className="input-warm"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
            />
            <textarea
              placeholder="Description (e.g., Practice numbers and dates for IELTS)"
              className="input-warm"
              rows={2}
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-warm-brown-700 mb-2">XP Reward</label>
              <input
                type="number"
                className="input-warm"
                value={quizForm.xpReward}
                onChange={(e) => setQuizForm({ ...quizForm, xpReward: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-warm-brown-800">Questions</h4>
                <button onClick={handleAddQuestion} className="btn-warm btn-warm-secondary text-sm py-2">
                  + Add Question
                </button>
              </div>

              {quizForm.questions.length === 0 ? (
                <div className="text-center py-8 text-warm-brown-400 bg-warm-cream-100 rounded-2xl">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No questions yet. Click "Add Question" to start!</p>
                </div>
              ) : (
                quizForm.questions.map((q, index) => (
                  <div key={q.id} className="p-4 bg-warm-cream-100 rounded-2xl border border-warm-tan-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 bg-warm-terracotta-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Question text..."
                        className="input-warm flex-1"
                        value={q.question}
                        onChange={(e) => {
                          const newQuestions = [...quizForm.questions];
                          newQuestions[index] = { ...newQuestions[index], question: e.target.value };
                          setQuizForm({ ...quizForm, questions: newQuestions });
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 ml-11">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correct === optIndex}
                            onChange={() => {
                              const newQuestions = [...quizForm.questions];
                              newQuestions[index] = { ...newQuestions[index], correct: optIndex };
                              setQuizForm({ ...quizForm, questions: newQuestions });
                            }}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            className="input-warm flex-1"
                            value={opt}
                            onChange={(e) => {
                              const newQuestions = [...quizForm.questions];
                              const newOptions = [...newQuestions[index].options];
                              newOptions[optIndex] = e.target.value;
                              newQuestions[index] = { ...newQuestions[index], options: newOptions };
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

            {quizMessage && <p className="text-sm text-warm-terracotta-600">{quizMessage}</p>}
            <button
              onClick={handleSaveQuiz}
              disabled={savingQuiz}
              className="btn-warm btn-warm-primary w-full mt-6 disabled:opacity-50"
            >
              {savingQuiz ? 'Saving...' : 'Save Quiz ✨'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload New Reward
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Reward Title (e.g., Special Message #1)"
              className="input-warm"
              value={rewardForm.title}
              onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
            />

            <textarea
              placeholder="Description (e.g., A sweet video message to motivate you!)"
              className="input-warm"
              rows={2}
              value={rewardForm.description}
              onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-warm-brown-700 mb-2">XP Required</label>
                <input
                  type="number"
                  className="input-warm"
                  value={rewardForm.xpRequired}
                  onChange={(e) => setRewardForm({ ...rewardForm, xpRequired: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-brown-700 mb-2">Type</label>
                <select
                  className="input-warm"
                  value={rewardForm.type}
                  onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value as 'video' | 'image' })}
                >
                  <option value="video">🎥 Video</option>
                  <option value="image">🖼️ Image</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-warm-tan-300 rounded-2xl p-8 text-center">
              {rewardForm.file ? (
                <div className="text-warm-brown-700">
                  <p className="font-bold">{rewardForm.file.name}</p>
                  <p className="text-sm">{(rewardForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  {rewardForm.type === 'video' ? (
                    <Video className="w-12 h-12 mx-auto mb-3 text-warm-terracotta-400" />
                  ) : (
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-warm-terracotta-400" />
                  )}
                  <p className="text-warm-brown-700 font-semibold mb-2">Click to upload {rewardForm.type}</p>
                  <p className="text-sm text-warm-brown-400">MP4, JPG, PNG supported</p>
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
              <label htmlFor="file-upload" className="btn-warm btn-warm-secondary mt-4 inline-block cursor-pointer">
                Choose File
              </label>
            </div>

            {rewardMessage && <p className="text-sm text-warm-terracotta-600">{rewardMessage}</p>}
            <button
              onClick={handleUploadReward}
              disabled={uploadingReward}
              className="btn-warm btn-warm-primary w-full disabled:opacity-50"
            >
              {uploadingReward ? 'Uploading...' : 'Upload Reward 🎁'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'mistakes' && (
        <div className="card-warm">
          <h3 className="text-xl font-bold text-warm-brown-800 mb-6 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Add a Mistake
          </h3>

          <div className="space-y-4">
            <textarea
              placeholder="What she wrote/said (original)"
              className="input-warm"
              rows={2}
              value={mistakeForm.original_text}
              onChange={(e) => setMistakeForm({ ...mistakeForm, original_text: e.target.value })}
            />
            <textarea
              placeholder="Correct version"
              className="input-warm"
              rows={2}
              value={mistakeForm.corrected_text}
              onChange={(e) => setMistakeForm({ ...mistakeForm, corrected_text: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-warm-brown-700 mb-2">Type</label>
              <select
                className="input-warm"
                value={mistakeForm.error_type}
                onChange={(e) =>
                  setMistakeForm({ ...mistakeForm, error_type: e.target.value as Mistake['error_type'] })
                }
              >
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="spelling">Spelling</option>
                <option value="listening">Listening</option>
                <option value="reading">Reading</option>
              </select>
            </div>
            <textarea
              placeholder="Explanation (optional)"
              className="input-warm"
              rows={2}
              value={mistakeForm.explanation}
              onChange={(e) => setMistakeForm({ ...mistakeForm, explanation: e.target.value })}
            />

            {mistakeMessage && <p className="text-sm text-warm-terracotta-600">{mistakeMessage}</p>}
            <button
              onClick={handleAddMistake}
              disabled={savingMistake}
              className="btn-warm btn-warm-primary w-full disabled:opacity-50"
            >
              {savingMistake ? 'Saving...' : 'Add Mistake 📚'}
            </button>
          </div>
        </div>
      )}

      <div className="card-warm bg-warm-tan-50">
        <h4 className="font-bold text-warm-brown-800 mb-3">💡 Admin Tips</h4>
        <ul className="space-y-2 text-sm text-warm-brown-600">
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
