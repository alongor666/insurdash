
# 模块文档：主应用外壳

- **组件路径(s)**: `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/dashboard/header.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
定义应用的顶层结构和布局，为所有页面提供一致的“外壳”，并管理核心的页面路由和状态提供者。

## 2. 数据源与模型
- **`layout.tsx`**: 不直接处理数据，但负责包裹 `AuthProvider`，为所有子组件提供认证上下文。
- **`page.tsx`**: 作为客户端根组件，负责初始化 `DashboardContext`，并将全局状态和数据通过Context提供给所有子组件。
- **`header.tsx`**: 接收来自 `useAuth` hook 的 `user` 对象，用于显示用户信息和执行登出操作。

## 3. 核心功能与交互逻辑
### 3.1. 根布局 (`layout.tsx`)
- **功能**: 这是应用的入口布局，定义了HTML文档的基本结构（`<html>`, `<body>`）。
- **核心逻辑**: 
  - 引入全局CSS (`globals.css`) 和字体。
  - 将 `AuthProvider` 作为根提供者，确保整个应用都能访问认证状态。
  - 渲染 `Toaster` 组件，为全局通知提供容器。

### 3.2. 仪表盘页面 (`page.tsx`)
- **功能**: 承载整个仪表盘主页面的内容，是所有数据可视化模块的容器。
- **核心逻辑**:
  - **状态管理**: 它是 `DashboardContext.Provider` 的所在地。它负责调用 `getFilterOptions` 和 `getRawDataForPeriod` 等函数，获取原始数据，然后通过 `processDashboardData` 进行处理，最后将所有状态（如周期列表、处理后的数据、加载状态等）注入到Context中。
  - **加载状态**: 在数据获取和处理期间，会显示一个全局的加载指示器（`Loader2`），提供良好的用户反馈。
  - **组件编排**: 按照 `Header` -> `GlobalFilters` -> `KpiCardGrid` -> `ChartsSection` -> `DataTable` 的顺序，将所有核心UI模块组合在一起。

### 3.3. 顶部导航栏 (`header.tsx`)
- **功能**: 提供固定的顶部导航，包含品牌标识和用户操作入口。
- **交互逻辑**:
  - **左侧**: 显示应用图标和名称。
  - **右侧**: 显示用户头像。点击头像会弹出一个下拉菜单，显示当前登录用户的邮箱，并提供“退出登录”选项。
  - **登出**: 点击“退出登录”会调用 `useAuth` 中的 `logout` 函数。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 本模块的布局结构严格遵循 `PRD.md §6` 中定义的全局UI设计原则。
- **与其他模块的交互**:
  - **依赖**:
    - `authentication.md`: 强依赖，通过 `useAuth` hook消费认证状态和方法。
    - `dashboard-context.md`: 强依赖，是该Context的提供者和初始化者。
    - `global-filters.md`, `kpi-grid.md`, `data-table.md` 等几乎所有仪表盘模块都作为其子组件被渲染。

## 5. 修改与维护指南
- **修改整体布局**: 应从 `src/app/page.tsx` 开始，调整其中组件的渲染顺序或包裹结构。
- **修改顶部导航**: 应编辑 `src/components/dashboard/header.tsx`。
- **风险点**: `page.tsx` 中的数据获取和状态更新逻辑是整个应用的核心，修改时需特别谨慎，确保数据流的正确性。对 `useEffect` 依赖项的修改可能导致不必要的重复渲染或数据请求。
