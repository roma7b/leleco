
import { GoogleGenAI } from "@google/genai";

// Inicialização SEGURA do cliente Gemini
let ai: GoogleGenAI | null = null;

try {
  // process.env.API_KEY agora é garantido pelo vite.config.ts ser uma string (pode ser vazia)
  const apiKey = process.env.API_KEY || '';
  
  if (apiKey && apiKey.trim().length > 0) {
    ai = new GoogleGenAI({ apiKey: apiKey });
  } else {
    console.warn("⚠️ [Leleco App] Google Gemini API Key não detectada ou vazia. As funcionalidades de IA serão desativadas.");
  }
} catch (error) {
  console.error("Erro fatal ao tentar inicializar o cliente GoogleGenAI:", error);
}

/**
 * Gera um relatório estratégico de evolução corporal em formato JSON.
 */
export const gerarRelatorioEstrategico = async (dadosAvaliacao: any, metodologia?: any): Promise<string | null> => {
  // Guarda de segurança
  if (!ai) {
    console.error("Tentativa de uso da IA sem chave de API configurada.");
    throw new Error("Serviço de IA indisponível. Chave de API ausente ou inválida.");
  }

  try {
    const dadosCompletos = {
      ...dadosAvaliacao,
      metodologia_aplicada: metodologia || "Não especificada"
    };

    const inputData = JSON.stringify(dadosCompletos, null, 2);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        systemInstruction: `# INSTRUÇÃO DO SISTEMA: Analista Estratégico de Evolução Corporal

## 1. PAPEL E OBJETIVO
Você é um **Cientista de Dados de Saúde e Estrategista de Treinamento**. Sua função é analisar a avaliação corporal do cliente, validar a metodologia usada e gerar um plano tático.

## 2. FORMATO DE SAÍDA (OBRIGATÓRIO)
Você DEVE retornar APENAS um objeto JSON válido. Não use Markdown (\`\`\`json). Siga estritamente este schema:

{
  "diagnostico_estrategico": {
    "risco_principal": "string (ex: Obesidade Sarcopênica, Estagnação Metabólica)",
    "justificativa_completa": "string (Correlacione gordura, músculo e idade metabólica para justificar o risco)",
    "analise_metodologia": "string (Analise a 'metodologia_aplicada'. Valide se o 'metodo_gordura' (Dobras/Bioimpedância) e a 'formula_tmb' (Harris/Mifflin) são ideais para o biotipo atual do cliente. Aponte se pode haver subestimação/superestimação)"
  },
  "resumo_evolucao_texto": {
    "eficacia_estrategia": "string (Analise a qualidade da perda de peso: Gordura vs Músculo nos últimos 40-50 dias)",
    "destaque_progresso": "string (O melhor indicador)",
    "ponto_alerta": "string (O pior indicador)"
  },
  "plano_ajuste_proxima_fase": [
    { "foco": "Nutricional", "acao": "string (Ajuste prático de macros/dieta)" },
    { "foco": "Treinamento", "acao": "string (Ajuste de volume/intensidade/divisão)" },
    { "foco": "Comportamental", "acao": "string (NEAT, sono ou cardio)" }
  ],
  "anotacoes_aluno_sugeridas": "string (Frase curta e impactante para o Personal falar ao aluno)"
}
`,
      },
      contents: inputData,
    });

    return response.text || null;
  } catch (error) {
    console.error("Erro ao gerar relatório estratégico:", error);
    return null;
  }
};

/**
 * Gera um relatório motivacional e simplificado para o PAINEL DO ALUNO em formato JSON.
 */
export const gerarRelatorioMotivacional = async (dadosAvaliacao: any): Promise<string | null> => {
  // Guarda de segurança
  if (!ai) {
    console.error("Tentativa de uso da IA sem chave de API configurada.");
    throw new Error("Serviço de IA indisponível. Chave de API ausente ou inválida.");
  }

  try {
    const inputData = typeof dadosAvaliacao === 'string' 
      ? dadosAvaliacao 
      : JSON.stringify(dadosAvaliacao, null, 2);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
        systemInstruction: `# INSTRUÇÃO DO SISTEMA: Comunicador de Evolução e Motivação (Foco no Cliente)

## 1. PAPEL E OBJETIVO
Você é um **Coach Motivacional e Educador de Saúde** empático. Seu objetivo é traduzir a avaliação corporal técnica em uma mensagem clara, inspiradora e acionável para o aluno.

## 2. FORMATO DE SAÍDA (OBRIGATÓRIO)
Você DEVE retornar APENAS um objeto JSON válido. Não use Markdown. Siga estritamente este schema:

{
  "titulo_motivacional": "string (Um título curto e enérgico, ex: 'Grande evolução, [Nome]!')",
  "conquistas_recentes": "string (Reconheça a perda de gordura/medidas e traduza para a vida real: roupas, energia)",
  "foco_principal_traduzido": "string (Traduza o diagnóstico técnico para linguagem simples. Ex: 'Seu motor precisa de mais potência (músculos)')",
  "objetivos_proxima_fase": [
    { "area": "Treino", "acao": "string (Comando simples do que priorizar)" },
    { "area": "Alimentação", "acao": "string (Ajuste dietético em linguagem simples)" },
    { "area": "Hábito", "acao": "string (Mudança de rotina, ex: passos, sono)" }
  ],
  "mensagem_final": "string (Frase de encerramento motivadora)"
}`,
      },
      contents: inputData,
    });

    return response.text || null;
  } catch (error) {
    console.error("Erro ao gerar relatório motivacional:", error);
    return null;
  }
};
