import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, Circle, Play, Video, ExternalLink, Info, Timer, X } from 'lucide-react';
import { WorkoutPlan, Exercise } from '../types';
import { useToast } from './ToastContext';

interface WorkoutViewerProps {
  workout: WorkoutPlan;
  onBack: () => void;
}

const WorkoutViewer: React.FC<WorkoutViewerProps> = ({ workout, onBack }) => {
  const { showToast } = useToast();
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // TIMER STATE
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(0);

  const currentSession = workout.sessions[activeSessionIndex];

  // On desktop, auto-select first exercise if none selected
  useEffect(() => {
    if (!selectedExerciseId && currentSession.exercises.length > 0) {
        setSelectedExerciseId(currentSession.exercises[0].id);
    }
  }, [activeSessionIndex, currentSession]);

  // TIMER LOGIC
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Optional: Play sound or vibrate here
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      showToast('Tempo de descanso finalizado!', 'info');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const parseRestTime = (restString: string): number => {
    // Extract number from string like "60s", "1min", "90"
    const numbers = restString.replace(/[^0-9]/g, '');
    const val = parseInt(numbers);
    return isNaN(val) ? 60 : val; // Default 60s if parse fails
  };

  const startTimer = (restString: string) => {
    const seconds = parseRestTime(restString);
    setTimerSeconds(seconds);
    setInitialTime(seconds);
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const toggleComplete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (completedExercises.includes(id)) {
      setCompletedExercises(completedExercises.filter(exId => exId !== id));
    } else {
      setCompletedExercises([...completedExercises, id]);
      showToast('Exercício concluído!', 'success');
    }
  };

  const progress = Math.round((completedExercises.length / currentSession.exercises.length) * 100);
  
  const selectedExercise = currentSession.exercises.find(e => e.id === selectedExerciseId) || currentSession.exercises[0];

  // Helper to get YouTube embed URL (simple logic)
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  const embedUrl = selectedExercise?.videoUrl ? getEmbedUrl(selectedExercise.videoUrl) : null;

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full flex flex-col animate-fadeIn max-w-7xl mx-auto pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-slate-800 pb-4 pt-2 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-bold text-2xl text-white leading-none tracking-tight">{workout.title}</h1>
            <p className="text-sm text-primary mt-1 font-medium">{currentSession.name}</p>
          </div>
        </div>

        {/* Tabs & Progress */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {workout.sessions.map((session, idx) => (
                <button
                key={session.id}
                onClick={() => setActiveSessionIndex(idx)}
                className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-bold transition-all border ${
                    idx === activeSessionIndex 
                    ? 'bg-primary text-slate-950 border-primary shadow-[0_0_10px_rgba(163,230,53,0.3)]' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
                }`}
                >
                {session.name}
                </button>
            ))}
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-1/3">
                <span className="text-xs text-slate-400 whitespace-nowrap">{progress}% Concluído</span>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full relative">
        {/* LEFT COLUMN: Exercise List */}
        <div className="lg:w-1/2 space-y-3 pb-24 lg:pb-0">
            {currentSession.exercises.map((exercise) => {
            const isDone = completedExercises.includes(exercise.id);
            const isSelected = selectedExerciseId === exercise.id;
            
            return (
                <div 
                key={exercise.id}
                onClick={() => setSelectedExerciseId(exercise.id)}
                className={`relative rounded-xl p-4 border cursor-pointer transition-all group ${
                    isSelected 
                        ? 'bg-slate-800 border-primary ring-1 ring-primary' 
                        : 'bg-surface border-slate-800 hover:border-slate-600'
                } ${isDone ? 'opacity-60' : ''}`}
                >
                <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-bold text-lg ${isDone ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {exercise.name}
                    </h3>
                    <button 
                    onClick={(e) => toggleComplete(e, exercise.id)}
                    className={`transition-all transform active:scale-90 ${isDone ? 'text-primary' : 'text-slate-600 hover:text-white'}`}
                    >
                    {isDone ? <CheckCircle2 size={28} className="drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]" /> : <Circle size={28} />}
                    </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    <div className="bg-slate-950/50 rounded p-2 text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Sets</span>
                    <span className="text-white font-mono font-bold">{exercise.sets}</span>
                    </div>
                    <div className="bg-slate-950/50 rounded p-2 text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Reps</span>
                    <span className="text-white font-mono text-sm">{exercise.reps}</span>
                    </div>
                    <div className="bg-slate-950/50 rounded p-2 text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Carga</span>
                    <span className="text-white font-mono text-sm">{exercise.weight || '-'}</span>
                    </div>
                    <div 
                        onClick={(e) => { e.stopPropagation(); startTimer(exercise.rest); }}
                        className="bg-slate-950/50 rounded p-2 text-center cursor-pointer hover:bg-slate-800 hover:text-primary transition-colors col-span-2 border border-transparent hover:border-primary/30"
                    >
                        <span className="text-[10px] text-slate-500 uppercase block flex items-center justify-center gap-1">Rest <Timer size={10}/></span>
                        <span className="text-white font-mono text-sm flex items-center justify-center gap-1">
                            {exercise.rest} 
                        </span>
                    </div>
                </div>
                
                {/* Mobile only indicator that there is a video */}
                <div className="lg:hidden mt-2 flex justify-end">
                    {exercise.videoUrl && <Video size={14} className="text-primary" />}
                </div>
                </div>
            );
            })}
        </div>

        {/* RIGHT COLUMN: Desktop Details / Video Sticky */}
        <div className="hidden lg:block lg:w-1/2 h-fit sticky top-40">
            {selectedExercise ? (
                <div className="bg-surface border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Video Player Area */}
                    <div className="aspect-video bg-black relative flex items-center justify-center group">
                         {embedUrl ? (
                             <iframe 
                                src={embedUrl} 
                                className="w-full h-full" 
                                title={selectedExercise.name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                             />
                         ) : selectedExercise.videoUrl ? (
                             <div className="text-center p-8">
                                <Video size={48} className="mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400 mb-4">Vídeo disponível externamente</p>
                                <a 
                                    href={selectedExercise.videoUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-slate-950 font-bold rounded-lg hover:bg-primary-hover transition-colors"
                                >
                                    Assistir Vídeo <ExternalLink size={16} />
                                </a>
                             </div>
                         ) : (
                            <div className="text-center text-slate-600">
                                <Video size={48} className="mx-auto mb-2 opacity-20" />
                                <p>Sem vídeo demonstrativo</p>
                            </div>
                         )}
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                {selectedExercise.name}
                                {completedExercises.includes(selectedExercise.id) && <span className="text-xs bg-primary text-slate-950 px-2 py-1 rounded font-bold">FEITO</span>}
                            </h2>
                            <button 
                                onClick={() => startTimer(selectedExercise.rest)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold text-primary transition-colors"
                            >
                                <Timer size={16} /> Timer: {selectedExercise.rest}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                 <p className="text-slate-400 text-xs uppercase mb-1">Execução</p>
                                 <p className="text-xl text-white font-mono">{selectedExercise.sets} x {selectedExercise.reps}</p>
                             </div>
                             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                 <p className="text-slate-400 text-xs uppercase mb-1">Descanso</p>
                                 <p className="text-xl text-white font-mono">{selectedExercise.rest}</p>
                             </div>
                        </div>

                        {selectedExercise.notes && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                                <h4 className="text-yellow-500 font-bold flex items-center gap-2 mb-1 text-sm">
                                    <Info size={16} /> Dicas do Personal
                                </h4>
                                <p className="text-slate-300 text-sm italic">"{selectedExercise.notes}"</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                    Selecione um exercício
                </div>
            )}
        </div>
      </div>

      {/* --- FLOATING REST TIMER (GLOBAL) --- */}
      {isTimerRunning && (
        <div className="fixed bottom-20 md:bottom-10 right-4 md:right-10 z-50 animate-slideUp">
          <div className="bg-slate-900 border border-primary/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(163,230,53,0.2)] w-64 relative overflow-hidden">
            {/* Progress Bar BG */}
            <div 
                className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${(timerSeconds / initialTime) * 100}%` }}
            />
            
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Timer size={14} className="text-primary animate-pulse" /> Descanso
                </span>
                <button onClick={stopTimer} className="text-slate-500 hover:text-white">
                    <X size={18} />
                </button>
            </div>
            
            <div className="flex items-center justify-center py-2">
                <span className="text-5xl font-black text-white font-mono tracking-tighter">
                    {formatTime(timerSeconds)}
                </span>
            </div>
            
            <button 
                onClick={() => setTimerSeconds(timerSeconds + 30)} 
                className="w-full mt-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded font-medium transition-colors"
            >
                +30s
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkoutViewer;