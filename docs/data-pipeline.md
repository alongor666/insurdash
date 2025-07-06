# 模块文档：数据获取与处理 (Data Pipeline)

- **组件路径(s)**: `src/lib/data.ts`, `src/lib/supabase/client.ts`, `src/lib/kpi-config.ts`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
作为应用的“数据引擎”，本模块负责与后端(Supabase)的所有通信、KPI指标的定义与计算，以及所有原始数据的处理和转换。它确保了整个应用数据来源的单一性和计算口径的一致性。

## 2. 数据源与模型
- **数据源**: Supabase `business_data` 视图。
- **核心数据结构**:
  - `RawBusinessData`: 从Supabase获取的原始行数据类型。
  - `ProcessedBusinessData`: 经过KPI计算后的业务线数据类型。
  - `DashboardData`: 最终传递给UI组件的完整数据包，包含按业务线细分的数据和汇总数据。
  - `TrendData`: 用于趋势图的、包含多个周期数据点的数据结构。
- **配置中心**:
  - `src/lib/kpi-config.ts`: **指标的血缘地图**。它定义了所有KPI的ID、名称、单位、类型（金额/比率等）和好坏趋势（`positiveChangeIs`）。

## 3. 核心功能与交互逻辑
本模块是纯逻辑模块，没有UI。其核心功能由一系列导出的函数构成：

### 3.1. 数据获取
- **`createClient()`**: 创建一个Supabase客户端实例。
- **`getFilterOptions()`**: 获取所有可用的周期和业务类型，用于填充全局筛选器。
- **`getRawDataForPeriod()`**: 根据给定的周期ID，获取该周期的所有原始业务数据。
- **`getRawDataForTrend()`**：根据结束周期和数量，获取一个连续时间序列的原始数据。

### 3.2. 数据处理与计算
- **`processDashboardData()`**: **核心处理函数**。它接收一个包含多个周期原始数据和用户筛选条件的对象，然后根据`analysisMode` (`ytd`, `pop`, `comparison`) 执行以下操作：
    - **`ytd` 模式**: 直接处理当前周期和对比周期的YTD数据。
    - **`pop` 模式**: 计算当前周期与其上一周期的“当周发生额”，并进行对比。
    - **`comparison` 模式**: 计算当前周期和自定义对比周期的“当周发生额”，并进行对比。
    - 对每个业务线调用`calculateKpis`计算所有KPI。
    - 对筛选后的数据进行聚合，计算汇总KPI。
    - 返回一个结构化的`DashboardData`对象。
- **`processTrendData()`**: 专门为趋势图处理数据，为每个历史时间点计算YTD和PoP两种模式下的KPI。
- **`calculateKpis()`**: **核心计算引擎**。接收单条`RawBusinessData`，计算并返回所有16个核心KPI。
- **`aggregateRawData()`**: 将多条业务线数据聚合成一条总和数据，并正确计算加权平均指标。
- **`calculatePeriodOverPeriod()`**: 计算“当周发生额”，即 `当前周期YTD - 上一周期YTD`。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 本模块是 `PRD.md §5.3` 中定义的核心数据模型的直接实现。
  - 所有KPI的计算逻辑严格遵循 `PRD.md §9` 中的指标字典。
- **与其他模块的交互**:
  - **被依赖**:
    - `dashboard-context.md`: 强依赖，调用本模块的数据获取和处理函数来驱动整个应用。
  - **依赖**: 
    - Supabase 服务。

## 5. 修改与维护指南
- **修改KPI计算口径**: **唯一修改点**是 `src/lib/data.ts` 中的 `calculateKpis` 函数。任何关于指标计算逻辑的变更都应在此处进行，以保证全局一致。
- **新增KPI**:
  1.  在 `src/lib/types.ts` 中为 `KpiKey` 添加新的ID。
  2.  在 `src/lib/kpi-config.ts` 的 `KPIS` 对象中添加新指标的完整定义。
  3.  在 `calculateKpis` 函数中添加新指标的计算逻辑。
- **风险点**: 本模块是整个应用的数据基石，任何修改都可能对所有图表和指标卡片产生影响。修改后需要进行全面的回归测试。
