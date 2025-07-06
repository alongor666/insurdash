
# 模块文档：图表 - 贡献度分析

- **组件路径(s)**: `src/components/dashboard/charts/contribution-chart.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
对比两个核心指标的**“当周贡献度”**（即 `当周发生值 / 当期累计值`）的变化趋势，以评估业务增长的质量与结构。例如，可以对比“跟单保费贡献度”和“总赔款贡献度”，看保费增长是否带来了不成比例的赔款增长。

## 2. 数据源与模型
- **输入**:
  - `data`: 类型为 `TrendData[]` 的历史数据数组。
  - `kpi1`, `kpi2`: 用户选择的两个 `KpiKey`。
- **核心计算**: `当周贡献度 = (当周发生值 / 当期累计值) * 100`
  - 当周发生值来自 `TrendData` 中的 `pop_kpis`。
  - 当期累计值来自 `TrendData` 中的 `ytd_kpis`。
- **派生数据**: `chartData`，通过 `useMemo` hook 对输入的 `data` 进行二次计算，为每个周期生成 `kpi1Share` 和 `kpi2Share` 两个百分比值。

## 3. 核心功能与交互逻辑
### 3.1. 指标选择
- **交互**: 其父组件 `ChartsSection` 提供两个独立的下拉选择器，允许用户选择任意两个数值型的核心KPI（限定于 `DONUT_PARETO_KPI_IDS`）进行对比分析。
- **逻辑**: 父组件的状态（`contributionKpi1`, `contributionKpi2`）更新后，作为props传递给本组件，触发图表重渲染。

### 3.2. 图表渲染
- **组件**: 使用 Recharts 的 `LineChart` 组件，渲染两条独立的折线。
- **折线**:
  - 第一条折线 (`kpi1Share`) 代表第一个所选指标的贡献度趋势。
  - 第二条折线 (`kpi2Share`) 代表第二个所选指标的贡献度趋势。
- **Y轴**: 刻度单位固定为百分比 (`%`)。

### 3.3. 数据洞察 (Tooltip)
- **交互**: 鼠标悬浮在图表上时，会显示一个自定义的工具提示框 (`CustomTooltip`)。
- **内容**: 提示框会显示周期名称，以及用户选择的两个KPI各自在该周期的“当周贡献度”百分比，方便用户进行精准比较。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 本模块是 `PRD.md §7` 中定义的核心功能 F-REQ-10 的具体实现。
- **与其他模块的交互**:
  - **依赖**:
    - `data-pipeline.md`: 依赖其提供的 `formatKpiValue` 函数和 `KPIS` 配置。
    - `dashboard-context.md` (间接): 其父组件 `ChartsSection` 从Context获取数据并传递给它。

## 5. 修改与维护指南
- **修改可选指标**: 可选的KPI列表由 `src/lib/kpi-config.ts` 中的 `DONUT_PARETO_KPI_IDS` 定义。修改该数组即可变更下拉菜单中的选项。
- **计算逻辑**: 核心的“贡献度”计算逻辑在组件内的 `useMemo` 和 `safeDivide` 函数中，非常清晰，易于审计和修改。
- **风险点**: 如果分母（当期累计值）为0或负数，可能导致计算结果无意义。`safeDivide` 函数已处理了分母为0的情况，但未处理负数，在数据异常时需注意。
