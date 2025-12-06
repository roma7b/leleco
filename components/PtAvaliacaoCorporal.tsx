import React, { useState, useEffect } from 'react';
import { Save, BrainCircuit, Activity, Ruler, User, ClipboardList, Loader2, FileText, Calculator, Settings2 } from 'lucide-react';
import { Student, Assessment } from '../types';
import { createAssessment, fetchAssessments } from '../services/db';
import { gerarRelatorioEstrategico, gerarRelatorioMotivacional } from '../services/aiAnalysis';
import { useToast } from './ToastContext';

// ----------------------------------------------------------------------------------
// --- 1. INTERFACES AUXILIARES (DEVE VIR PRIMEIRO) ---
// ----------------------------------------------------------------------------------

interface StrategicReport {
  diagnostico_estrategico: {
    risco_principal: string;
    justificativa_completa: string;
    analise_metodologia: string;
  };
  resumo_evolucao_texto: {
    eficacia_estrategia: string;
    ponto_alerta: string;
    destaque_progresso: string;
  };
  plano_ajuste_proxima_fase: { foco: string; acao: string }[];
  anotacoes_aluno_sugeridas: string;
}

// ----------------------------------------------------------------------------------
// --- 2. FUNÇÕES AUXILIARES (DEVE VIR ANTES DO COMPONENTE PRINCIPAL) ---
// ----------------------------------------------------------------------------------

// Componente para Renderizar o Relatório JSON Estruturado
const ReportDisplay: React.FC<{ reportJson: string }> = ({ reportJson }) => {
  try {
    const report: StrategicReport = JSON.parse(reportJson);

    // Função auxiliar para renderizar blocos estilizados
    const renderBlock = (title: string, content: string | string[]) => (
      <div className="mb-6 border-l-4 border-indigo-500 pl-4 bg-slate-900 p-3 rounded-lg">
        <h4 className="font-bold text-indigo-400 text-sm uppercase mb-2">{title}</h4>
        <p className="text-slate-300 text-sm">{content}</p>
      </div>
    );

    return (
      <div className="space-y-4">
        {/* Diagnóstico Estratégico */}
        <h3 className="text-xl font-bold text-white mt-4">Diagnóstico Estratégico</h3>
        {renderBlock('Risco Principal', report.diagnostico_estrategico.risco_principal)}
        {renderBlock('Análise Metodológica', report.diagnostico_estrategico.analise_metodologia)}
        
        {/* Análise de Progresso */}
        <h3 className="text-xl font-bold text-white pt-4 border-t border-slate-800">Análise de Progresso</h3>
        {renderBlock('Eficácia da Estratégia', report.resumo_evolucao_texto.eficacia_estrategia)}
        {renderBlock('Destaque Positivo', report.resumo_evolucao_texto.destaque_progresso)}

        {/* Plano de Ajuste */}
        <h3 className="text-xl font-bold text-white pt-4 border-t border-slate-800">Plano de Ajuste (Próxima Fase)</h3>
        <ul className="space-y-3">
          {report.plano_ajuste_proxima_fase.map((item, index) => (
            <li key={index} className="bg-slate-900 p-3 rounded-lg border-l-4 border-green-500">
              <strong className="text-green-400">{item.foco}:</strong> <span className="text-slate-300">{item.acao}</span>
            </li>
          ))}
        </ul>

        {/* Anotações para o Aluno */}
        <h3 className="text-xl font-bold text-white pt-4 border-t border-slate-800">Anotações Sugeridas (Resumo)</h3>
        {renderBlock('Mensagem para o Aluno', report.anotacoes_aluno_sugeridas)}
      </div>
    );
  } catch (error) {
    return (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-sm text-red-300">
            <p className="font-bold mb-2">Erro de Análise JSON da IA:</p>
            <p>O Gemini gerou um formato inválido. Tente novamente ou verifique o console.</p>
            <p className="mt-3 text-xs opacity-70">Detalhes: {reportJson.substring(0, 150)}...</p>
        </div>
    );
  }
};

// Componente de Input Auxiliar
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


// ----------------------------------------------------------------------------------
// --- 3. COMPONENTE PRINCIPAL ---
// ----------------------------------------------------------------------------------

interface PtAvaliacaoCorporalProps {
  students: Student[];
}

const PtAvaliacaoCorporal: React.FC<PtAvaliacaoCorporalProps> = ({ students }) => {
  const { showToast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [previousAssessment, setPreviousAssessment] = useState<Assessment | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    // Campos de metodologia
    fatCalculationMethod: 'Bioimpedância',
    tmbFormula: 'Mifflin-St Jeor',
    
    // Dados Biométricos Básicos
    age: '',      
    height: '',   
    imc: '',      

    // Dados numéricos
    weight: '',
    bodyFat: '',
    muscleMass: '',
    visceralFat: '',
    metabolicAge: '',
    chest: '',
    arms: '',
    waist: '',
    abdomen: '',
    hips: '',
    thighs: '',
    calves: '',
  });

  const [aiReportStrategic, setAiReportStrategic] = useState<string>('');
  const [aiReportMotivational, setAiReportMotivational] = useState<string>('');

  useEffect(() => {
    if (selectedStudentId) {
        loadHistory(selectedStudentId);
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

  const loadHistory = async (id: string) => {
      const history = await fetchAssessments(id);
      if (history.length > 0) {
          setPreviousAssessment(history[0]); // Pega a mais recente
      } else {
          setPreviousAssessment(null);
      }
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

    // Objeto de metodologia para validação da IA
    const metodologia = {
        metodo_gordura: formData.fatCalculationMethod,
        formula_tmb: formData.tmbFormula
    };

    try {
        // Chamadas às funções de IA
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

  const handleSave = async () => {
      if (!selectedStudentId) return;

      // Verificação mínima para salvar
      if (!formData.weight || !formData.age || !formData.height) {
          showToast('Preencha Peso, Idade e Altura para salvar.', 'error');
          return;
      }

      setLoading(true);
      const newAssessment: Assessment = {
          id: crypto.randomUUID(),
          studentId: selectedStudentId,
          date: new Date().toISOString(),
          
          // DADOS BÁSICOS (USADOS NO IMC)
          age: parseFloat(formData.age) || null,
          height: parseFloat(formData.height) || null,
          imc: parseFloat(formData.imc) || null,
          fatCalculationMethod: formData.fatCalculationMethod || null,
          tmbFormula: formData.tmbFormula || null,

          // DADOS ORIGINAIS
          weight: parseFloat(formData.weight) || null,
          bodyFat: parseFloat(formData.bodyFat) || null,
          muscleMass: parseFloat(formData.muscleMass) || null,
          visceralFat: parseFloat(formData.visceralFat) || null,
          metabolicAge: parseFloat(formData.metabolicAge) || null,
          chest: parseFloat(formData.chest) || null,
          arms: parseFloat(formData.arms) || null,
          waist: parseFloat(formData.waist) || null,
          abdomen: parseFloat(formData.abdomen) || null,
          hips: parseFloat(formData.hips) || null,
          thighs: parseFloat(formData.thighs) || null,
          calves: parseFloat(formData.calves) || null,

          // RELATÓRIOS (SALVOS NO BANCO PARA REFERÊNCIA FUTURA)
          strategicReport: aiReportStrategic || null,
          motivationalReport: aiReportMotivational || null
      };

      // Limpeza de NaN para evitar erros no Supabase
      Object.keys(newAssessment).forEach(key => {
          // @ts-ignore
          if (typeof newAssessment[key] === 'number' && isNaN(newAssessment[key])) {
              // @ts-ignore
              newAssessment[key] = null; 
          }
      });


      const saved = await createAssessment(newAssessment);
      if (saved) {
          showToast('Avaliação salva com sucesso!', 'success');
          setPreviousAssessment(saved);
          setAiReportStrategic('');
          setAiReportMotivational('');
      } else {
          showToast('Erro ao salvar no banco. Verifique o console.', 'error');
      }
      setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-24">
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
                
                {/* Linha de Biometria Básica */}
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

            {/* Medidas */}
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

        {/* COLUNA DIREITA: PREVIEW IA */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-full min-h-[500px] flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-slate-400" /> Relatório Estratégico
                </h3>
                
                {aiReportStrategic ? (
    <div className="flex-1 overflow-y-auto p-4 rounded-xl text-sm leading-relaxed custom-scrollbar">
        <ReportDisplay reportJson={aiReportStrategic} />
    </div>
) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-8 text-center">
                        <BrainCircuit size={48} className="mb-4 opacity-20" />
                        <p>Preencha os dados e clique em "Gerar Análise IA" para receber o relatório completo.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default PtAvaliacaoCorporal;
