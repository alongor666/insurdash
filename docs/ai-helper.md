# 模块文档：AI辅助分析

- **组件路径(s)**: `src/components/dashboard/ai-analysis-modal.tsx`, `src/lib/ai-text-generator.ts`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
为用户提供一个快速生成结构化分析材料的功能，以提升与大语言模型（LLM）的协作效率。用户点击按钮，即可获得一份包含完整上下文、数据表格和分析指令的Markdown文本。

## 2. 数据源与模型
- **输入**:
  - `chart`: 当前激活的图表类型 (e.g., "trend", "donut")。
  - `state`: 来自全局状态管理 `DashboardContext` 的当前筛选条件。
  - `processedData`: 当前周期和对比周期的完整计算后数据。
  - `trendData`: 用于趋势类图表的历史数据。
  - `chartSpecificState`: 特定图表自身的配置（如占比分析中选择的内外环指标）。
- **输出**: 一个格式化好的Markdown字符串。

## 3. 核心功能与交互逻辑
### 3.1. 触发与内容生成
- **触发**: 用户在任意图表卡片的右上角点击“AI分析”（Sparkles图标）按钮。
- **内容生成**: 点击后，`generateAiAnalysisText` 函数被调用。它会动态地、结构化地生成一段精心设计的Markdown文本。
- **结构化内容**: 生成的文本包含四个核心部分：
    1.  **分析背景**: 包含当前周期、对比周期、分析模式、业务范围等，为AI提供完整的上下文。
    2.  **核心指标看板**: 将主界面的16个KPI指标数据，格式化为一个易于阅读的Markdown表格。
    3.  **图表详细数据**: 将当前激活的图表所使用的数据，同样格式化为一个Markdown表格。
    4.  **AI分析指令**: 一段预设的、优化过的提示词（Prompt），指导AI基于以上信息生成一份专业的分析报告。

### 3.2. 模态框交互
- **显示**: 生成的文本会显示在一个弹出的模态对话框 (`AiAnalysisModal`) 中。
- **操作**: 对话框提供“一键复制”和“全选”按钮，方便用户将内容快速粘贴到Kimi, Gemini, ChatGPT等外部工具中。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 本模块的实现，是对 `PRD.md §7` 中所有图表模块通用功能（F-REQ-08）的落地。
- **与其他模块的交互**:
  - **被依赖**: 被所有图表子模块调用 (e.g., `chart-trend.md`, `chart-ratio.md` 等)。
  - **依赖**: 
    - `data-pipeline.md`: 依赖其提供的 `getComparisonMetrics` 和 `formatKpiValue` 工具函数来格式化表格。
    - `dashboard-context.md`: 依赖其提供的全局筛选状态。

## 5. 修改与维护指南
- **修改提示词 (Prompt)**: 如果需要调整给AI的分析指令，应直接修改 `src/lib/ai-text-generator.ts` 文件末尾的模板字符串。
- **新增图表支持**: 如果未来新增图表，需要在 `generateAiAnalysisText` 函数中为其增加特定的数据表格生成逻辑。
- **风险点**: 确保所有KPI ID与 `kpi-config.ts` 保持一致，否则可能导致数据表格生成错误。
