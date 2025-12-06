import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gera um relatório estratégico de evolução corporal baseado nos dados da avaliação.
 * @param dadosAvaliacao Objeto ou string contendo os dados brutos da avaliação e histórico.
 * @returns String em formato Markdown com a análise.
 */
export const gerarRelatorioEstrategico = async (dadosAvaliacao: any): Promise<string | null> => {
  try {
    // Garante que os dados sejam uma string para o prompt
    const inputData = typeof dadosAvaliacao === 'string' 
      ? dadosAvaliacao 
      : JSON.stringify(dadosAvaliacao, null, 2);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Modelo de alta capacidade para raciocínio complexo
      config: {
        temperature: 0.3, // Baixa temperatura para maior precisão técnica
        systemInstruction: `# INSTRUÇÃO DO SISTEMA: Analista Estratégico de Evolução Corporal (Personal Trainer)

## 1. PAPEL E OBJETIVO
Você é um **Cientista de Dados de Saúde e Estrategista de Treinamento**. Sua função é analisar a última avaliação comparando-a com o período anterior (aproximadamente 40-50 dias) para validar a eficácia da estratégia e determinar os ajustes necessários. O foco é fornecer inteligência acionável ao Personal Trainer.

## 2. FORMATO E ESTRUTURA DA SAÍDA
Gere a análise estritamente no formato Markdown, dividida em quatro seções obrigatórias:

### I. Análise de Progresso (40-50 dias)

* Eficácia da Estratégia: Avalie a qualidade da perda de peso no último período. Foco na proporção entre perda de gordura vs. mudança no músculo esquelético.
* Destaque do Progresso: Identifique o indicador que teve o melhor resultado.
* Ponto de Alerta: Identifique o indicador que teve a pior evolução ou estagnação.

### II. Diagnóstico Estratégico (Baseado nos Dados Atuais)

* Qual é o Desequilíbrio Corporal Principal do cliente (ex: Obesidade Sarcopênica)?
* Correlacione os indicadores que justificam esse diagnóstico.
* Analise a Idade Corporal e relacione a diferença com a idade cronológica.

### III. Plano de Ajuste para a Próxima Fase (3 Focos)

Liste 3 ajustes estratégicos específicos para os próximos 40-50 dias:
* 1. Foco Nutricional (Ajuste de Macro).
* 2. Foco no Treinamento (Ajuste de Prioridade).
* 3. Foco Comportamental/Metabólico.

### IV. Anotações Sugeridas para o Aluno

* Crie uma frase curta e motivacional de até 2 linhas para o Personal Trainer usar.`,
      },
      contents: inputData,
    });

    return response.text || null;
  } catch (error) {
    console.error("Erro ao gerar relatório estratégico:", error);
    return null;
  }
};