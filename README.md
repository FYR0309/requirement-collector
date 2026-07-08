# 轻量化通用需求采集工具

标准化办公自动化项目需求采集，解决两大核心痛点：
1. **术语鸿沟**：不熟悉客户行业术语，口头沟通易偏差、遗漏关键业务规则
2. **需求零散**：客户口述需求杂乱，无法直接交付AI开发

## 核心功能

- **8套行业模板**：财务/生产车间/行政人事/销售台账 × 简易版/完整版
- **6大核心模块**：基础信息 → 现有流程 → 自动化目标 → 数据规范 → 约束限制 → 特殊场景
- **双输出**：
  - 《自动化项目需求确认书》（客户核对用，通俗语言）
  - Claude Code 开发专用文本（一键复制直接开发）

## 技术栈

纯前端 SPA：HTML + CSS + Vanilla JS (ES Modules)，localStorage 存储，零依赖。

## 项目结构

```
requirement-collector/
├── index.html                    # 主入口
├── css/
│   └── style.css                 # 全局样式
├── js/
│   ├── app.js                    # 主入口：步骤状态机
│   ├── db.js                     # localStorage 封装
│   ├── templates.js              # ★核心★ 8套模板字段定义
│   ├── form-renderer.js          # 动态表单渲染引擎
│   ├── validator.js              # 必填校验
│   ├── document-generator.js     # 输出1：客户确认书
│   ├── dev-prompt-generator.js   # 输出2：开发文本
│   └── export.js                 # 复制/下载
└── README.md
```

## 业务流程

```
选择模板 → 填写表单 → 预览确认书 → 客户核对修改 → 定稿 → 输出开发文本
```

## 本地运行

直接在浏览器中打开 `index.html` 即可，无需服务器。
