# 模块文档：详细数据表

- **组件路径(s)**: `src/components/dashboard/data-table.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
在仪表盘底部提供一个完整的、可交互的表格，展示所有业务线在全部核心指标上的详细数据，作为图表的可视化补充和数据审计的工具。

## 2. 数据源与模型
- **输入**: `processedData` (类型为 `DashboardData`)，从全局Context获取。表格主要使用其中的 `byBusinessType` 数组。
- **内部状态**:
  - `isOpen`: 布尔值，控制表格是否展开或折叠。
  - `sortConfig`: `{ key, direction }` 对象，存储当前的排序列和排序方向。

## 3. 核心功能与交互逻辑
### 3.1. 折叠与展开
- **交互**: 用户点击表格标题栏右侧的“展开/收起”按钮 (`CollapsibleTrigger`)。
- **逻辑**: 切换 `isOpen` 状态，`CollapsibleContent` 会根据状态带动画地显示或隐藏表格内容。

### 3.2. 动态排序
- **交互**: 所有指标列的**表头都可以点击**进行排序。
- **逻辑**:
  1.  点击表头会调用 `requestSort(kpiId)` 函数。
  2.  该函数会更新 `sortConfig` 状态。逻辑是：首次点击按升序排 -> 再次点击同一列切换为降序。
  3.  `useMemo` hook 会在 `sortConfig` 变化时，对 `processedData.byBusinessType` 数组进行重新排序，生成 `sortedData`。
  4.  表格根据 `sortedData` 重新渲染。
- **视觉反馈**: 当前排序列的表头会显示一个向上或向下的箭头图标，以指示排序状态。

### 3.3. 横向滚动与固定列
- **布局**: 当表格内容超出屏幕宽度时，会自动出现横向滚动条 (`ScrollArea`)。
- **固定列**: 为了在横向滚动时保持可读性，“业务类型”这一列通过 `sticky` 定位和 `z-index` 实现了列固定效果。

### 3.4. 单元格着色
- **逻辑**: 对于特定的比率型KPI（如“变动成本率”、“费用率”等），单元格的文本颜色会根据其数值，通过 `getDynamicColorByVCR` 函数动态计算得出，与图表中的风险颜色保持一致。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 单元格着色逻辑遵循 `PRD.md §6` 中定义的“动态风险色”系统。
- **与其他模块的交互**:
  - **依赖**:
    - `dashboard-context.md`: 依赖其提供的 `processedData`。
    - `data-pipeline.md`: 依赖其 `formatKpiValue` 函数和 `KPIS` 配置。
    - `Global UI`: 依赖其颜色系统 (`getDynamicColorByVCR`) 和UI组件 (`Table`, `Collapsible` 等)。

## 5. 修改与维护指南
- **修改默认排序列**: 直接修改 `sortConfig` 的 `useState` 初始值即可。
- **调整固定列样式**: 固定列的背景色和z-index在 `TableCell` 和 `TableHead` 的 `className` 中定义，可以按需调整。
- **性能**: 如果业务线或KPI列非常多，可以考虑使用虚拟化表格库（如 `TanStack Table`）进行性能优化。
