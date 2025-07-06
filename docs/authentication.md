# 模块文档：认证 (Authentication)

- **组件路径(s)**: `src/hooks/use-auth.tsx`, `src/app/api/auth/login/route.ts`, `src/app/login/page.tsx`, `src/components/auth/auth-form.tsx`
- **模块负责人**: `TBD`
- **最后更新**: `2024-08-01`
- **文档版本**: `v1.0.0`
- **变更记录**:
  - `v1.0.0` - 初始创建 by AI Guardian

---

## 1. 核心目标 (Core Objective)
提供一个基于邮箱和密码的安全登录机制。所有对仪表盘数据的访问都必须经过身份验证，并通过BFF架构模式确保认证过程的绝对安全。

## 2. 数据源与模型
- **输入**: 用户提供的 `email` 和 `password`。
- **核心对象**: Supabase `User` 和 `Session` 对象。
- **输出**: 一个全局可用的认证上下文，包含当前用户状态 (`user`)、加载状态 (`loading`) 和操作方法 (`login`, `logout`)。

## 3. 核心功能与交互逻辑
### 3.1. 登录流程 (BFF 架构)
1.  **用户输入**: 在登录页 (`login/page.tsx`)，用户在 `AuthForm` 组件中输入凭证。
2.  **前端请求**: `AuthForm` 调用 `useAuth` hook 中的 `login` 函数。
3.  **调用API路由**: `login` 函数向应用自身的后端API路由 (`/api/auth/login`) 发送一个 `POST` 请求，其中包含 `email` 和 `password`。
4.  **服务器端认证**: API路由 (`route.ts`) 在安全的服务器环境中运行。它接收到凭证，并使用环境变量中的Supabase配置，调用 `supabase.auth.signInWithPassword()` 执行认证。**密钥永远不会暴露给浏览器**。
5.  **返回凭证**: 认证成功后，API路由将安全的`session`信息返回给前端。
6.  **设置会话**: 前端的`login`函数接收到`session`后，调用 `supabase.auth.setSession()`，将用户的登录状态安全地同步到浏览器中。

### 3.2. 会话管理与路由守卫 (`use-auth.tsx`)
- **状态监听**: `AuthProvider` 使用 `supabase.auth.onAuthStateChange()` 监听器来实时响应认证状态的变化（登录、登出）。
- **自动重定向**: `AuthProvider` 中包含一个 `useEffect` hook，它会监控用户状态和当前路由：
  - 如果用户**未登录**且不在登录页，自动跳转到 `/login`。
  - 如果用户**已登录**且在登录页，自动跳转到 `/`。
- **登出逻辑**: 用户在 `Header` 组件中点击“退出登录”，会调用 `useAuth` 中的 `logout` 函数，该函数执行 `supabase.auth.signOut()` 并将用户重定向到登录页。

## 4. 关系图谱 (Relationship Map)
- **关联全局宪法 `PRD.md`**:
  - 本模块的BFF架构是 `PRD.md §5.2` 中定义的数据流架构的核心实现。
- **与其他模块的交互**:
  - **被依赖**:
    - `app-shell.md`: `AuthProvider` 包裹了整个应用，为所有页面提供认证上下文。几乎所有其他模块都间接依赖它提供的用户状态。
  - **依赖**: 
    - Supabase 服务。

## 5. 修改与维护指南
- **认证核心逻辑**: 所有认证相关的核心逻辑都封装在 `src/hooks/use-auth.tsx` 中。如需修改会话处理或重定向规则，应首先查看此文件。
- **后端接口**: 登录的服务器端逻辑位于 `src/app/api/auth/login/route.ts`。
- **风险点**: 这是一个核心安全模块。任何修改都必须经过严格测试，确保不会引入安全漏洞或破坏会话管理机制。
