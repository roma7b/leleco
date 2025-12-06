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

// Componente de Input Auxiliar (Movido para o topo)
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
                <h3 className="text-lg font-bold
