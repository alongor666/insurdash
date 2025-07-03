# **InsurDash: 车险经营指标周趋势应用 - 产品需求文档**

## **1\. 引言**

### **1.1. 文档目的**

本文档作为“车险经营指标周趋势 (InsurDash)”应用的**核心设计与实现蓝图 (As-Built Documentation)**。它旨在为开发人员、架构师、测试人员和系统维护者提供一个关于应用功能、技术架构、实现细节和部署方法的全面、精确、单一信息源。

本文档的目标是，确保任何具备相应技术栈能力的开发者，都能够**基于此文档从零开始，完整地理解、构建并复刻出与当前线上版本功能完全一致的应用**。文档将遵循“事无巨-细、不重复无遗漏”的原则，对每一个可见的可点击板块、逻辑、规则进行结构化、由总到分再到细的详尽描述，让任何维护者都能一目了然地知道应用是如何设计与实现的、可以怎么修改怎么调整。

### **1.2. 应用范围与核心价值**

本应用是一个**安全、交互式、高性能**的车险经营分析仪表盘。其核心价值在于：

* **极致开发体验 (DX)**: 采用 **Project IDX** 作为云端开发环境，实现随时随地编码、实时预览，极大提升开发效率。  
* **架构先进**: 采用业界领先的 **Jamstack 架构**，实现了前端与后端的完全解耦，系统边界清晰、易于维护和扩展。  
* **数据驱动**: 为车险业务分析师和管理层提供一个直观、高效的数据可视化分析平台。  
* **深度分析**: **将全部16个核心KPI指标全面集成**到所有图表视图和数据表中，提供前所未有的分析深度和灵活性。  
* **全球高性能**: 生产环境部署于 **Cloudflare Pages** 的全球边缘网络，确保应用在全球范围，特别是在中国大陆地区，都能提供稳定、快速的访问体验。

### **1.3. 目标受众**

* **开发人员**: 用于理解功能需求、技术实现和进行二次开发。  
* **系统架构师**: 用于了解系统设计、安全模型和演进路径。  
* **系统维护者**: 用于了解系统架构、部署和排查问题。

### **1.4. 关键术语与定义**

| 术语 | 英文/ID | 定义 |
| :---- | :---- | :---- |
| **Project IDX** | IDX | Google 出品的云端集成开发环境，提供编码、预览、终端一体化体验。 |
| **Supabase** | Supabase | 一个开源的后端即服务(BaaS)平台，基于PostgreSQL，提供数据库、认证等功能。 |
| **Cloudflare Pages** | Pages | Cloudflare 提供的用于部署前端应用的全球化、高性能托管平台。 |
| **Jamstack** | Jamstack | 一种现代Web开发架构，通过预渲染和解耦的方式提升性能、安全性和可扩展性。 |
| **YTD** | Year To Date | 本年迄今累计值。在应用的语境中，特指Supabase数据库中存储的累计值。 |
| **PoP** | Period over Period | 环比分析模式，分析“当周发生额”。 |
| **当周发生额** | Period Value | 当前周期YTD值 \- 上一周期YTD值。在PoP模式下，所有指标均基于此重新计算。 |
| **活文档** | Living Documentation | 指PRD.md, README.md等，始终与代码最新状态保持同步的核心项目文档。 |

## **2\. 系统架构**

### **2.1. 技术栈**

* **前端**:  
  * **框架**: Next.js (App Router, **静态导出 output: 'export' 模式**)  
  * **语言**: TypeScript  
  * **UI组件**: ShadCN UI  
  * **样式**: Tailwind CSS  
  * **图表**: Recharts  
  * **数据请求**: Supabase Client (@supabase/supabase-js)  
* **开发环境 (IDE)**:  
  * **平台**: **Project IDX**  
* **后端/BaaS (Backend as a Service)**:  
  * **核心**: **Supabase**  
  * **数据库**: Supabase Postgres  
  * **认证**: Supabase Auth  
* **版本控制 & CI/CD**:  
  * **代码仓库**: GitHub  
  * **自动化**: GitHub Actions  
* **托管 (Hosting)**:  
  * **前端生产环境**: **Cloudflare Pages**  
  * **开发预览环境**: Project IDX Web Preview

### **2.2. 数据流架构 (Jamstack 模式)**

本应用采用现代化的 **Jamstack 架构**，实现了开发、部署与后端服务的完全解耦，是兼顾开发体验、全球性能与极致安全的黄金标准。

graph TD  
    subgraph "云端开发环境 (Cloud IDE)"  
        A\[👨‍💻 开发者 on Project IDX\]  
        A \-- "1. 编码 & 实时预览" \--\> B(IDX Web Preview)  
        B \-- "2. 开发数据交互" \--\> C\[☁️ Supabase (开发实例)\]  
        A \-- "3. git push" \--\> D\[GitHub 仓库\]  
    end

    subgraph "自动化部署管道 (CI/CD)"  
        D \-- "4. 触发 on main branch" \--\> E{🤖 GitHub Actions}  
        E \-- "5. 构建静态产物" \--\> F\[Build Artifacts (out/)\]  
        F \-- "6. 安全部署" \--\> G\[🌍 Cloudflare Pages\]  
    end

    subgraph "全球用户访问 (Production)"  
        H\[👩‍💼 全球用户浏览器\] \-- "7. 访问应用" \--\> G  
        H \-- "8. 生产数据交互" \--\> I\[☁️ Supabase (生产实例)\]  
    end

    style A fill:\#4285F4,stroke:\#fff,stroke-width:2px,color:\#fff  
    style G fill:\#F38020,stroke:\#fff,stroke-width:2px,color:\#fff  
    style I fill:\#3ECF8E,stroke:\#fff,stroke-width:2px,color:\#fff

1. **云端开发**: 开发者在 **Project IDX** 中编写代码。IDX 提供了一个集成的 Web 预览环境，该环境直接与一个**开发用的 Supabase 实例**进行交互，实现快速迭代和测试。  
2. **版本控制**: 开发完成的代码通过 git 命令被推送到 **GitHub** 仓库。  
3. **自动构建与部署**: 当代码被合并到 main 生产分支时，**GitHub Actions** 会自动被触发。它会在一个干净的虚拟环境中拉取最新代码，执行 npm run build，生成纯静态的前端应用产物。  
4. **全球分发**: GitHub Actions 随后将构建好的静态文件**直接上传并部署到 Cloudflare Pages**。Cloudflare 会将这些文件分发到其遍布全球的边缘网络节点。  
5. **用户访问**: 最终用户通过浏览器访问部署在 Cloudflare Pages 上的应用。应用加载后，其中的 JavaScript 代码会直接、安全地与**生产用的 Supabase 实例**进行通信，以完成用户认证和数据查询。  
6. **极致安全**: **所有敏感的 API 密钥（如 Supabase 的 service\_role key）都无需存在于任何地方。** 客户端仅使用安全的 anon 公钥。数据库的安全由 Supabase 的**行级安全策略 (Row Level Security, RLS)** 来保障，确保用户只能访问到他们被授权的数据。

### **2.3. 数据源与数据模型 (Data Source & Data Model)**

本应用的数据流遵循一个清晰的“原始 \-\> 处理 \-\> 渲染”模式。理解数据源及其转换过程是理解整个应用逻辑的关键。

* **2.3.1. 物理数据源 (Physical Data Source)**  
  * **数据库**: **Supabase Postgres**  
  * **表 (Table)**: business_data  
  * **描述**: 此表中的每一行（Row）都代表一个业务周期（通常是一周）的完整数据快照。主键 period\_id 即为周期的唯一标识符，格式为 YYYY-Www (例如 2025-W26)。  
* **2.3.2. 原始数据模型 (PeriodData)**  
  * 应用从 Supabase 获取的每一行数据都遵循 PeriodData 结构。其核心是 business\_data JSONB列，包含了该周期内**所有独立业务线**的**最原始、未经计算的YTD累计值**。  
  * business_data 表结构:  
    | 列名 | 数据类型 | 描述 |  
    | :--- | :--- | :--- |  
    | period\_id | text | 主键 (Primary Key) \- 周期唯一ID (e.g., "2025-W26") |  
    | period\_label| text | 用于UI显示的周期名称 (e.g., "2025年第26周") |  
    | comparison\_period\_id\_mom | text | 用于计算环比(PoP)的上一周期ID (e.g., "2025-W25") |  
    | totals\_for\_period | jsonb | 包含该周期全量数据的对象 (如 total\_premium\_written\_overall) |  
    | business\_data | jsonb | 核心数据: 包含多个业务线原始数据的JSON数组 |  
  * BusinessData 结构 (存储于 business\_data JSONB列中):  
    | 字段 | 类型 | 描述 |  
    | :--- | :--- | :--- |  
    | business\_type | string | 业务线名称 |  
    | premium\_written | number | 跟单保费 (YTD累计值) |  
    | premium\_earned| number | 满期保费 (YTD累计值) |  
    | total\_loss\_amount| number | 总赔款 (YTD累计值) |  
    | expense\_amount\_raw| number | 原始费用额 (YTD累计值) |  
    | claim\_count| number | 已报件数 (YTD累计值) |  
    | avg\_premium\_per\_policy| number | (例外) 这是该业务线自身的单均保费，非YTD |  
    | avg\_commercial\_index| number | (例外) 这是该业务线自身的系数，非YTD |  
* **2.3.3. 逻辑处理核心 (data.ts)**  
  * 所有的数据转换和KPI计算逻辑都被严格地封装在 src/lib/data.ts 文件中。  
  * **核心函数**: processDashboardData 是数据处理的入口。它接收原始的 PeriodData 数组和用户的筛选条件（周期、业务线、分析模式），然后调用 calculateKpis 函数。  
  * **计算引擎**: calculateKpis 是应用的大脑。它根据分析模式（“累计”或“当周”）和选定的业务范围，对原始数据进行聚合、相减（PoP模式下），并最终计算出**全部16个核心KPI**的精确值。  
  * **输出**: processDashboardData 的最终输出是一个 ProcessedData 对象，它包含了所有UI组件（KPI卡片、图表、数据表）渲染所需的、已经过完整计算和处理的最终数据。

这个结构确保了数据源的单一性和计算逻辑的一致性。任何关于KPI口径的修改，都只需要在calculateKpis一个地方进行。

## **3\. 用户界面布局与交互 (UI Layout & Interaction)**

本应用包含两个主要界面：登录页和数据仪表盘主页。本章节将从宏观到微观，详细描述其布局结构与核心交互组件。

### **3.1. 登录页 (/login)**

登录页是应用的入口，设计简洁、目标明确。

* **布局**: 采用垂直居中布局，将登录表单置于屏幕中央。  
* **组件**:  
  1. **品牌标识**: 顶部包含应用的图标（眼睛图标）和标题“车险经营指标周趋势”。  
  2. **服务状态提示**: 在表单上方，如果系统检测到Supabase配置不完整，会显示一个醒目的错误提示框，告知用户“后端服务未配置”。  
  3. **登录表单 (LoginForm.tsx)**:  
     * 包含“邮箱”和“密码”两个输入框。  
     * 一个“登录”按钮。当服务未配置或正在登录时，按钮会处于禁用状态并显示相应文本（如“服务未配置”、“登录中…”）。  
* **交互流程**: 用户输入凭证后点击“登录”，成功后自动跳转至仪表盘主页；失败则通过弹窗提示错误信息。

### **3.2. 仪表盘主页 (/)**

仪表盘是应用的核心，采用自上而下的信息架构，引导用户从宏观概览逐步深入细节。整个界面由一个固定的顶部导航栏和一个可滚动的的主内容区组成。

* **3.2.1. 顶部导航栏 (Header.tsx)**  
  * **定位**: 始终固定在页面顶部。  
  * **内容**:  
    * **左侧**: 应用的图标和标题，作为品牌标识。  
    * **右侧**: 一个用户头像。点击头像会弹出一个下拉菜单，显示当前登录用户的邮箱，并提供“退出登录”选项。  
* **3.2.2. 全局筛选器 (GlobalFilters.tsx)**  
  * **定位**: 位于导航栏下方，当页面向下滚动时，它会“粘性”地固定在导航栏下方，确保筛选控件随时可用。  
  * **布局**: 一个响应式的网格布局，包含四个核心控制模块：  
    * **当前周期选择器**: 下拉菜单，用于设定分析的主要时间点。  
    * **对比周期选择器**: 下拉菜单，用于设定对比基准。  
    * **业务类型筛选器**: 一个多选弹出框，允许用户精确选择一个或多个业务线进行分析。  
    * **分析模式切换器**: 一个开关（Switch），用于在“累计(YTD)”和“当周(PoP)”两种数据计算模式间切换。  
* **3.2.3. 主内容区 (Main Content Area)**  
  * 位于全局筛选器下方，是数据可视化的核心区域。  
  * **A. KPI核心指标看板 (KpiGrid.tsx)**  
    * **布局**: 一个4x4的网格，由16个KpiCard组件构成。  
    * **内容**: 每个卡片清晰地展示一个核心指标的名称、当前周期的数值、单位，以及与对比周期的差异（包括绝对值和百分比变化，并用红/绿色表示好坏）。  
  * **B. 交互式图表区 (Tabs)**  
    * **布局**: 采用标签页（Tabs）设计，将五种不同的分析图表整合在一起，用户可以自由切换。  
    * **通用交互**: 每个图表卡片的右上角，除了各自的KPI选择器外，都有一个“AI分析”（Sparkles图标）按钮，点击后可生成用于外部LLM分析的结构化文本。  
    * **五个标签页**:  
      1. **趋势分析**: 包含一个KPI选择器，图表会根据所选指标的类型自动切换为条形图或折线图。  
      2. **多维气泡图**: 包含三个独立的KPI选择器，分别控制气泡的X轴、Y轴和大小。  
      3. **业务分布**: 包含一个KPI选择器，图表会根据所选指标对所有业务线进行自动排序和可视化。  
      4. **占比分析**: 包含两个独立的KPI选择器，分别控制创新的内外双环。  
      5. **帕累托分析**: 包含一个KPI选择器，用于识别贡献度最高的关键业务。  
  * **C. 详细数据表 (DataTable.tsx)**  
    * **布局**: 位于页面最底部，是一个默认折叠的卡片。  
    * **交互**:  
      * 点击卡片标题栏可以展开或收起整个表格。  
      * 表格内容如果超出屏幕宽度，会自动出现横向滚动条。  
      * 所有指标列的**表头都可以点击进行升序/降序排序**。

## **4\. 核心功能需求 (F-REQ)**

### **F-REQ-01: 用户认证 (User Authentication)**

* **目标**: 提供基于邮箱和密码的安全登录机制，所有对仪表盘数据的访问都必须经过身份验证。  
* **实现细节**:  
  1. **登录表单 (login/page.tsx)**:  
     * 提供“邮箱”和“密码”输入框，以及一个“登录”按钮。  
     * 使用 react-hook-form 和 zod 进行客户端表单验证。  
     * 如果前端 .env.local 文件中的 Supabase 配置不完整，登录按钮将显示为“服务未配置”且不可用，同时页面会显示错误提示。  
  2. **登录逻辑 (use-auth.tsx)**:  
     * 点击“登录”后，调用 login 函数。  
     * login 函数使用 **Supabase 客户端 SDK** 的 supabase.auth.signInWithPassword() 方法来执行登录。  
     * 登录成功后，Supabase SDK 会自动处理 idToken 和 refreshToken，并将它们安全地存储在浏览器的 localStorage 中。  
     * 同时，将 Supabase 返回的用户信息（email, uid）存入 React Context 中。  
  3. **会话保持与自动刷新**:  
     * **Supabase 客户端 SDK 会自动处理会话的保持和令牌的静默刷新**。应用加载时 (AuthProvider)，SDK 会自动检查 localStorage 中的会话。如果 idToken 即将过期，它会在后台无感地使用 refreshToken 获取新的令牌，开发者无需手动干预。  
     * 使用 supabase.auth.onAuthStateChange() 监听器来响应认证状态的变化，例如，如果会话失效，则自动将用户重定向到登录页面。  
  4. **登出逻辑**:  
     * 用户点击右上角头像菜单中的“退出登录”按钮。  
     * logout 函数被调用，调用 **Supabase 客户端 SDK** 的 supabase.auth.signOut() 方法。SDK 会负责清除本地会话，并将用户重定向到登录页面。

### **F-REQ-02: 全局数据筛选与控制 (Global Data Filtering & Controls)**

* **目标**: 在仪表盘顶部提供一个全局筛选器，其设置将同步应用于下方所有的KPI卡片、图表和数据表，实现数据的联动分析。  
* **实现细节**:  
  1. **周期选择 (Period Selectors)**:  
     * 包含“当前周期”和“对比周期”两个独立的下拉菜单。  
     * 菜单选项从 business_data 表中所有记录的 period\_label 字段动态生成。  
     * **默认值**: 应用加载后，自动将“当前周期”设置为最新的周期，“对比周期”设置为第二新的周期。  
     * **联动**: 更改任一周期，都会触发整个仪表盘数据（KPI、图表、数据表）的重新计算和渲染。  
  2. **业务类型筛选 (Business Type Filter)**:  
     *   一个多选下拉菜单，允许用户精准选择一个或多个业务线进行分析。
     *   **交互 (`Popover` + `Checkbox`)**:
         *   **触发**: 点击“N个已选”按钮，会弹出一个包含所有业务类型列表的浮层 (`Popover`)。
         *   **临时状态**: 在浮层中进行的所有操作（勾选、搜索、全选等）都只是在修改一个**临时的选择状态**，不会立即影响仪表盘。这确保了用户可以自由探索，而不会导致频繁的数据重算。
         *   **搜索与过滤**: 浮层顶部提供一个**搜索框**，用户可以输入关键字来实时过滤下方的业务类型列表，以便快速定位。
         *   **快捷操作**:
             *   **“全选”**: 立即选中列表中的所有业务类型。
             *   **“反选”**: 立即反转当前的选中状态（已选的变未选，未选的变已选）。
             *   **“清空”**: 立即取消所有业务类型的选中。
         *   **确认与取消**:
             *   点击**“确认”**按钮：应用本次在浮层中的所有修改，关闭浮层，并**最终触发**整个仪表盘的数据重新计算和渲染。
             *   点击**“取消”**按钮：放弃在浮层中所做的任何修改，关闭浮层，仪表盘数据**保持不变**。
     *   **默认值**: 应用加载时，默认选中所有业务类型。
  3. **分析模式切换 (Analysis Mode Switch)**:  
     * 一个开关组件，允许用户在两种数据计算模式之间无缝切换。  
     * **累计 (YTD)**: 所有指标均基于所选周期在数据库中记录的**本年迄今累计值**进行计算。  
     * **当周 (PoP)**: 所有指标均基于**当周发生额**进行计算。其核心逻辑是：当周发生额 \= 当前周期YTD值 \- 上一周期YTD值。切换到此模式会触发整个仪表盘数据重算。

### **F-REQ-03: 核心KPI看板 (Core KPI Dashboard)**

* **目标**: 主界面以一个4x4的网格布局，通过16张独立的卡片，直观地展示所有核心业务指标。  
* **实现细节**:  
  1. **布局**: 严格按照 src/lib/kpi-config.ts 中定义的 KPI\_GRID\_LAYOUT 数组来排列16个KPI卡片。  
  2. **卡片内容 (KpiCard.tsx)**:  
     * **指标名称**: 显示 KPI\_CONFIG\[kpiId\].name。  
     * **单位**: 在右上角显示 KPI\_CONFIG\[kpiId\].unit。  
     * **当前周期数值**: 以大号字体突出显示当前周期的计算结果，使用 formatKpiValue 工具函数进行格式化（例如，比率保留一位小数，金额取整）。  
     * **对比分析**: 在数值下方，展示与“对比周期”的差异。该逻辑由 `getComparisonMetrics` 函数 (`src/lib/data.ts`) 和 `KpiCard.tsx` 组件共同实现，其核心规则如下：
       *   **内容格式**: 对比文本同时包含**绝对值变化**和**百分比变化**。
           *   如果指标单位是百分比 (`%`)，绝对值变化会以百分点 (`p.p.`) 为单位显示，例如 `+1.5 p.p.`。
           *   如果指标是其他单位，则直接显示格式化后的数值变化，并带正负号，例如 `+1,234`。
           *   百分比变化则统一格式化为 `(+10.5%)` 的形式。
           *   最终组合成类似 `+1.5 p.p. (+10.5%)` 或 `+1,234 (+10.5%)` 的完整文本。
       *   **图标与颜色逻辑 (分工明确)**:
           *   **图标 (`Icon`)**: 图标**只反映数值的物理变化方向**。数值增加，则显示**向上箭头 (↑)**；数值减少，则显示**向下箭头 (↓)**。
           *   **颜色 (`Color`)**: 颜色**只反映该变化对业务的利好程度**，该定义存储在 `src/lib/kpi-config.ts` 的 `positiveChangeIs` 属性中 (`up` 代表增长为优，`down` 代表下降为优)：
               *   如果指标向好（如利润增长 `up`，成本下降 `down`），文本显示为**绿色**；如果向差，则显示为**红色**。
       *   **边界情况**: 
           *   如果对比周期无数据而当前周期有数据，则显示 `新增`。
           *   如果两个周期的值完全相等，则显示 `无变化`。

### **F-REQ-04: 交互式数据可视化 (Interactive Data Visualization)**

* **目标**: 提供一个集成了五种专业图表的标签页系统（Tabs），用于对业务数据进行多维度、深层次的交互式探索。  
* **实现细节**:

  * #### **4.1 趋势分析 (Trend Chart)**

    * **组件**: TrendChart.tsx  
    * **目标**: 追踪单个核心指标在连续时间周期内的表现。  
    * **数据源**: processedData.trendData，包含从当前周期往前最多15个周的数据点。在“当周 (PoP)”模式下，会移除最早的一个数据点以确保计算准确。  
    * **交互**:  
      * **指标选择**: 顶部提供一个 KpiSelector 下拉菜单，允许用户选择任意一个核心KPI进行分析。  
      * **智能图表切换**:  
        * 若选择的指标类型为 ratio 或 average (如“边际贡献率”)，则渲染为**折线图 (LineChart)**。  
        * 若选择的指标类型为 amount 或 count (如“跟单保费”)，则渲染为**条形图 (BarChart)**。条形图的颜色根据当周的variable\_cost\_ratio动态变化。  
    * **数据洞察 (Tooltip)**: 鼠标悬浮在图表上时，TrendChartTooltip 会显示一个信息丰富的提示框，内容包括：  
      * 周期ID (如 2025W26) 及其对应的日期范围。  
      * 用户当前选择的KPI的精确值。  
      * **额外上下文**: 无论用户选择哪个指标，提示框中都会额外展示该周期的\*\*“变动成本率”**和**“边贡额”\*\*，以提供更丰富的分析维度。

  * #### **4.2 多维气泡图 (Bubble Chart)**

    * **组件**: BubbleChart.tsx  
    * **目标**: 在一个二维平面上，通过气泡的位置（X/Y轴）和大小（Z轴）同时比较不同业务线的三个可自定义指标。  
    * **交互**: 顶部提供三个独立的 KpiSelector 分别控制 **X轴、Y轴、大小(Z轴)** 所代表的KPI。  
    * **数据洞察**:  
      * **气泡**: 每个气泡代表一个业务线。  
      * **颜色**: 气泡的颜色由其自身的 variable\_cost\_ratio (变动成本率) 决定，通过 getDynamicColorByVCR 函数计算得出，直观反映业务健康度。  
      * **Tooltip**: 鼠标悬浮在气泡上时，CustomTooltip 会显示该业务线的名称以及X、Y、Z三个指标的精确值。

  * #### **4.3 业务分布 (Ranking Chart)**

    * **组件**: RankingChart.tsx  
    * **目标**: 通过可排序的水平条形图，直观展示所有业务线在选定核心指标上的分布情况。  
    * **交互**: 顶部提供一个 KpiSelector 允许用户选择任意一个KPI作为分布和排序的依据。图表数据会根据所选KPI的值**从高到低**自动排序。  
    * **数据洞察**:  
      * **布局**: 采用水平条形图 (BarChart 的 layout="vertical")，Y轴为业务线名称，X轴为指标数值。  
      * **颜色**: 每个条形的颜色由其自身的 variable\_cost\_ratio 决定。  
      * **数值标签**: 每个条形的末端会通过 LabelList 组件显示其精确的数值，方便快速读取。  
      * **动态高度**: 图表容器的高度会根据业务线的数量动态调整 (height={chartData.length \* 35 \+ 50})，避免内容拥挤。

  * #### **4.4 占比分析 (Donut Chart)**

    * **组件**: DonutChart.tsx  
    * **目标**: 采用创新的双环结构，允许用户选择两个不同的指标分别作为内外环，直观对比各项业务在两个指标构成上的差异和联系。  
    * **交互**:  
      * 顶部提供两个独立的 Select 控件，分别用于选择**外环**和**内环**的KPI。可选指标被限定为数值型的KPI (DONUT\_PARETO\_KPI\_IDS)。  
      * 用户可以选择“无”，此时图表会变为单环饼图。  
    * **数据洞察**:  
      * **布局**: 图表区 (ResponsiveContainer) 与图例区 (LegendTable) 左右分栏布局。图例区为了可读性，被拆分为上下两部分，分别展示排名靠前和靠后的业务线。  
      * **排序**: 图例和图表数据默认按照**外环指标**的值从高到低排序。  
      * **动态图例**: LegendTable 不仅显示各业务线在内外环指标上的**贡献百分比**，还会通过 getDynamicColorForDonutLegend 函数进行智能着色。例如，当对比“跟单保费”和“总赔款”时，如果某个业务的赔款占比远高于其保费占比，其赔款百分比会显示为警示性的红色。

  * #### **4.5 帕累托分析 (Pareto Chart)**

    * **组件**: ParetoChart.tsx  
    * **目标**: 结合条形图与折线图，进行经典的“二八法则”分析，识别贡献最大的关键业务线。  
    * **交互**: 顶部提供一个 KpiSelector，允许用户选择一个数值型KPI (DONUT\_PARETO\_KPI\_IDS) 进行分析。  
    * **数据洞察**:  
      * **布局**: 使用 ComposedChart 复合图表。  
      * **条形图 (Bar)**: 显示按所选KPI贡献度**从高到低排序**后，每个业务线的具体数值。条形颜色由其自身的variable\_cost\_ratio决定。  
      * **折线图 (Line)**: 显示一条累计贡献百分比曲线，帮助用户快速定位贡献了80%结果的关键业务。  
      * **双Y轴**: 左侧Y轴对应条形图的数值，右侧Y轴对应折线图的百分比。

### **F-REQ-06: AI辅助分析报告生成器 (AI-Assisted Analysis Report Generator)**

* **目标**: 为每个图表组件提供一个快速生成结构化分析材料的功能，以提升分析师与大语言模型（LLM）的协作效率。  
* **实现细节**:  
  1. **触发**: 每个图表组件的右上角都有一个“AI分析”（Sparkles图标）按钮。  
  2. **内容生成**: 点击后，handleExport 函数会动态生成一段精心设计的Markdown格式文本。  
  3. **结构化内容**: 生成的文本包含四个部分：  
     * **分析背景**: 当前的周期、对比周期、分析模式、业务范围等，为AI提供完整的上下文。  
     * **核心指标看板**: 将主界面的KPI看板数据，格式化为一个Markdown表格。  
     * **图表详细数据**: 将当前图表所使用的数据，格式化为一个Markdown表格。  
     * **AI分析指令**: 一段预设的、优化过的提示词（Prompt），指导AI基于以上信息生成一份专业的分析报告。  
  4. **交互 (AiAnalysisModal.tsx)**:  
     * 生成的内容会显示在一个弹出的模态对话框中。  
     * 提供“一键复制”和“全选”按钮，方便用户将内容粘贴到Kimi, Gemini, ChatGPT等外部工具中。

### **F-REQ-07: 通用设计与颜色系统 (General Design & Color System)**

* **目标**: 确保颜色在应用中不仅是装饰，更是传递信息的关键工具，并在整个应用中保持一致。  
* **实现细节**:  
  1. **动态风险色 (Business Line Color)**:  
     * **逻辑**: 这是应用中最核心的颜色逻辑，由 `getDynamicColorByVCR` 函数实现。  
     * **规则**: 系统会根据每个业务线在**当前筛选条件**下的**“变动成本率” (VCR)** 的值，动态计算出一个从健康到高风险的渐变色。具体规则如下：
       *   **VCR <= 85% (健康区)**: 显示为**绿色**。VCR越低，颜色越深。
       *   **85% < VCR <= 90% (安全区)**: 显示为**蓝色**。VCR越接近85%，颜色越深。
       *   **90% < VCR <= 94% (警告区)**: 显示为**黄色**。VCR越高，颜色越深。
       *   **94% < VCR <= 100% (危险区)**: 显示为**红色**。VCR越高，颜色越深。
       *   **VCR > 100% (亏损区)**: 显示为**紫红色**。VCR越高，颜色越深。
     * **应用范围**: 这个颜色被统一应用于所有图表（趋势分析、业务分布、多维气泡等）和数据表中，用于着色代表该业务线的图形元素（如条形、气泡）或文本，帮助用户在不同视图中快速识别和追踪同一业务线的表现及其风险状况。
  2. **绩效指示色 (Performance Indicator Color)**:  
     * **逻辑**: 由 getComparisonText 函数实现。  
     * **规则**: 在KPI卡片和数据表中，用于展示当前周期与对比周期的差异。根据KPI的positiveChangeIs属性（在kpi-config.ts中定义），**绿色**代表积极变化（如利润增长、成本下降），**红色**代表负面变化。  
  3. **逻辑与优先级 (Logic & Priority)**:  
     * **明确分工，无直接冲突**: 应用中的两种核心颜色逻辑被设计为服务于不同的目标，并应用于不同的UI元素，因此它们之间**不存在直接的逻辑冲突**。  
       * **动态风险色 (getDynamicColorByVCR)**: 其**唯一目的**是反映**单个业务线**的健康度。因此，它被应用于代表业务线的图形元素（如排名图的条形、气泡图的气泡）或数据表中与该业务线强相关的指标数值上。  
       * **绩效指示色 (getComparisonText)**: 其**唯一目的**是反映指标**随时间的变化趋势**（向好或向差）。因此，它被专门应用于KPI卡片中描述变化的文本上（例如 \+1.5 p.p. (+10.5%)）。  
     * **优先级原则**: 在任何UI设计或功能迭代中，如出现潜在的颜色逻辑冲突，应遵循此优先级：**代表业务线自身健康度的“动态风险色”拥有更高的视觉优先级**。因为识别业务风险是本仪表盘的核心价值。

## **5\. 部署与复刻：最终生产方案 (IDX \+ GitHub Actions \+ Cloudflare)**

本指南提供了从零开始设置、运行和部署应用的**最终、经过验证的生产方案**。此方案旨在为所有用户，特别是中国大陆用户，提供最快的访问体验、最高的安全性和最佳的开发流程。

### **5.1. 阶段一：云端基础设施初始化**

1. **Supabase 设置**:  
   * 创建 Supabase 项目，设计 business_data 表，并填充样本数据。  
   * 进入 Project Settings \> API，复制并妥善保管 **Project URL** 和 anon **public key**。  
   * **(重要)** 前往 Authentication \> Policies，为您的 business_data 表**开启并配置行级安全策略 (Row Level Security, RLS)**。一个简单的初始策略是：“只允许已登录的用户 (authenticated users) 读取 business_data 表”。这是保障数据安全的核心！  
2. **Cloudflare 设置**:  
   * 登录 Cloudflare，获取您的 **Account ID**。  
   * 在 我的个人资料 \> API 令牌 页面，创建一个具有“编辑 Cloudflare Workers”权限的 **API Token** 并复制。  
   * 在 Workers & Pages 中，创建一个新的 Pages 项目，连接到您的 GitHub 仓库，但在设置中**关闭“自动部署”**。记下这个项目的**项目名称 (Project name)**。  
3. **GitHub 设置**:  
   * 创建一个新的 GitHub 仓库，例如 insurdash。  
   * 进入 Settings \> Security \> Secrets and variables \> Actions，配置以下**四个 Repository secrets**：  
     * CF\_API\_TOKEN: 您的 Cloudflare API 令牌。  
     * CF\_ACCOUNT\_ID: 您的 Cloudflare 账户 ID。  
     * SUPABASE\_URL: 您的**生产** Supabase 项目 URL。  
     * SUPABASE\_ANON\_KEY: 您的**生产** Supabase anon 公钥。

### **5.2. 阶段二：配置自动化部署 (GitHub Actions)**

在您的项目根目录 .github/workflows/ 下，创建 deploy.yml 文件，并粘贴以下内容：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Project
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Publish to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: insurdash
          directory: out
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          branch: main
```

## **6\. 附录：核心指标字典 (指标血缘地图)**

本字典定义了应用中所有核心指标的计算口径、业务含义与派生关系，确保全公司对数据理解的一致性。计算逻辑基于 src/lib/data.ts 中的 calculateKpis 函数。

| 指标名称 | 英文ID | 定义/计算逻辑 (基于已聚合或筛选后的数据) | 单位 | 升降趋势 |
| :---- | :---- | :---- | :---- | :---- |
| **跟单保费** | premium\_written | (数据源) \- Sum(business\_data.premium\_written) | 万元 | 越高越好 |
| **满期保费** | premium\_earned | (数据源) \- Sum(business\_data.premium\_earned) | 万元 | 越高越好 |
| **总赔款** | total\_loss\_amount | (数据源) \- Sum(business\_data.total\_loss\_amount) | 万元 | 越低越好 |
| **已报件数** | claim\_count | (数据源) \- Sum(business\_data.claim\_count) | 件 | 越低越好 |
| **费用额** | expense\_amount | premium\_written \* (expense\_ratio / 100\) | 万元 | 越低越好 |
| **单均保费** | avg\_premium\_per\_policy | (premium\_written \* 10000\) / policy\_count | 元 | 越高越好 |
| **保单件数** | policy\_count | (premium\_written \* 10000\) / avg\_premium\_per\_policy (注1) | 件 | 越高越好 |
| **保费满期率** | premium\_earned\_ratio | (premium\_earned / premium\_written) \* 100 | % | 越高越好 |
| **费用率** | expense\_ratio | (Sum(business\_data.expense\_amount\_raw) / premium\_written) \* 100 | % | 越低越好 |
| **满期赔付率** | loss\_ratio | (total\_loss\_amount / premium\_earned) \* 100 | % | 越低越好 |
| **案均赔款** | avg\_loss\_per\_case | (total\_loss\_amount \* 10000\) / claim\_count | 元 | 越低越好 |
| **满期出险率** | claim\_frequency | (claim\_count / (policy\_count \* (premium\_earned\_ratio / 100))) \* 100 | % | 越低越好 |
| **变动成本率** | variable\_cost\_ratio | loss\_ratio \+ expense\_ratio | % | 越低越好 |
| **边际贡献率** | marginal\_contribution\_ratio | 100 \- variable\_cost\_ratio | % | 越高越好 |
| **边贡额** | marginal\_contribution\_amount | premium\_earned \* (marginal\_contribution\_ratio / 100\) | 万元 | 越高越好 |
| **保费占比** | premium\_share | (当前业务范围premium\_written / 全部业务premium\_written) \* 100 | % | 越高越好 |
| **商业险平均自主系数** | avg\_commercial\_index | (数据源) (注2) | \- | 越低越好 |

注1: 在聚合多个业务线时，avg\_premium\_per\_policy 会被重新加权平均计算，而不是直接求和。  
注2: avg\_commercial\_index 仅在未聚合（即只选择单个业务线）且分析模式为“累计”时可用，否则显示为0。

