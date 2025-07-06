
# 模块文档：图表 - 占比分析

- **组件路径(s)**: `src/components/dashboard/charts/ratio-chart.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
采用创新的**内外双环饼图**结构，允许用户选择两个不同的指标分别作为内外环，直观地对比各项业务在两个指标构成上的差异和联系。例如，可以对比“跟单保费”和“总赔款”的占比，快速发现“赔付贡献”远大于“保费贡献”的高风险业务。

## 2. 数据源与模型
- **输入**:
  - `data` (类型为 `ProcessedBusinessData[]`)，包含所有业务线的数据。
  - `outerMetric`, `innerMetric`: 用户为内外环选择的 `KpiKey` 或 `'none'`。
- **派生数据**: `chartData`，根据 `outerMetric` 或 `innerMetric` 对数据进行排序，并为每个业务线计算出用于图表扇区着色的 `color`。
- **核心组件**:
  - `DonutChart`: 渲染双环饼图。
  - `LegendTable`: 渲染与图表联动的、带智能着色的图例表格。

## 3. 核心功能与交互逻辑
### 3.1. 指标选择
- **交互**: 父组件 `ChartsSection` 提供两个独立的下拉选择器，分别用于选择**外环**和**内环**的KPI。可选指标被限定为数值型的KPI (`DONUT_PARETO_KPI_IDS`)。
- **逻辑**: 用户可以选择“无”，此时图表会优雅地降级为单环饼图。

### 3.2. 图表渲染
- **组件**: 使用 Recharts 的 `PieChart` 组件，通过渲染两个 `Pie` 元素（具有不同的内外半径）来实现双环效果。
- **排序与颜色**: 图表数据和图例默认按照**外环指标**的值从高到低排序。每个扇区的颜色由其自身的 `variable_cost_ratio` 决定。
- **交互**: 鼠标悬浮在扇区上会显示一个Tooltip，展示业务线名称和指标的精确值。

### 3.3. 动态图例 (`LegendTable`)
- **布局**: 图表区与图例区左右分栏布局，提供清晰的对照关系。
- **智能着色**: 这是本模块的核心亮点。图例不仅显示各业务线在内外环指标上的**贡献百分比**，还会通过 `getDynamicColorForDonutLegend` 函数进行智能着色。例如，当对比“跟单保费”和“总赔款”时，如果某个业务的赔款占比远高于其保费占比，其赔款百分比会显示为警示性的红色，高亮风险。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 扇区颜色逻辑遵循 `PRD.md §6` 中定义的“动态风险色”系统。
- **与其他模块的交互**:
  - **依赖**:
    - `data-pipeline.md`: 依赖其提供的 `formatKpiValue` 函数和 `KPIS` 配置。
    - `Global UI`: 依赖其颜色系统 (`getDynamicColorByVCR`, `getDynamicColorForDonutLegend`)。
    - `dashboard-context.md` (间接): 父组件从Context获取数据。

## 5. 修改与维护指南
- **修改可选指标**: 可选的KPI列表由 `src/lib/kpi-config.ts` 中的 `DONUT_PARETO_KPI_IDS` 定义。
- **调整图例着色逻辑**: 智能着色的规则定义在 `src/lib/colors.ts` 的 `getDynamicColorForDonutLegend` 函数中，可在此处调整触发高亮的阈值或颜色。
- **调整环图半径**: 内外环的半径直接在 `Pie` 组件的 `innerRadius` 和 `outerRadius` props 中定义，可以轻松修改。
