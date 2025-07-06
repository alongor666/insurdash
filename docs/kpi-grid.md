
# 模块文档：KPI核心指标看板

- **组件路径(s)**: `src/components/dashboard/kpi-card-grid.tsx`, `src/components/dashboard/kpi-card.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
在主界面以一个4x4的网格布局，通过16张独立的卡片，直观地展示所有核心业务指标的当前值，并与对比周期进行比较，快速揭示变化趋势。

## 2. 数据源与模型
### 2.1. `KpiCardGrid.tsx`
- **输入**: `processedData` (类型为 `DashboardData`)，从全局Context获取。
- **核心逻辑**:
  - 严格按照 `src/lib/kpi-config.ts` 中定义的 `KPI_GRID_LAYOUT` 数组来循环渲染16个 `KpiCard` 组件。
  - 从 `processedData.summary` 中提取每个KPI的当前周期值 (`current.kpis[kpiId]`) 和对比周期值 (`compare.kpis[kpiId]`)，并传递给 `KpiCard`。

### 2.2. `KpiCard.tsx`
- **输入**:
  - `kpiId`: 当前卡片对应的 `KpiKey`。
  - `title`: 指标名称。
  - `value`: 当前周期数值。
  - `previousValue`: 对比周期数值。
  - `unit`: 指标单位。
- **核心逻辑**:
  - 调用 `getComparisonMetrics` 函数，计算出当前值与对比值的差异（绝对值和百分比）。
  - 根据 `getComparisonMetrics` 返回的结果（`isBetter`, `isZero`, `isNew`），以及KPI本身定义的好坏趋势，决定显示的图标（向上/向下箭头）和颜色（绿色/红色）。

## 3. 核心功能与交互逻辑
### 3.1. 对比分析的视觉呈现
这是 `KpiCard` 的核心。
- **内容格式**: 对比文本同时包含**绝对值变化**和**百分比变化**。
  - 如果指标单位是百分比 (`%`)，绝对值变化会以百分点 (`p.p.`) 为单位显示。
- **图标与颜色逻辑 (分工明确)**:
  - **图标 (`Icon`)**: **只反映数值的物理变化方向**。增加则显示向上箭头 (↑)，减少则显示向下箭头 (↓)。
  - **颜色 (`Color`)**: **只反映该变化对业务的利好程度**。根据 `kpi-config.ts` 中定义的 `positiveChangeIs` 属性，如果指标向好（如利润增长、成本下降），文本显示为绿色；如果向差，则显示为红色。
- **边界情况**: 
  - 如果对比周期无数据而当前周期有数据，显示 `新增`。
  - 如果两个周期的值完全相等，显示 `无变化`。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 卡片中的颜色逻辑严格遵循 `PRD.md §6` 中定义的“绩效指示色”系统。
- **与其他模块的交互**:
  - **依赖**:
    - `dashboard-context.md`: 依赖其提供的 `processedData`。
    - `data-pipeline.md`: 强依赖其 `getComparisonMetrics`, `formatKpiValue` 函数和 `KPIS` 配置。
    - `Global UI`: 依赖其 `Card` 组件。

## 5. 修改与维护指南
- **修改KPI卡片布局**: 直接编辑 `src/lib/kpi-config.ts` 中的 `KPI_GRID_LAYOUT` 数组即可调整卡片的顺序或位置。
- **修改对比分析文本格式**: 对比文本的拼接逻辑在 `KpiCard.tsx` 组件内，可以根据需要调整。
- **修改好坏趋势定义**: KPI的好坏趋势（增长为优或下降为优）在 `src/lib/kpi-config.ts` 中定义，修改 `positiveChangeIs` 属性即可改变颜色的判断逻辑。
