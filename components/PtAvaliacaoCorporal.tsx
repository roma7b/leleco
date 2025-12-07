import React, { useState, useEffect } from 'react';
import { Save, BrainCircuit, Activity, Ruler, User, ClipboardList, Loader2, FileText, Calculator, Settings2, AlertTriangle, CheckCircle2, Utensils, Dumbbell, Brain, Quote, History, Target, Layers, Calendar, ChevronRight } from 'lucide-react';
import { Student, Assessment } from '../types';
import { createAssessment, fetchAssessments } from '../services/db';
import { gerarRelatorioEstrategico, gerarRelatorioMotivacional } from '../services/aiAnalysis';
import { useToast } from './ToastContext';

interface PtAvaliacaoCorporalProps {
  students: Student[];
}

const PtAvaliacaoCorporal: React.FC<PtAvaliacaoCorporalProps> = ({ students }) => {
  const { showToast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Histórico
  const [history, setHistory] = useState<Assessment[]>([]);
  const [previousAssessment, setPreviousAssessment] = useState<Assessment | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    // Novos campos de metodologia
    fatCalculationMethod: 'Bioimpedância',
    tmbFormula: 'Mifflin-St Jeor',
    
    // Dados Biométricos Básicos
    age: '',      // Idade
    height: '',   // Altura (cm)
    imc: '',      // IMC (Calculado)

    // Dados numéricos
    weight: '',
    bodyFat: '',
    muscleMass: '',
    visceralFat: '',
    metabolicAge: '',
    
    // Perimetria
    chest: '',
    arms: '',
    waist: '',
    abdomen: '',
    hips: '',
    thighs: '',
    calves: '',

    // Dobras Cutâneas (mm) - Novo objeto aninhado
    skinFolds: {
        chest: '',       // Peitoral
        axillary: '',    // Axilar Média
        triceps: '',     // Tricipital
        subscapular: '', // Subescapular
        abdominal: '',   // Abdominal
        suprailiac: '',  // Supra-ilíaca
        thigh: ''        // Coxa
    }
  });

  const [aiReportStrategic, setAiReportStrategic] = useState<string>('');
  const [aiReportMotivational, setAiReportMotivational] = useState<string>('');

  // Carregar histórico ao mudar de aluno
  useEffect(() => {
    if (selectedStudentId) {
        loadHistory(selectedStudentId);
        // Limpar form ao trocar de aluno
        clearForm();
    }
  }, [selectedStudentId]);

  // Cálculo Automático do IMC
  useEffect(() => {
    const weightVal = parseFloat(formData.weight);
    const heightVal = parseFloat(formData.height);

    if (weightVal > 0 && heightVal > 0) {
        // Conversão de cm para metros
        const heightInMeters = heightVal / 100;
        // Fórmula: Peso / (Altura * Altura)
        const imcValue = weightVal / (heightInMeters * heightInMeters);
        setFormData(prev => ({ ...prev, imc: imcValue.toFixed(2) }));
    } else {
        setFormData(prev => ({ ...prev, imc: '' }));
    }
  }, [formData.weight, formData.height]);

  const clearForm = () => {
    setFormData({
        fatCalculationMethod: 'Bioimpedância',
        tmbFormula: 'Mifflin-St Jeor',
        age: '', height: '', imc: '',
        weight: '', bodyFat: '', muscleMass: '', visceralFat: '', metabolicAge: '',
        chest: '', arms: '', waist: '', abdomen: '', hips: '', thighs: '', calves: '',
        skinFolds: { chest: '', axillary: '', triceps: '', subscapular: '', abdominal: '', suprailiac: '', thigh: '' }
    });
    setAiReportStrategic('');
    setAiReportMotivational('');
  };

  const loadHistory = async (id: string) => {
      const data = await fetchAssessments(id);
      setHistory(data);
      if (data.length > 0) {
          setPreviousAssessment(data[0]); // A mais recente (índice 0 pois vem ordenada por data desc)
      } else {
          setPreviousAssessment(null);
      }
  };

  // Carregar uma avaliação antiga no formulário
  const handleLoadAssessment = (assessment: Assessment) => {
    setFormData({
        fatCalculationMethod: assessment.fatCalculationMethod || 'Bioimpedância',
        tmbFormula: assessment.tmbFormula || 'Mifflin-St Jeor',
        age: assessment.age?.toString() || '',
        height: assessment.height?.toString() || '',
        imc: assessment.imc?.toString() || '',
        weight: assessment.weight?.toString() || '',
        bodyFat: assessment.bodyFat?.toString() || '',
        muscleMass: assessment.muscleMass?.toString() || '',
        visceralFat: assessment.visceralFat?.toString() || '',
        metabolicAge: assessment.metabolicAge?.toString() || '',
        chest: assessment.chest?.toString() || '',
        arms: assessment.arms?.toString() || '',
        waist: assessment.waist?.toString() || '',
        abdomen: assessment.abdomen?.toString() || '',
        hips: assessment.hips?.toString() || '',
        thighs: assessment.thighs?.toString() || '',
        calves: assessment.calves?.toString() || '',
        skinFolds: { chest: '', axillary: '', triceps: '', subscapular: '', abdominal: '', suprailiac: '', thigh: '' } // TODO: Adicionar campos de dobras no banco se necessário futuramente
    });
    setAiReportStrategic(assessment.strategicReport || '');
    setAiReportMotivational(assessment.motivationalReport || '');
    showToast(`Dados de ${new Date(assessment.date).toLocaleDateString()} carregados.`, 'info');
  };

  const handleGenerateAI = async () => {
    if (!formData.weight || !formData.bodyFat || !formData.muscleMass) {
        showToast('Preencha pelo menos Peso, Gordura e Músculo.', 'error');
        return;
    }

    setGeneratingAI(true);

    const dadosAtuais = {
        data: new Date().toLocaleDateString('pt-BR'),
        ...formData 
    };

    const dadosCompletos = {
        aluno: students.find(s => s.id === selectedStudentId)?.name,
        avaliacao_atual: dadosAtuais,
        avaliacao_anterior: previousAssessment || "Sem dados anteriores para comparação.",
    };

    const metodologia = {
        metodo_gordura: formData.fatCalculationMethod,
        formula_tmb: formData.tmbFormula,
        dobras_cutaneas_mm: formData.fatCalculationMethod === 'Dobras' ? formData.skinFolds : 'Não aplicável (Bioimpedância)'
    };

    try {
        const strategic = await gerarRelatorioEstrategico(dadosCompletos, metodologia);
        const motivational = await gerarRelatorioMotivacional(dadosCompletos);

        if (strategic) setAiReportStrategic(strategic);
        if (motivational) setAiReportMotivational(motivational);
        
        showToast('Relatórios gerados com sucesso!', 'success');
    } catch (e) {
        showToast('Erro ao gerar relatório.', 'error');
    } finally {
        setGeneratingAI(false);
    }
  };

  const safeFloat = (value: string): number | any => {
      if (!value || value.trim() === '') return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
  };

  const handleSave = async () => {
      if (!selectedStudentId) return;

      setLoading(true);

      const newAssessment: Assessment = {
          id: crypto.randomUUID(),
          studentId: selectedStudentId,
          date: new Date().toISOString(),
          
          age: safeFloat(formData.age),
          height: safeFloat(formData.height),
          imc: safeFloat(formData.imc),
          fatCalculationMethod: formData.fatCalculationMethod,
          tmbFormula: formData.tmbFormula,

          weight: safeFloat(formData.weight) || 0,
          bodyFat: safeFloat(formData.bodyFat) || 0,
          muscleMass: safeFloat(formData.muscleMass) || 0,
          visceralFat: safeFloat(formData.visceralFat),
          metabolicAge: safeFloat(formData.metabolicAge),
          chest: safeFloat(formData.chest),
          arms: safeFloat(formData.arms),
          waist: safeFloat(formData.waist),
          abdomen: safeFloat(formData.abdomen),
          hips: safeFloat(formData.hips),
          thighs: safeFloat(formData.thighs),
          calves: safeFloat(formData.calves),
          
          strategicReport: aiReportStrategic,
          motivationalReport: aiReportMotivational
      };

      const saved = await createAssessment(newAssessment);
      if (saved) {
          showToast('Avaliação salva com sucesso!', 'success');
          // Recarregar histórico
          loadHistory(selectedStudentId);
      } else {
          showToast('Erro ao salvar no banco. Verifique o console.', 'error');
      }
      setLoading(false);
  };

  const parseAIJson = (jsonString: string) => {
      try {
          const cleanString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleanString);
      } catch (e) {
          return null;
      }
  };

  const renderStrategicReport = () => {
      if (!aiReportStrategic) return null;
      const data = parseAIJson(aiReportStrategic);
      if (!data) return <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-line">{aiReportStrategic}</div>;

      return (
          <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <h4 className="text-red-400 font-bold uppercase text-xs tracking-wider mb-1 flex items-center gap-2">
                      <AlertTriangle size={14} /> Risco Principal Detectado
                  </h4>
                  <p className="text-white font-bold text-lg mb-2">{data.diagnostico_estrategico?.risco_principal}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{data.diagnostico_estrategico?.justificativa_completa}</p>
              </div>

              {data.diagnostico_estrategico?.analise_metodologia && (
                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                      <h4 className="text-blue-400 font-bold uppercase text-xs tracking-wider mb-2 flex items-center gap-2">
                          <Settings2 size={14} /> Análise da Metodologia
                      </h4>
                      <p className="text-slate-300 text-sm leading-relaxed italic">"{data.diagnostico_estrategico.analise_metodologia}"</p>
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <span className="text-primary text-[10px] uppercase font-bold block mb-1">Destaque</span>
                      <p className="text-white text-sm font-medium">{data.resumo_evolucao_texto?.destaque_progresso}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                      <span className="text-red-400 text-[10px] uppercase font-bold block mb-1">Alerta</span>
                      <p className="text-white text-sm font-medium">{data.resumo_evolucao_texto?.ponto_alerta}</p>
                  </div>
              </div>

              <div>
                  <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-primary" /> Plano Tático (Próxima Fase)
                  </h4>
                  <div className="space-y-3">
                      {data.plano_ajuste_proxima_fase?.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-3 bg-surface border border-slate-800 p-3 rounded-lg">
                              <div className="mt-1">
                                  {item.foco === 'Nutricional' && <Utensils size={16} className="text-green-400" />}
                                  {item.foco === 'Treinamento' && <Dumbbell size={16} className="text-blue-400" />}
                                  {item.foco === 'Comportamental' && <Brain size={16} className="text-purple-400" />}
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold">{item.foco}</p>
                                  <p className="text-slate-300 text-sm">{item.acao}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 italic text-slate-300 text-sm relative">
                  <Quote className="absolute top-2 right-2 text-slate-700" size={24} />
                  <span className="text-slate-500 text-xs font-bold block mb-1 not-italic">Feedback para o aluno:</span>
                  "{data.anotacoes_aluno_sugeridas}"
              </div>
          </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ClipboardList className="text-primary" size={32} /> Nova Avaliação Física
        </h1>
        <p className="text-slate-400">Registre métricas corporais e use a IA para gerar estratégia.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: INPUTS */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Seleção de Aluno */}
            <div className="bg-surface border border-slate-800 p-6 rounded-2xl">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selecione o Aluno</label>
                <div className="relative">
                    <User className="absolute left-3 top-3.5 text-primary" size={20} />
                    <select 
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white pl-10 p-3 rounded-xl focus:border-primary outline-none"
                    >
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Configuração de Metodologia */}
            <div className="bg-surface border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Settings2 size={20} className="text-purple-400" /> Metodologia de Cálculo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Calcular % Gordura por:</label>
                        <select 
                            value={formData.fatCalculationMethod}
                            onChange={(e) => setFormData({...formData, fatCalculationMethod: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg focus:border-primary outline-none"
                        >
                            <option value="Bioimpedância">Bioimpedância</option>
                            <option value="Dobras">Dobras Cutâneas (Pollock)</option>
                            <option value="Medidas">Medidas (Fita Métrica)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Referência Met. Basal:</label>
                        <select 
                            value={formData.tmbFormula}
                            onChange={(e) => setFormData({...formData, tmbFormula: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg focus:border-primary outline-none"
                        >
                            <option value="Mifflin-St Jeor">Mifflin-St Jeor (Padrão)</option>
                            <option value="Harris Benedict">Harris Benedict</option>
                            <option value="Teen Haaf">Teen Haaf (Atletas)</option>
                            <option value="Cunningham">Cunningham (Alta Massa Magra)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Métricas Principais */}
            <div className="bg-surface border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-400" /> Composição Corporal
                </h3>
                
                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-800">
                     <InputGroup label="Idade (anos)" value={formData.age} onChange={(v) => setFormData({...formData, age: v})} />
                     <InputGroup label="Altura (cm)" value={formData.height} onChange={(v) => setFormData({...formData, height: v})} />
                     <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">IMC (Auto)</label>
                        <div className="w-full bg-slate-950 border border-slate-800 text-primary font-bold p-3 rounded-lg text-center font-mono flex items-center justify-center gap-2">
                            <Calculator size={14} /> {formData.imc || '-.--'}
                        </div>
                     </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InputGroup label="Peso (kg)" value={formData.weight} onChange={(v) => setFormData({...formData, weight: v})} />
                    <InputGroup label="Gordura (%)" value={formData.bodyFat} onChange={(v) => setFormData({...formData, bodyFat: v})} />
                    <InputGroup label="Músculo (%)" value={formData.muscleMass} onChange={(v) => setFormData({...formData, muscleMass: v})} />
                    <InputGroup label="Gordura Visceral" value={formData.visceralFat} onChange={(v) => setFormData({...formData, visceralFat: v})} />
                    <InputGroup label="Idade Metabólica" value={formData.metabolicAge} onChange={(v) => setFormData({...formData, metabolicAge: v})} />
                </div>
            </div>

            {/* Medidas (Perimetria) */}
            <div className="bg-surface border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Ruler size={20} className="text-yellow-400" /> Perimetria (cm)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InputGroup label="Peitoral" value={formData.chest} onChange={(v) => setFormData({...formData, chest: v})} />
                    <InputGroup label="Braço (Dir)" value={formData.arms} onChange={(v) => setFormData({...formData, arms: v})} />
                    <InputGroup label="Cintura" value={formData.waist} onChange={(v) => setFormData({...formData, waist: v})} />
                    <InputGroup label="Abdômen" value={formData.abdomen} onChange={(v) => setFormData({...formData, abdomen: v})} />
                    <InputGroup label="Quadril" value={formData.hips} onChange={(v) => setFormData({...formData, hips: v})} />
                    <InputGroup label="Coxa (Dir)" value={formData.thighs} onChange={(v) => setFormData({...formData, thighs: v})} />
                    <InputGroup label="Panturrilha" value={formData.calves} onChange={(v) => setFormData({...formData, calves: v})} />
                </div>
            </div>

            {/* DOBRAS CUTÂNEAS (Renderização Condicional) */}
            {formData.fatCalculationMethod === 'Dobras' && (
                <div className="bg-surface border border-slate-800 p-6 rounded-2xl animate-slideUp">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Layers size={20} className="text-red-400" /> Dobras Cutâneas (mm)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InputGroup 
                            label="Peitoral" 
                            value={formData.skinFolds.chest} 
                            onChange={(v) => setFormData({...formData, skinFolds: {...formData.skinFolds, chest: v}})} 
                        />
                        <InputGroup 
                            label="Axilar Média" 
                            value={formData.skinFolds.axillary} 
                            onChange={(v) => setFormData({...formData, skinFolds: {...formData.skinFolds, axillary: v}})} 
                        />
                        <InputGroup 
                            label="Tricipital" 
                            value={formData.skinFolds.triceps} 
                            onChange={(v) => setFormData({...formData, skinFolds: {...formData.skinFolds, triceps: v}})} 
                        />
                        <InputGroup 
                            label="Subescapular" 
                            value={formData.skinFolds.subscapular} 
                            onChange={(v) => setFormData({...formData, skinFolds: {...formData.skinFolds, subscapular: v}})} 
                        />
                        <InputGroup 
                            label="Abdominal" 
                            value={formData.skinFolds.abdominal} 
                            onChange={(v) => setFormData({...formData, skinFolds: {...formData.skinFolds, abdominal: v}})} 
                        />
                        <InputGroup 
                            label="Supra-ilíaca" 
                            value={formData.skinFolds.suprailiac} 
                            onChange={(v) => setFormData({...formData, skinFolds: {...formData.skinFolds, suprailiac: v}})} 
                        />
                        <InputGroup 
                            label="Coxa" 
                            value={formData.skinFolds.thigh} 
                            onChange={(v) => setFormData({...formData, skinFolds: {...formData.skinFolds, thigh: v}})} 
                        />
                    </div>
                </div>
            )}

            {/* Botão Ação */}
            <div className="flex gap-4">
                <button 
                    onClick={handleGenerateAI}
                    disabled={generatingAI}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    {generatingAI ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                    {generatingAI ? 'Analisando dados...' : 'Gerar Análise IA'}
                </button>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary-hover text-slate-950 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                    <Save /> Salvar Avaliação
                </button>
            </div>
        </div>

        {/* COLUNA DIREITA: HISTÓRICO E PREVIEW IA */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Relatório IA */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl min-h-[300px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText size={20} className="text-slate-400" /> Relatório Estratégico
                    </h3>
                    {aiReportStrategic && <span className="text-[10px] bg-primary text-slate-950 px-2 py-0.5 rounded font-bold uppercase">Gerado</span>}
                </div>
                
                {aiReportStrategic ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {renderStrategicReport()}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-8 text-center">
                        <BrainCircuit size={48} className="mb-4 opacity-20" />
                        <p>Preencha os dados e clique em "Gerar Análise IA" para receber o relatório completo.</p>
                    </div>
                )}
            </div>

            {/* HISTÓRICO DE AVALIAÇÕES */}
            <div className="bg-surface border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <History size={20} className="text-slate-400" /> Histórico de Evolução
                </h3>
                
                {history.length === 0 ? (
                    <p className="text-slate-500 text-sm">Nenhuma avaliação anterior encontrada para este aluno.</p>
                ) : (
                    <div className="space-y-3">
                        {history.map((item, idx) => (
                            <div key={item.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors group">
                                <div>
                                    <p className="text-white font-bold text-sm flex items-center gap-2">
                                        <Calendar size={12} className="text-primary"/> {new Date(item.date).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        {item.weight}kg • {item.bodyFat}% Gordura
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleLoadAssessment(item)}
                                    className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                    title="Carregar dados desta avaliação"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
        <input 
            type="number" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg focus:border-primary outline-none text-center font-mono"
            placeholder="-"
        />
    </div>
);

export default PtAvaliacaoCorporal;