
import React, { useEffect, useState } from 'react';
import { Activity, TrendingDown, TrendingUp, Minus, Calendar, Trophy } from 'lucide-react';
import { Assessment, User } from '../types';
import { fetchAssessments } from '../services/db';

interface StudentAssessmentProps {
  user: User;
}

const StudentAssessment: React.FC<StudentAssessmentProps> = ({ user }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (user.studentId) {
          fetchAssessments(user.studentId).then(data => {
              setAssessments(data);
              setLoading(false);
          });
      }
  }, [user]);

  if (loading) return <div className="text-center text-slate-500 mt-20">Carregando avaliação...</div>;

  if (assessments.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6">
              <Activity size={64} className="text-slate-700 mb-4" />
              <h2 className="text-xl font-bold text-white">Nenhuma avaliação ainda</h2>
              <p className="text-slate-500 mt-2">Aguarde seu Personal lançar sua primeira avaliação física.</p>
          </div>
      );
  }

  const current = assessments[0]; // Mais recente
  const previous = assessments[1]; // Penúltima para comparação

  const getDiff = (curr: number, prev: number | undefined) => {
      if (!prev) return null;
      const diff = curr - prev;
      if (diff === 0) return <span className="text-slate-500 flex items-center text-xs"><Minus size={12}/> 0</span>;
      if (diff > 0) return <span className="text-red-400 flex items-center text-xs"><TrendingUp size={12}/> +{diff.toFixed(1)}</span>;
      return <span className="text-primary flex items-center text-xs"><TrendingDown size={12}/> {diff.toFixed(1)}</span>;
  };

  // Lógica inversa para músculo (ganhar é bom)
  const getMuscleDiff = (curr: number, prev: number | undefined) => {
    if (!prev) return null;
    const diff = curr - prev;
    if (diff > 0) return <span className="text-primary flex items-center text-xs"><TrendingUp size={12}/> +{diff.toFixed(1)}</span>;
    if (diff < 0) return <span className="text-red-400 flex items-center text-xs"><TrendingDown size={12}/> {diff.toFixed(1)}</span>;
    return <span className="text-slate-500 flex items-center text-xs"><Minus size={12}/> 0</span>;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-24">
       <header className="mb-8 p-6 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl relative overflow-hidden">
            <div className="relative z-10">
                <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Última Atualização</span>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Calendar className="text-slate-400" /> 
                    {new Date(current.date).toLocaleDateString('pt-BR')}
                </h1>
            </div>
       </header>

       {/* CARD PRINCIPAL */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Peso</p>
                <p className="text-2xl font-bold text-white mt-1">{current.weight} <span className="text-sm text-slate-400">kg</span></p>
                {getDiff(current.weight, previous?.weight)}
            </div>
            <div className="bg-surface border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Gordura</p>
                <p className="text-2xl font-bold text-white mt-1">{current.bodyFat} <span className="text-sm text-slate-400">%</span></p>
                {getDiff(current.bodyFat, previous?.bodyFat)}
            </div>
            <div className="bg-surface border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Músculo</p>
                <p className="text-2xl font-bold text-white mt-1">{current.muscleMass} <span className="text-sm text-slate-400">%</span></p>
                {getMuscleDiff(current.muscleMass, previous?.muscleMass)}
            </div>
            <div className="bg-surface border border-slate-800 p-4 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Idade Corp.</p>
                <p className="text-2xl font-bold text-white mt-1">{current.metabolicAge} <span className="text-sm text-slate-400">anos</span></p>
                {getDiff(current.metabolicAge, previous?.metabolicAge)}
            </div>
       </div>

       {/* RELATÓRIO IA */}
       {current.motivationalReport && (
           <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-primary/20 p-8 rounded-2xl shadow-xl relative overflow-hidden mb-8">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
               <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-primary text-slate-900 rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                       <Trophy size={24} />
                   </div>
                   <h2 className="text-xl font-bold text-white">Análise do Treinador</h2>
               </div>
               
               <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white max-w-none">
                   <div className="whitespace-pre-line leading-relaxed text-sm md:text-base">
                       {current.motivationalReport}
                   </div>
               </div>
           </div>
       )}

       {/* Medidas Grid */}
       <div className="bg-surface border border-slate-800 rounded-2xl p-6">
           <h3 className="text-white font-bold mb-4">Medidas de Circunferência</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
               <MetricItem label="Cintura" value={current.waist} unit="cm" />
               <MetricItem label="Abdômen" value={current.abdomen} unit="cm" />
               <MetricItem label="Quadril" value={current.hips} unit="cm" />
               <MetricItem label="Peitoral" value={current.chest} unit="cm" />
               <MetricItem label="Braço D." value={current.arms} unit="cm" />
               <MetricItem label="Coxa D." value={current.thighs} unit="cm" />
           </div>
       </div>
    </div>
  );
};

const MetricItem = ({ label, value, unit }: any) => (
    <div>
        <p className="text-xs text-slate-500 uppercase">{label}</p>
        <p className="text-lg font-bold text-white">{value || '-'} <span className="text-xs text-slate-600">{unit}</span></p>
    </div>
);

export default StudentAssessment;
