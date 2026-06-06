export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface SuggestionResult {
  content: string;
  source: 'llm' | 'knowledge-base';
}

const MOCK_SUGGESTIONS: Record<string, string> = {
  '5G用户渗透率':
    '当前 5G 用户渗透率已超过基线值 95%，达到 97%。建议：1）检查数据源是否准确，排除统计口径差异；2）评估是否需要上调基线阈值至 98%；3）关注下游指标「5G流量占比」和「移动业务收入」的联动变化。',
  网络故障率:
    '网络故障率当前 3.2%，较基线 2.5% 上升 28%。建议：1）排查近期网络割接或升级操作记录；2）重点监控「网络负荷」指标，确认是否触发扩容需求；3）参考《网络质量监控指南》中的故障分级处置流程。',
  '5G流量占比':
    '5G 流量占比当前 45%，较基线 42% 小幅上升。建议：1）确认流量增长是否由用户行为变化（如视频业务增长）驱动；2）关注「网络负荷」指标，评估是否需要提前扩容；3）持续观察趋势，若持续上升可考虑调整基线。',
  宽带续费率:
    '宽带续费率当前 82%，低于基线 85%。建议：1）分析流失用户特征，识别高流失风险群体；2）检查近期竞争对手促销动作；3）参考《宽带业务规范》中的续费策略建议。',
};

function generateFallbackSuggestion(
  indicatorName: string,
  hitRules: string[],
  docs: KnowledgeDoc[]
): string {
  // 优先使用预设的 mock 建议
  const preset = MOCK_SUGGESTIONS[indicatorName];
  if (preset) return preset;

  // 否则基于知识库和命中规则生成通用建议
  const docSummaries = docs
    .filter((d) => d.summary)
    .map((d) => `• ${d.title}：${d.summary}`)
    .join('\n');

  const ruleHints = hitRules.length > 0 ? `命中规则：${hitRules.join('、')}` : '';

  return [
    `针对「${indicatorName}」的异常，建议采取以下措施：`,
    ruleHints,
    docSummaries || '暂无相关知识库文档匹配。',
    '建议联系相关业务部门进一步核实数据准确性。',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * 生成处置建议。
 * 优先调用 DeepSeek API；若 API key 缺失或调用失败，fallback 到知识库摘要。
 */
export async function generateSuggestion(
  indicatorName: string,
  hitRules: string[],
  knowledgeDocs: KnowledgeDoc[]
): Promise<SuggestionResult> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  // 无 API key 时直接 fallback
  if (!apiKey) {
    return {
      content: generateFallbackSuggestion(indicatorName, hitRules, knowledgeDocs),
      source: 'knowledge-base',
    };
  }

  const prompt = `你是数据指标异常分析专家。

指标：${indicatorName}
命中异常规则：${hitRules.join('、') || '无'}

请基于以下知识库文档，给出 2~3 条具体的处置建议（每条不超过 50 字）：
${knowledgeDocs.map((d) => `- ${d.title}：${d.summary}`).join('\n')}

只输出建议内容，不要输出解释。`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是数据指标异常分析专家，擅长给出简洁可执行的处置建议。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from DeepSeek API');
    }

    return { content, source: 'llm' };
  } catch {
    return {
      content: generateFallbackSuggestion(indicatorName, hitRules, knowledgeDocs),
      source: 'knowledge-base',
    };
  }
}
