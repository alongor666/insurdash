
# 模块文档：全局筛选器

- **组件路径(s)**: `src/components/dashboard/global-filters.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
在仪表盘顶部提供一个全局筛选器，其设置将同步应用于下方所有的KPI卡片、图表和数据表，实现数据的联动分析。该组件在页面向下滚动时会“粘性”地固定在顶部，确保随时可用。

## 2. 数据源与模型
- **输入**:
  - `periods`: `{ id, name }[]` - 从 `DashboardContext` 传入的周期列表。
  - `businessTypes`: `string[]` - 从 `DashboardContext` 传入的业务类型列表。
- **全局状态交互**:
  - **消费**: `currentPeriod`, `comparePeriod`, `analysisMode`, `selectedBusinessTypes`。
  - **派发**: `setPeriod`, `setComparePeriod`, `setAnalysisMode`, `setSelectedBusinessTypes`。
- **内部状态**:
  - `isOpen`: 控制业务类型选择浮层是否打开。
  - `tempSelection`: 临时存储用户在浮层中勾选的业务类型，在点击“确认”前不影响全局状态。
  - `searchQuery`: 业务类型搜索框的输入值。

## 3. 核心功能与交互逻辑
### 3.1. 周期选择
- **组件**: 两个独立的 `Select` 下拉菜单，分别用于“当前周期”和“对比周期”。
- **逻辑**: 选择后，直接调用 `setPeriod` 或 `setComparePeriod` 更新全局状态，立即触发整个仪表盘的数据重算。

### 3.2. 分析模式切换
- **组件**: 一个 `Switch` 开关。
- **逻辑**: 在“累计(YTD)”和“当周(PoP)”之间切换。切换后，调用 `setAnalysisMode` 更新全局状态，立即触发数据重算。

### 3.3. 业务类型筛选 (多选弹出框)
这是最复杂的交互部分。
- **触发**: 点击“N个已选”按钮，会弹出一个浮层 (`Popover`)。
- **临时状态**: 在浮层中进行的所有操作（勾选、搜索、全选等）都只修改`tempSelection`状态，**不会**立即影响仪表盘。这确保了用户可以自由探索，而不会导致频繁的数据重算。
- **搜索与过滤**: 浮层顶部提供一个搜索框，用户可以输入关键字来实时过滤下方的业务类型列表。
- **快捷操作**: 提供“全选”、“反选”、“清空”按钮，方便用户快速操作。
- **确认与取消**:
  - 点击**“确认”**按钮：调用 `setSelectedBusinessTypes(tempSelection)`，将临时选择应用到全局状态，此时才会触发整个仪表盘的数据重算。
  - 点击**“取消”**按钮：放弃在浮层中所做的任何修改，关闭浮层，全局状态保持不变。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 本模块是 `PRD.md §7` 中定义的核心功能 F-REQ-05 的具体实现。
- **与其他模块的交互**:
  - **依赖**:
    - `dashboard-context.md`: 强依赖，是该Context的主要交互者。

## 5. 修改与维护指南
- **修改默认筛选值**: 默认值在 `src/app/page.tsx` 中初始化 `DashboardState` 时设定。
- **调整业务类型筛选交互**: 弹出框内的所有逻辑都在 `GlobalFilters.tsx` 中，包括快捷操作按钮的实现。
- **风险点**: 业务类型筛选的“反选”逻辑相对复杂，因为它需要知道哪些项当前在搜索结果中可见。修改时需要仔细测试边界情况。
