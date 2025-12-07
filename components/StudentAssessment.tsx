import React, { useEffect, useState } from 'react';
import { Activity, TrendingDown, TrendingUp, Minus, Calendar, Trophy, Target, Dumbbell, Utensils, Brain, Quote, ArrowRight, Star } from 'lucide-react';
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
                  Assim que seu treinador realizar sua primeira avaliação física, os gráficos e metas aparecerão aqui.
              </p>
          </div>
      );
  }

  // Definição de Comparativos
  const current = assessments[0]; // Última (Mais recente)
  const previous = assessments[1]; // Penúltima (Para evolução recente)
  const initial = assessments[assessments.length - 1]; // Primeira (Para evolução total)

  // Função Auxiliar para Calcular Diferenças (Cards do Topo)
  const calculateDiff = (curr: number, prev: number | undefined, invertBetter = false) => {
      if (prev === undefined) return <span className="text-slate-600 text-xs font-medium">Marco Zero</span>;
      
      const diff = curr - prev;
      if (Math.abs(diff) < 0.1) return <span className="text-slate-500 text-xs font-medium flex items-center gap-1"><Minus size={10}/> Estável</span>;

      // Se invertBetter é true, aumentar é bom (ex: Músculo). Se false, diminuir é bom (ex: Gordura).
      const isGood = invertBetter ? diff > 0 : diff < 0;
      
      const colorClass = isGood ? "text-primary" : "text-red-400";
      const Icon = diff > 0 ? TrendingUp : TrendingDown;
      const sign = diff > 0 ? "+" : "";

      return (
          <span className={`${colorClass} text-xs font-bold flex items-center gap-1 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800`}>
              <Icon size={12} /> {sign}{diff.toFixed(1)} vs. anterior
          </span>
      );
  };

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
    <div className="max-w-5xl mx-auto animate-fadeIn pb-24 space-y-8">
       
       {/* SEÇÃO 1: CABEÇALHO E RESUMO RÁPIDO */}
       <header className="relative overflow-hidden rounded-3xl bg-surface border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-10 -mt-10"></div>
            
            <div className="p-6 md:p-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1 block flex items-center gap-2">
                             <Calendar size={14} /> Atualizado em {new Date(current.date).toLocaleDateString('pt-BR')}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-white italic">MINHA EVOLUÇÃO</h1>
                    </div>
                    {/* Badge de Status */}
                    <div className="flex items-center gap-3 bg-slate-950/50 p-2 pr-4 rounded-full border border-slate-800">
                         <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs border border-slate-700">
                             IMC
                         </div>
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-bold">Índice Atual</p>
                             <p className="text-white font-bold">{current.imc ? current.imc : '-.--'}</p>
                         </div>
                    </div>
                </div>

                {/* Cards de Métricas Principais */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Peso</p>
                        <p className="text-2xl md:text-4xl font-black text-white mb-2">{current.weight}<span className="text-sm text-slate-600 ml-1">kg</span></p>
                        <div className="flex justify-center">{calculateDiff(current.weight, previous?.weight, false)}</div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Gordura</p>
                        <p className="text-2xl md:text-4xl font-black text-white mb-2">{current.bodyFat}<span className="text-sm text-slate-600 ml-1">%</span></p>
                        <div className="flex justify-center">{calculateDiff(current.bodyFat, previous?.bodyFat, false)}</div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-center relative overflow-hidden group hover:border-primary/30 transition-colors">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1 group-hover:text-primary transition-colors">Músculo</p>
                        <p className="text-2xl md:text-4xl font-black text-white mb-2">{current.muscleMass}<span className="text-sm text-slate-600 ml-1">%</span></p>
                        <div className="flex justify-center">{calculateDiff(current.muscleMass, previous?.muscleMass, true)}</div>
                    </div>
                </div>
            </div>
       </header>

       {/* SEÇÃO 2: GRÁFICOS DE TENDÊNCIA (Só aparece se tiver +1 avaliação) */}
       {assessments.length > 1 && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <TrendChart 
                  data={assessments} 
                  dataKey="weight" 
                  color="#a3e635" 
                  label="Evolução de Peso (kg)"
                  suffix="kg"
                />
               <TrendChart 
                  data={assessments} 
                  dataKey="bodyFat" 
                  color="#60a5fa" 
                  label="Evolução de Gordura (%)" 
                  suffix="%"
                />
           </div>
       )}

       {/* SEÇÃO 3: FEEDBACK DA INTELIGÊNCIA ARTIFICIAL */}
       {aiData && (
           <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
               <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]"></div>

               <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                       <div className="bg-primary text-slate-950 p-2.5 rounded-lg shadow-[0_0_15px_rgba(163,230,53,0.4)]">
                           <Trophy size={24} fill="currentColor" />
                       </div>
                       <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tight">
                           {aiData.titulo_motivacional || "Análise do Treinador"}
                       </h2>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                       <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl hover:bg-slate-800/60 transition-colors">
                           <h3 className="text-primary font-bold uppercase text-xs tracking-wider mb-2 flex items-center gap-2">
                               <Star size={14} fill="currentColor" /> Grandes Conquistas
                           </h3>
                           <p className="text-slate-200 text-sm leading-relaxed">{aiData.conquistas_recentes}</p>
                       </div>

                       <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl hover:bg-blue-500/10 transition-colors">
                           <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider mb-2 flex items-center gap-2">
                               <Target size={14} /> Foco da Fase
                           </h3>
                           <p className="text-slate-200 text-sm leading-relaxed">{aiData.foco_principal_traduzido}</p>
                       </div>
                   </div>

                   <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider opacity-80">Suas 3 Missões para a Próxima Fase</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                       {aiData.objetivos_proxima_fase?.map((obj: any, idx: number) => (
                           <div key={idx} className="bg-surface border border-slate-800 p-4 rounded-xl flex flex-col items-center text-center shadow-lg group hover:border-primary/30 transition-all">
                               <div className="mb-3 p-3 bg-slate-900 rounded-full text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                   {obj.area === 'Treino' && <Dumbbell size={20} />}
                                   {obj.area === 'Alimentação' && <Utensils size={20} />}
                                   {obj.area === 'Hábito' && <Brain size={20} />}
                               </div>
                               <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{obj.area}</p>
                               <p className="text-slate-200 text-sm font-medium">{obj.acao}</p>
                           </div>
                       ))}
                   </div>

                   <div className="flex gap-4 items-start bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                       <Quote className="text-slate-600 flex-shrink-0" size={24} />
                       <p className="text-slate-400 text-sm italic leading-relaxed">"{aiData.mensagem_final}"</p>
                   </div>
               </div>
           </div>
       )}

       {/* SEÇÃO 4: TABELA DE INDICADORES */}
       <div className="bg-surface border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
           <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
               <h3 className="font-bold text-white flex items-center gap-2">
                   <Activity size={18} className="text-primary" /> Resumo das Avaliações
               </h3>
               {initial && initial.id !== current.id && (
                   <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                       Desde {new Date(initial.date).toLocaleDateString('pt-BR')}
                   </span>
               )}
           </div>
           
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                   <thead className="bg-slate-900 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                       <tr>
                           <th className="px-6 py-4">Indicador</th>
                           <th className="px-6 py-4 text-center">Atual</th>
                           <th className="px-6 py-4 text-center">Evolução Recente</th>
                           <th className="px-6 py-4 text-center">Evolução Total</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800 text-slate-300">
                       <IndicatorRow label="Peso Corporal (kg)" current={current.weight} prev={previous?.weight} initial={initial?.weight} invert={false} />
                       <IndicatorRow label="% Gordura" current={current.bodyFat} prev={previous?.bodyFat} initial={initial?.bodyFat} invert={false} />
                       <IndicatorRow label="% Músculo" current={current.muscleMass} prev={previous?.muscleMass} initial={initial?.muscleMass} invert={true} />
                       <IndicatorRow label="Cintura (cm)" current={current.waist} prev={previous?.waist} initial={initial?.waist} invert={false} />
                       <IndicatorRow label="Abdômen (cm)" current={current.abdomen} prev={previous?.abdomen} initial={initial?.abdomen} invert={false} />
                       <IndicatorRow label="Gordura Visceral" current={current.visceralFat} prev={previous?.visceralFat} initial={initial?.visceralFat} invert={false} />
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

// 1. Gráfico SVG Nativo
const TrendChart = ({ data, dataKey, color, label, suffix }: any) => {
    // Ordena do mais antigo para o mais novo para o gráfico
    const chartData = [...data].reverse().filter(item => item[dataKey] !== undefined && item[dataKey] !== null);
    
    if (chartData.length < 2) return null;

    const values = chartData.map(d => Number(d[dataKey]));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1; // Evita divisão por zero
    
    // Configurações do SVG
    const width = 100;
    const height = 50;
    const padding = 5;

    // Normaliza os pontos
    const points = chartData.map((d, i) => {
        const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
        const normalizedValue = (Number(d[dataKey]) - min) / range;
        const y = height - (normalizedValue * (height - padding * 2) + padding);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-surface border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <h4 className="text-slate-400 text-xs font-bold uppercase mb-4">{label}</h4>
            <div className="h-32 w-full relative">
                 <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                     {/* Linha */}
                     <polyline 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="2" 
                        points={points} 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                     />
                     {/* Pontos */}
                     {chartData.map((d, i) => {
                         const x = (i / (chartData.length - 1)) * (width - padding * 2) + padding;
                         const normalizedValue = (Number(d[dataKey]) - min) / range;
                         const y = height - (normalizedValue * (height - padding * 2) + padding);
                         return (
                             <g key={i} className="group">
                                <circle cx={x} cy={y} r="1.5" fill={color} className="transition-all group-hover:r-2" vectorEffect="non-scaling-stroke" />
                                {/* Tooltip Simplificado (aparece no hover do ponto) */}
                                <foreignObject x={x - 10} y={y - 15} width="20" height="20" className="opacity-0 group-hover:opacity-100 transition-opacity overflow-visible">
                                    <div className="bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded border border-slate-700 whitespace-nowrap -ml-2 -mt-2">
                                        {Number(d[dataKey])}{suffix}
                                    </div>
                                </foreignObject>
                             </g>
                         );
                     })}
                 </svg>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono">
                <span>{new Date(chartData[0].date).toLocaleDateString('pt-BR')}</span>
                <span>{new Date(chartData[chartData.length - 1].date).toLocaleDateString('pt-BR')}</span>
            </div>
        </div>
    );
};

// 2. Linha da Tabela com lógica de cor
const IndicatorRow = ({ label, current, prev, initial, invert }: any) => {
    if (!current) return null;

    const diffPrev = prev !== undefined ? current - prev : 0;
    const diffTotal = initial !== undefined ? current - initial : 0;

    const renderDiff = (val: number, isTotal: boolean) => {
        if (val === 0) return <span className="text-slate-600">-</span>;
        
        const isGood = invert ? val > 0 : val < 0;
        const color = isGood ? "text-primary" : "text-slate-500"; 
        
        return (
            <span className={`${color} font-bold text-xs`}>
                {val > 0 ? '+' : ''}{val.toFixed(1)}
            </span>
        );
    };

    return (
        <tr className="hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4 font-medium text-white">{label}</td>
            <td className="px-6 py-4 text-center font-bold font-mono text-lg">{current}</td>
            <td className="px-6 py-4 text-center">
                {prev !== undefined ? renderDiff(diffPrev, false) : <span className="text-slate-600 text-xs">-</span>}
            </td>
            <td className="px-6 py-4 text-center">
                {initial && initial !== current ? renderDiff(diffTotal, true) : <span className="text-slate-600 text-xs">Marco Zero</span>}
            </td>
        </tr>
    );
};

export default StudentAssessment;