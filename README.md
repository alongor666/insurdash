# InsurDash: 车险经营指标周趋势应用

InsurDash 是一个安全、交互式、高性能的车险经营分析仪表盘，专为业务分析师和管理层设计。它采用业界领先的技术栈，提供深度的数据可视化分析能力，并部署于全球边缘网络，确保快速稳定的访问体验。

## ✨ 核心功能

- **核心指标看板**: 4x4 网格布局，直观展示16个核心KPI。
- **多维交互式图表**:
  - **趋势分析**: 追踪单个指标在连续周期内的表现（条形图/折线图智能切换）。
  - **贡献度分析**: 对比两个核心指标的“当周贡献度”变化趋势。
  - **占比分析**: 创新的双环饼图，对比业务在两个指标上的构成差异。
  - **业务分布**: 可排序的水平条形图，展示各业务线在选定指标上的分布。
  - **多维气泡图**: 在一个视图中同时比较不同业务线的三个可自定义指标。
  - **帕累托分析**: 经典的“二八法则”分析，识别贡献最大的关键业务。
- **动态分析模式**: 支持在“累计(YTD)”和“当周(PoP)”两种数据计算模式间一键切换。
- **AI辅助分析**: 一键生成结构化的分析材料，方便与大语言模型（LLM）协作。
- **安全认证**: 基于邮箱和密码的安全登录机制。

## 🚀 技术栈

- **前端**: Next.js (App Router), TypeScript, ShadCN UI, Tailwind CSS
- **图表**: Recharts
- **后端 & 数据库**: Supabase
- **部署**: Cloudflare Pages (通过 GitHub Actions 自动部署)

## 🔧 开发环境设置

1.  **克隆仓库**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    - 在项目根目录创建一个名为 `.env.local` 的文件。
    - 在该文件中添加您的 Supabase 项目信息：
      ```
      NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      ```

4.  **运行开发服务器**
    ```bash
    npm run dev
    ```
    应用将在 `http://localhost:9002` 上运行。

## 部署

本项目通过 GitHub Actions 自动部署到 Cloudflare Pages。当代码被推送到 `main` 分支时，工作流会自动触发。

为确保部署成功，您需要在 Cloudflare 和 GitHub 中配置相应的环境变量和密钥。详细步骤请参考项目核心文档 `PRD.md` 中的“部署与复刻”章节。
