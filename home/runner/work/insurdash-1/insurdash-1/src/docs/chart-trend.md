# 模块文档：图表 - 趋势分析

- **组件路径(s)**: `src/components/dashboard/charts/trend-chart.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
追踪单个核心指标在连续时间周期内的表现，并支持在“绝对值”和“周增长率”两种维度间切换，以进行全面的趋势分析。

## 2. 数据源与模型
- **输入**: `data` (类型为 `TrendData[]`)，包含从当前周期往前最多15个周期的历史数据点。
- **内部状态**: `selectedKpi`，存储用户选择的 `KpiKey`。
- **全局状态依赖**: 从 `useDashboard` hook 中读取 `analysisMode` (`ytd` 或 `pop`) 来决定是显示累计值还是当周发生值。

## 3. 核心功能与交互逻辑
### 3.1. 指标选择
- **交互**: 图表顶部提供一个下拉选择器 (`Select`)，允许用户选择任意一个核心KPI进行分析。
- **逻辑**: 选择新KPI会更新 `selectedKpi` 状态，触发图表重渲染。

### 3.2. 智能图表切换
- **逻辑**: 图表会根据所选指标的类型自动切换渲染方式，提供最佳可视化效果。
  - 若选择的指标类型为 `ratio` 或 `average` (如“边际贡献率”)，则渲染为**折线图 (`LineChart`)**。
  - 若选择的指标类型为 `amount` 或 `count` (如“跟单保费”)，则渲染为**条形图 (`BarChart`)**。
- **条形图颜色**: 条形图的颜色根据当周的`variable_cost_ratio`动态变化，遵循全局风险色系统。

### 3.3. 数据洞察 (Tooltip)
- **交互**: 鼠标悬浮在图表上时，会显示一个信息丰富的自定义工具提示框 (`CustomTooltip`)。
- **内容**: 提示框包含：
  - 周期名称。
  - 用户当前选择的KPI的精确值（区分“当周”或“累计”）。
  - **额外上下文**: 无论用户选择哪个指标，提示框中都会额外展示该周期的**“变动成本率”**和**“边贡额”**，以提供更丰富的分析维度。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 条形图颜色逻辑严格遵循 `PRD.md §6` 中定义的“动态风险色”系统。
- **与其他模块的交互**:
  - **依赖**:
    - `data-pipeline.md`: 依赖其提供的 `formatKpiValue` 函数和 `KPIS` 配置。
    - `Global UI`: 依赖其颜色系统 (`getDynamicColorByVCR`)。
    - `dashboard-context.md`: 依赖其提供的 `analysisMode` 来决定显示的数据集。

## 5. 修改与维护指南
- **修改趋势周期长度**: 获取历史数据的周期数在 `src/app/page.tsx` 调用 `getRawDataForTrend` 函数时写死为 `15`。可在此处修改。
- **修改智能切换逻辑**: 图表类型切换的判断逻辑在 `TrendChart.tsx` 的JSX渲染部分，可以根据需要调整 `type === 'ratio' || type === 'average'` 的条件。
