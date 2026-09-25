import React, { useState } from 'react';
import { Camera, Upload, AlertCircle, CheckCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function AgeDetectorPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [estimationResult, setEstimationResult] = useState(null);
  const [confirmedAge, setConfirmedAge] = useState(user?.age || 24);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setEstimationResult(null);
    }
  };

  const handleRunEstimation = async () => {
    if (!selectedFile) {
      showToast('Please select a portrait image first', 'info');
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.estimateAge(formData);
      setEstimationResult(res);
      if (res.estimated_age) {
        setConfirmedAge(res.estimated_age);
      }
      showToast('Demographic estimation completed!', 'success');
    } catch (err) {
      showToast(err.message || 'Age estimation failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyToProfile = async () => {
    try {
      await api.updateProfile({ age: parseInt(confirmedAge, 10) });
      await refreshUser();
      showToast(`Age updated to ${confirmedAge} years! Recommendations updated.`, 'success');
      navigate('/recommendations');
    } catch (err) {
      showToast(err.message || 'Failed to update age in profile', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 text-xs font-semibold mb-2">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>Experimental AI Extension</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-white">AI Demographic Age Estimator</h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload an optional portrait photo to automatically infer your age bracket for customized recommendation tuning.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-300">Privacy & Estimation Disclaimer</div>
          <p className="leading-relaxed text-[11px] text-amber-200/90">
            Uploaded images are processed in-memory for feature analysis and are <strong>never stored permanently</strong> on disk or databases.
            Age estimation is approximate heuristic inference; you always have full control to manually confirm or adjust the resulting age.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="p-6 rounded-3xl bg-[#11131e]/90 border border-white/10 space-y-6">
        <div className="border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-8 text-center transition cursor-pointer relative bg-white/[0.02]">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center space-y-3">
              <img
                src={previewUrl}
                alt="Selected portrait"
                className="w-32 h-32 rounded-2xl object-cover border-2 border-purple-500/50 shadow-xl"
              />
              <span className="text-xs text-purple-300 font-semibold">
                {selectedFile?.name} (Click to select another)
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-white">Click or drag portrait image to upload</div>
              <div className="text-xs text-slate-500">Supports JPG, PNG, WEBP (under 5MB)</div>
            </div>
          )}
        </div>

        <button
          onClick={handleRunEstimation}
          disabled={!selectedFile || analyzing}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-xl shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {analyzing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Demographic Estimation</span>
            </>
          )}
        </button>

        {/* Results Card */}
        {estimationResult && (
          <div className="pt-4 border-t border-white/5 space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Inferred Demographic Bracket</span>
                </div>
                <span className="text-xs font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
                  {estimationResult.estimated_age_range}
                </span>
              </div>

              <div className="text-sm font-semibold text-white">
                Suggested Age: <span className="text-purple-300 font-bold">{estimationResult.estimated_age}</span> years
              </div>
              <p className="text-xs text-slate-400 italic">
                {estimationResult.disclaimer}
              </p>
            </div>

            {/* Manual Verification Adjustment Slider */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Confirm or Adjust Resulting Age:
                </span>
                <span className="font-bold text-purple-300 text-sm">{confirmedAge} years</span>
              </div>

              <input
                type="range"
                min="13"
                max="85"
                value={confirmedAge}
                onChange={(e) => setConfirmedAge(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleApplyToProfile}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center space-x-2 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Age & Apply to Recommendations</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
