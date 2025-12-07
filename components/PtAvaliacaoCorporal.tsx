import React, { useState, useEffect } from 'react';
import { Save, BrainCircuit, Activity, Ruler, User, ClipboardList, Loader2, FileText, Calculator, Settings2, AlertTriangle, CheckCircle2, Utensils, Dumbbell, Brain, Quote, History, Target, Layers, Calendar, ChevronRight } from 'lucide-react';
import { Student, Assessment } from '../types';
import { createAssessment, fetchAssessments } from '../services/db';
import { gerarRelatorioEstrategico, gerarRelatorioMotivacional } from '../services/aiAnalysis';
import { useToast } from './ToastContext';

// ----------------------------------------------------------------------------------
// --- 1. FUNÇÕES AUXILIARES (DEFINIDAS NO TOPO PARA EVITAR ERROS DE COMPILAÇÃO) ---
// ----------------------------------------------------------------------------------

// Função auxiliar para garantir que valores vazios ou inválidos sejam nulos (Supabase)
const safeFloat = (value: string): number | any => {
    if (!value || value.trim() === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
};

// Parser para limpar e transformar a string JSON da IA em objeto
const parseAIJson = (jsonString: string) => {
    try {
        const cleanString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanString);
    } catch (e) {
        return null;
    }
};

// Componente para a Linha de Input
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
// --- 2. COMPONENTE PRINCIPAL ---
// ----------------------------------------------------------------------------------

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
        skin
