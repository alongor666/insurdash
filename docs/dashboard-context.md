# 模块文档：全局状态管理 (Dashboard Context)

- **组件路径(s)**: `src/hooks/use-dashboard.ts`, `src/app/page.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
为整个仪表盘应用提供一个集中、统一的状态管理解决方案。通过React Context API，将全局筛选条件、处理后的数据、以及更新状态的方法，高效地传递给所有需要它们的子组件，避免了繁琐的props逐层传递。

## 2. 数据源与模型
### 2.1. 核心状态 (`DashboardState`)
- `periods`: { id, name }[] - 周期列表
- `businessTypes`: string[] - 业务类型列表
- `currentPeriod`: string - 当前选定周期ID
- `comparePeriod`: string - 当前对比周期ID
- `analysisMode`: 'ytd' | 'pop' | 'comparison' - 分析模式
- `selectedBusinessTypes`: string[] - 选定的业务类型
- `processedData`: DashboardData | null - 已处理的、用于渲染UI的数据
- `trendData`: TrendData[] - 用于趋势图的历史数据
- `loading`: boolean - 是否正在加载数据
- `isReady`: boolean - 初始化（获取筛选选项）是否完成

### 2.2. 核心操作 (`DashboardActions`)
- `setPeriod(periodId)`
- `setComparePeriod(periodId)`
- `setAnalysisMode(mode)`
- `setSelectedBusinessTypes(types)`

## 3. 核心功能与交互逻辑
### 3.1. Context的提供 (`src/app/page.tsx`)
- `DashboardPage` 组件是本Context的**提供者 (Provider)**。
- **初始化**: 组件首次加载时 (`useEffect` with `user` dependency)，会调用 `getFilterOptions` 获取周期和业务类型列表，并根据URL参数或默认值设置初始筛选状态，将 `isReady` 设为 `true`。
- **数据获取**: 当筛选条件（如周期、业务线、分析模式等）发生变化时，另一个 `useEffect` hook 会被触发。它会：
  1.  将 `loading` 设为 `true`。
  2.  根据当前 `analysisMode` 智能地获取所有必需的原始数据（例如，在'pop'模式下，会获取当前周期、上个周期和上上个周期的数据）。
  3.  调用 `processDashboardData` 和 `processTrendData` 对原始数据进行计算和处理。
  4.  将处理后的数据更新到state中。
  5.  将 `loading` 设为 `false`。
- **URL同步**: 还有一个 `useEffect` 负责将当前的筛选状态同步到URL的查询参数中，以便分享和刷新。

### 3.2. Context的消费 (`useDashboard`)
- 任何需要访问或修改全局状态的子组件，都可以通过调用 `useDashboard()` hook 来获取 `state`, `actions`, `loading`, `isReady`。
- 例如，`GlobalFilters` 组件调用 `actions` 中的方法来更新筛选条件，而 `KpiCardGrid` 和图表组件则消费 `state` 中的 `processedData` 来渲染UI。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 本模块是整个应用数据驱动理念的实现核心。
- **与其他模块的交互**:
  - **被依赖**:
    - `global-filters.md`: 强依赖，消费并调用actions。
    - 所有图表模块 (`chart-*.md`): 强依赖，消费state中的数据。
    - `kpi-grid.md`, `data-table.md`: 强依赖，消费state中的数据。
  - **依赖**: 
    - `data-pipeline.md`: 强依赖，调用其数据获取和处理函数。

## 5. 修改与维护指南
- **新增筛选条件**:
  1.  在 `src/lib/types.ts` 中的 `DashboardState` 添加新状态。
  2.  在 `src/app/page.tsx` 中添加对应的 `useState` 和更新逻辑。
  3.  在 `actions` 对象中暴露一个新的更新函数。
- **风险点**: `src/app/page.tsx` 中的 `useEffect` 依赖数组是本模块最复杂、最容易出错的地方。对依赖项的任何修改都可能导致无限循环或数据更新不及时，需要谨慎测试。
