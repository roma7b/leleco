import React, { useEffect, useState } from 'react';
import { Activity, TrendingDown, TrendingUp, Minus, Calendar, Trophy, Target, Dumbbell, Utensils, Brain, Quote, ArrowRight, Star, AlertCircle, CheckCircle2, Info } from 'lucide-react';
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
              // Garante ordenação por data (mais recente primeiro)
              const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              setAssessments(sorted);
              setLoading(false);
          });
      }
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-primary animate-pulse">
        <Activity className="animate-spin mr-2" /> Carregando sua evolução...
    </div>
  );

  if (assessments.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fadeIn">
              <div className="bg-slate-900 p-6 rounded-full mb-4 shadow-[0_0_30px_rgba(163,230,53,0.1)]">
                 <Activity size={48} className="text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Sem dados ainda</h2>
              <p className="text-slate-500 max-w-sm">
                  Assim que seu treinador realizar sua primeira avaliação física, seus resultados aparecerão aqui.
              </p>
          </div>
      );
  }

  // Definição de Comparativos
  const current = assessments[0]; // Última
  const previous = assessments[1]; // Penúltima

  // Parser do Relatório IA
  const parseAIReport = (jsonString: string | undefined) => {
      if (!jsonString) return null;
      try {
          const cleanJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanJson);
      } catch (e) {
          return null;
      }
  };

  const aiData = parseAIReport(current.motivationalReport);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-24 space-y-8">
       
       {/* SEÇÃO 1: RESUMO DO ATLETA (CARD TOPO) */}
       <header className="relative overflow-hidden rounded-3xl bg-surface border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>
            
            <div className="p-6 md:p-10 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block flex items-center gap-2">
                             <Calendar size={14} /> Atualizado em {new Date(current.date).toLocaleDateString('pt-BR')}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">RESULTADOS</h1>
                        <p className="text-slate-400 mt-1">Análise de Performance e Composição</p>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="text-right">
                             <p className="text-[10px] text-slate-500 uppercase font-bold">Peso Atual</p>
                             <p className="text-3xl font-mono font-bold text-white">{current.weight} <span className="text-sm text-slate-600">kg</span></p>
                        </div>
                        <div className="w-px h-10 bg-slate-800"></div>
                        <div className="text-right">
                             <p className="text-[10px] text-slate-500 uppercase font-bold">Gordura</p>
                             <p className="text-3xl font-mono font-bold text-white">{current.bodyFat} <span className="text-sm text-slate-600">%</span></p>
                        </div>
                    </div>
                </div>

                {/* Cards de Destaque */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard 
                        label="Peso Corporal" 
                        value={current.weight} 
                        unit="kg" 
                        prev={previous?.weight} 
                        invert={false} 
                    />
                    <MetricCard 
                        label="Massa Gorda" 
                        value={current.bodyFat} 
                        unit="%" 
                        prev={previous?.bodyFat} 
                        invert={false} 
                    />
                    <MetricCard 
                        label="Massa Muscular" 
                        value={current.muscleMass} 
                        unit="%" 
                        prev={previous?.muscleMass} 
                        invert={true} 
                    />
                </div>
            </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* SEÇÃO 2: TABELA DE DIAGNÓSTICO (COLUNA ESQUERDA - 2/3) */}
           <div className="lg:col-span-2 space-y-8">
                
                {/* Tabela Profissional */}
                <div className="bg-surface border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex items-center gap-3">
                        <Activity className="text-primary" size={20} />
                        <h3 className="font-bold text-white text-lg">Diagnóstico de Composição</h3>
                    </div>
                    <div className="p-6">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                                    <th className="pb-4 pl-2">Indicador</th>
                                    <th className="pb-4">Resultado</th>
                                    <th className="pb-4 text-right pr-2">Status Clínico</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                <DiagnosticRow label="IMC (Índice Massa)" value={current.imc} type="imc" />
                                <DiagnosticRow label="% Gordura Corporal" value={current.bodyFat} type="fat" />
                                <DiagnosticRow label="Nível Gordura Visceral" value={current.visceralFat} type="visceral" />
                                <DiagnosticRow label="% Massa Muscular" value={current.muscleMass} type="muscle" />
                                <DiagnosticRow label="Idade Metabólica" value={current.metabolicAge} type="age" realAge={current.age} />
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Gráficos de Evolução (Linha) */}
                {assessments.length > 1 && (
                    <div className="bg-surface border border-slate-800 rounded-3xl p-6 md:p-8">
                        <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-blue-400" /> Histórico de Peso vs. Gordura
                        </h3>
                        <div className="h-64 w-full">
                            <TrendChart data={assessments} />
                        </div>
                    </div>
                )}
           </div>

           {/* SEÇÃO 3: COMPOSIÇÃO E IA (COLUNA DIREITA - 1/3) */}
           <div className="space-y-8">
                
                {/* Gráfico de Rosca (Composição Atual) */}
                <div className="bg-surface border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-lg">
                    <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-6 w-full text-center border-b border-slate-800 pb-4">
                        Distribuição Corporal
                    </h3>
                    <CompositionDonut fat={current.bodyFat} muscle={current.muscleMass} />
                    <div className="flex justify-between w-full mt-6 px-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <div className="w-3 h-3 rounded-full bg-primary"></div> Gordura
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div> Músculo
                        </div>
                    </div>
                </div>

                {/* Feedback IA */}
                {aiData && (
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                        
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <Brain size={20} className="text-primary" />
                            <h3 className="font-bold text-white text-sm uppercase">Feedback do Treinador</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                <p className="text-white font-bold text-sm mb-1">{aiData.titulo_motivacional}</p>
                                <p className="text-slate-400 text-xs leading-relaxed">{aiData.conquistas_recentes}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Foco da Semana</p>
                                {aiData.objetivos_proxima_fase?.slice(0, 2).map((obj: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                                        <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
                                        <span>{obj.acao}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
           </div>
       </div>
    </div>
  );
};

// --- SUB-COMPONENTES PROFISSIONAIS ---

// 1. Card de Métrica com Variação
const MetricCard = ({ label, value, unit, prev, invert }: any) => {
    let diff = prev ? value - prev : 0;
    // Se invert for true, aumentar é BOM (ex: músculo). Se false, diminuir é BOM (ex: gordura).
    const isGood = invert ? diff >= 0 : diff <= 0;
    const color = isGood ? 'text-primary' : 'text-red-500';
    const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;

    if (Math.abs(diff) < 0.1) diff = 0;

    return (
        <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">{label}</p>
            <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-white">{value}<span className="text-sm font-normal text-slate-600 ml-1">{unit}</span></p>
                {prev && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${diff === 0 ? 'text-slate-500' : color} bg-slate-900 px-2 py-1 rounded-lg`}>
                        <Icon size={12} /> {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                    </div>
                )}
            </div>
        </div>
    );
};

// 2. Linha da Tabela de Diagnóstico com Chips Coloridos
const DiagnosticRow = ({ label, value, type, realAge }: any) => {
    if (!value) return null;

    const getStatus = (t: string, v: number, age?: number) => {
        // Lógica simplificada de saúde
        if (t === 'imc') {
            if (v < 18.5) return { text: 'Abaixo do Peso', color: 'bg-yellow-500 text-slate-900' };
            if (v < 25) return { text: 'Normal', color: 'bg-emerald-500 text-slate-900' };
            if (v < 30) return { text: 'Sobrepeso', color: 'bg-yellow-500 text-slate-900' };
            return { text: 'Obesidade', color: 'bg-red-500 text-white' };
        }
        if (t === 'fat') {
            if (v < 10) return { text: 'Atleta', color: 'bg-emerald-500 text-slate-900' };
            if (v < 20) return { text: 'Bom', color: 'bg-emerald-500 text-slate-900' };
            if (v < 25) return { text: 'Médio', color: 'bg-yellow-500 text-slate-900' };
            return { text: 'Alto', color: 'bg-red-500 text-white' };
        }
        if (t === 'visceral') {
            if (v <= 9) return { text: 'Saudável', color: 'bg-emerald-500 text-slate-900' };
            if (v <= 14) return { text: 'Alerta', color: 'bg-yellow-500 text-slate-900' };
            return { text: 'Perigoso', color: 'bg-red-500 text-white' };
        }
        if (t === 'age' && age) {
            if (v < age) return { text: 'Excelente', color: 'bg-primary text-slate-900' };
            if (v === age) return { text: 'Normal', color: 'bg-emerald-500 text-slate-900' };
            return { text: 'Atenção', color: 'bg-yellow-500 text-slate-900' };
        }
        return { text: 'Analisar', color: 'bg-slate-700 text-slate-300' };
    };

    const status = getStatus(type, value, realAge);

    return (
        <tr className="hover:bg-slate-800/30 transition-colors">
            <td className="py-4 pl-2 font-medium text-slate-300 text-sm">{label}</td>
            <td className="py-4 font-mono font-bold text-white text-base">{value}</td>
            <td className="py-4 text-right pr-2">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${status.color}`}>
                    {status.text}
                </span>
            </td>
        </tr>
    );
};

// 3. Gráfico de Rosca SVG (Donut)
const CompositionDonut = ({ fat, muscle }: any) => {
    // Calculando circunferência para SVG (r=40, C=2*pi*40 = ~251)
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    
    // Assumindo que Fat + Muscle + Others = 100%. 
    // Vamos mostrar apenas Fat (Primary) e Muscle (Blue) proporção visual.
    const fatOffset = circumference - (fat / 100) * circumference;
    const muscleOffset = circumference - (muscle / 100) * circumference;

    return (
        <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                {/* Background Circle */}
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#1e293b" strokeWidth="8" />
                
                {/* Muscle Circle (Blue) - Rendered first */}
                <circle 
                    cx="50" cy="50" r={radius} 
                    fill="transparent" 
                    stroke="#3b82f6" 
                    strokeWidth="8" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={circumference - ((muscle + fat) / 100) * circumference}
                    strokeLinecap="round"
                />

                {/* Fat Circle (Green) - Rendered on top */}
                <circle 
                    cx="50" cy="50" r={radius} 
                    fill="transparent" 
                    stroke="#a3e635" 
                    strokeWidth="8" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={fatOffset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{fat}%</span>
                <span className="text-[10px] font-bold text-primary uppercase">Gordura</span>
            </div>
        </div>
    );
}

// 4. Gráfico de Linha Dupla SVG (Peso vs Gordura)
const TrendChart = ({ data }: any) => {
    const chartData = [...data].reverse(); // Oldest to newest
    if (chartData.length < 2) return <div className="text-slate-500 text-sm p-4">Dados insuficientes para gráfico.</div>;

    const width = 100;
    const height = 50;
    const padding = 5;

    // Helper to normalize
    const normalize = (val: number, min: number, max: number) => {
        const range = max - min || 1;
        return height - ((val - min) / range) * (height - padding * 2) - padding;
    };

    // Get min/max for Weight
    const weights = chartData.map(d => Number(d.weight));
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;

    // Points for Weight (Green)
    const pointsW = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
        const y = normalize(Number(d.weight), minW, maxW);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#334155" strokeWidth="0.2" strokeDasharray="2" />

                {/* Weight Line (Green) */}
                <polyline 
                    fill="none" 
                    stroke="#a3e635" 
                    strokeWidth="1.5" 
                    points={pointsW} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
                
                {/* Dots */}
                {chartData.map((d, i) => {
                    const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
                    const y = normalize(Number(d.weight), minW, maxW);
                    return (
                        <circle key={i} cx={x} cy={y} r="1.5" fill="#a3e635" vectorEffect="non-scaling-stroke" />
                    );
                })}
            </svg>
            
            {/* Legend Overlay */}
            <div className="absolute top-0 right-0 flex gap-4">
                <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                    <div className="w-2 h-0.5 bg-primary"></div> Peso (kg)
                </div>
            </div>
        </div>
    );
};

export default StudentAssessment;