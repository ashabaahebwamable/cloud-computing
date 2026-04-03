import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ImageIcon,
  Loader2,
  Brain,
  CheckCircle2,
  X,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadCase } from '../api/client.js';
import { UploadCaseResult } from '../types/index.js';
import ConfidenceBar from './ConfidenceBar.js';

interface UploadCaseFormProps {
  onCaseUploaded: (result: UploadCaseResult & { patientName: string }) => void;
}

export default function UploadCaseForm({ onCaseUploaded }: UploadCaseFormProps) {
  const [patientName, setPatientName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadCaseResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    toast.success('Ultrasound image loaded — ready for analysis');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!imageFile) {
      toast.error('Please select an ultrasound image');
      return;
    }

    setUploading(true);
    setResult(null);
    try {
      const data = await uploadCase(patientName.trim(), imageFile);
      setResult(data);
      onCaseUploaded({ ...data, patientName: patientName.trim() });
      toast.success('AI segmentation complete — case saved');
    } catch (err) {
      toast.error((err as Error).message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setPatientName('');
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-[2rem] p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-black uppercase italic tracking-tight text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          New Case Upload
        </h3>
        {(imagePreview || result) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-red-400 uppercase tracking-[0.2em] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Patient Name
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Ultrasound Image
          </label>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/50 bg-black">
              <img
                src={imagePreview}
                alt="Ultrasound preview"
                className="w-full max-h-48 object-contain"
              />
              {result?.maskPath && showOverlay && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.45 }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                      d={result.maskPath}
                      fill="none"
                      stroke="#00d4ff"
                      strokeWidth="8"
                      strokeLinecap="round"
                      filter="blur(5px)"
                    />
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.1 }}
                      d={result.maskPath}
                      fill="none"
                      stroke="#00d4ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_6px_rgba(0,212,255,0.9)]"
                    />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {result?.maskPath && (
                  <button
                    type="button"
                    onClick={() => setShowOverlay(!showOverlay)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] transition-all border ${
                      showOverlay
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                        : 'bg-black/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    {showOverlay ? 'Hide Mask' : 'Show Mask'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] bg-black/60 border border-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group">
              <div className="w-12 h-12 bg-slate-900/50 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                <ImageIcon className="w-6 h-6 text-slate-600 group-hover:text-cyan-500 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-400 group-hover:text-white transition-colors">
                  Upload Ultrasound Image
                </p>
                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-black">
                  JPEG, PNG, DICOM — max 20MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* AI Analysis result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
                  AI Segmentation Complete
                </p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                "{result.findings}"
              </p>
              <ConfidenceBar confidence={result.confidence} />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={uploading || !imageFile || !patientName.trim()}
          className="w-full flex items-center justify-center gap-3 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] active:scale-[0.98]"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with Gemini AI...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload & Analyze
            </>
          )}
        </button>
      </form>
    </div>
  );
}
