/* ============================================================
   templates.js — ★核心★ 模板字段定义
   每一套模板是一个字段数组，form-renderer 读取这些定义自动生成表单
   添加新行业模板只需在这里加数据，不用改渲染代码

   字段 schema：
   - id:         唯一标识（英文驼峰）
   - module:     所属模块 basicInfo|existingProcess|automationGoal|dataSpec|constraints|specialScenarios
   - type:       字段类型 text|textarea|select|radio|checkbox|file
   - label:      显示给用户的标签文字
   - required:   是否必填
   - fullOnly:   true表示只在完整版出现，简易版隐藏
   - placeholder: 输入框占位提示（可选）
   - hint:       字段下方的帮助说明（可选）
   - options:    select/radio/checkbox的选项 [{value, label}]（可选）
   - maxLength:  最大字数限制（可选）
   - order:      在当前模块内的排序（可选）
   ============================================================ */
(function () {
  'use strict';

  window.App = window.App || {};

  /* ===== 行业元数据 ===== */
  var INDUSTRY_META = {
    finance:  { name: '财务台账', icon: '💰', descSimple: '基础财务流程自动化需求采集', descFull: '全面财务系统自动化需求采集，含税务、多账套等复杂场景' },
    workshop: { name: '生产车间', icon: '🏭', descSimple: '基础车间管理流程需求采集', descFull: '全面车间管理自动化需求采集，含设备、排产等' },
    admin:    { name: '行政人事', icon: '👥', descSimple: '基础行政人事流程需求采集', descFull: '全面行政人事自动化需求采集，含考勤、薪酬等' },
    sales:    { name: '销售台账', icon: '📊', descSimple: '基础销售数据管理需求采集', descFull: '全面销售管理自动化需求采集，含CRM、分析等' },
  };

  /* ===== 公共字段（所有行业共享的基础信息） ===== */
  var COMMON_FIELDS = [
    {
      id: 'companyName', module: 'basicInfo', type: 'text', order: 1,
      label: '公司/部门名称', required: true, fullOnly: false,
      placeholder: '如：XX公司财务部',
      hint: '请填写使用该系统的公司或部门全称',
    },
    {
      id: 'contactPerson', module: 'basicInfo', type: 'text', order: 2,
      label: '联系人', required: true, fullOnly: false,
      placeholder: '如：张三',
    },
    {
      id: 'contactPhone', module: 'basicInfo', type: 'text', order: 3,
      label: '联系电话', required: false, fullOnly: false,
      placeholder: '如：138xxxx8888',
    },
    {
      id: 'projectName', module: 'basicInfo', type: 'text', order: 4,
      label: '项目名称', required: true, fullOnly: false,
      placeholder: '如：财务自动化记账系统',
      hint: '给这个自动化项目起一个容易识别的名称',
    },
  ];

  /* ================================================================
     财务行业特有字段（覆盖6大模块）
     ================================================================ */
  var FINANCE_FIELDS = [
    // ----- 模块1：基础信息（补充财务特有字段）-----
    {
      id: 'financePeriod', module: 'basicInfo', type: 'select', order: 10, required: true, fullOnly: false,
      label: '财务周期',
      options: [
        { value: 'daily', label: '每日' },
        { value: 'weekly', label: '每周' },
        { value: 'monthly', label: '每月' },
        { value: 'quarterly', label: '每季度' },
        { value: 'yearly', label: '每年' },
      ],
      hint: '请选择主要的财务核算周期',
    },
    {
      id: 'accountSystem', module: 'basicInfo', type: 'select', order: 11, required: false, fullOnly: true,
      label: '当前使用的财务系统',
      options: [
        { value: 'yonyou', label: '用友' },
        { value: 'kingdee', label: '金蝶' },
        { value: 'sap', label: 'SAP' },
        { value: 'oracle', label: 'Oracle' },
        { value: 'excel', label: 'Excel / WPS表格' },
        { value: 'other', label: '其他' },
      ],
      hint: '如使用多个系统，请选择最主要的',
    },
    {
      id: 'projectBackground', module: 'basicInfo', type: 'textarea', order: 12, required: false, fullOnly: true,
      label: '项目背景说明', maxLength: 500,
      placeholder: '请描述为什么要做这个自动化项目，遇到了什么问题...',
      hint: '简要说明项目背景，帮助开发者理解业务场景',
    },

    // ----- 模块2：现有流程 -----
    {
      id: 'currentMethod', module: 'existingProcess', type: 'radio', order: 1, required: true, fullOnly: false,
      label: '当前做账方式',
      options: [
        { value: 'manual', label: '手工做账' },
        { value: 'spreadsheet', label: '电子表格（Excel/WPS）' },
        { value: 'software', label: '财务软件' },
        { value: 'partial', label: '部分自动化' },
      ],
    },
    {
      id: 'involvedRoles', module: 'existingProcess', type: 'checkbox', order: 2, required: true, fullOnly: false,
      label: '涉及人员岗位',
      options: [
        { value: 'accountant', label: '会计' },
        { value: 'cashier', label: '出纳' },
        { value: 'financeManager', label: '财务主管/经理' },
        { value: 'auditor', label: '审计' },
        { value: 'other', label: '其他' },
      ],
    },
    {
      id: 'monthlyVouchers', module: 'existingProcess', type: 'select', order: 3, required: true, fullOnly: false,
      label: '每月处理凭证量',
      options: [
        { value: 'lt50', label: '少于50笔' },
        { value: '50-200', label: '50 - 200笔' },
        { value: '200-500', label: '200 - 500笔' },
        { value: 'gt500', label: '超过500笔' },
      ],
      hint: '估算每月需要处理的会计凭证数量',
    },
    {
      id: 'currentWorkflow', module: 'existingProcess', type: 'textarea', order: 4, required: true, fullOnly: false,
      label: '当前完整工作流程', maxLength: 1000,
      placeholder: '请从收到原始单据开始，一步步描述到最终生成报表的完整过程...\n\n例如：\n1. 收到发票和收据\n2. 手工录入到Excel\n3. ...',
      hint: '越详细越好，这决定了自动化方案的设计',
    },
    {
      id: 'currentPainPoints', module: 'existingProcess', type: 'textarea', order: 5, required: true, fullOnly: false,
      label: '现有流程的最大痛点', maxLength: 500,
      placeholder: '请描述最耗时、最容易出错的环节是什么...\n\n例如：每月手工对账需要3天，经常漏记错记',
      hint: '你最希望优先解决的问题是什么？',
    },
    {
      id: 'multiCompany', module: 'existingProcess', type: 'radio', order: 10, required: false, fullOnly: true,
      label: '是否涉及多公司/多账套',
      options: [{ value: 'yes', label: '是' }, { value: 'no', label: '否' }],
      hint: '是否需要同时管理多个公司的账务',
    },
    {
      id: 'bankReconciliation', module: 'existingProcess', type: 'select', order: 11, required: false, fullOnly: true,
      label: '银行对账方式',
      options: [
        { value: 'manual', label: '手工对账' },
        { value: 'semi', label: '半自动（导入银行流水后手工勾对）' },
        { value: 'auto', label: '全自动' },
      ],
    },

    // ----- 模块3：自动化目标 -----
    {
      id: 'automationLevel', module: 'automationGoal', type: 'radio', order: 1, required: true, fullOnly: false,
      label: '期望达成的自动化程度',
      options: [
        { value: 'semi', label: '半自动辅助 — 系统辅助人工判断' },
        { value: 'full', label: '全自动处理 — 系统自动完成大部分工作' },
        { value: 'smart', label: '智能决策辅助 — 系统提供分析和建议' },
      ],
    },
    {
      id: 'priorityAutomation', module: 'automationGoal', type: 'textarea', order: 2, required: true, fullOnly: false,
      label: '最优先自动化的环节', maxLength: 500,
      placeholder: '请列举你最想优先实现自动化的1-3个具体环节...\n\n例如：凭证自动生成、银行对账自动化、报表一键导出',
    },
    {
      id: 'timeSaving', module: 'automationGoal', type: 'select', order: 3, required: false, fullOnly: false,
      label: '期望每天节省的时间',
      options: [
        { value: 'lt1h', label: '少于1小时' },
        { value: '1-3h', label: '1 - 3小时' },
        { value: 'gt3h', label: '超过3小时' },
      ],
    },
    {
      id: 'errorRateTarget', module: 'automationGoal', type: 'text', order: 10, required: false, fullOnly: true,
      label: '期望降低的错误率目标',
      placeholder: '如：从5%降到1%以下，或零差错',
    },
    {
      id: 'realtimeReport', module: 'automationGoal', type: 'radio', order: 11, required: false, fullOnly: true,
      label: '是否需要实时报表',
      options: [{ value: 'yes', label: '需要，随时查看' }, { value: 'no', label: '不需要，定期生成即可' }],
      hint: '实时报表可随时查看财务状况，但开发成本更高',
    },
    {
      id: 'successMetrics', module: 'automationGoal', type: 'textarea', order: 12, required: false, fullOnly: true,
      label: '项目成功的关键衡量指标', maxLength: 300,
      placeholder: '如何判断这个项目是否成功？如：错误率降低90%、每月节省50小时人力...',
    },

    // ----- 模块4：数据规范 -----
    {
      id: 'accountStandard', module: 'dataSpec', type: 'select', order: 1, required: true, fullOnly: false,
      label: '科目编码体系',
      options: [
        { value: 'enterprise', label: '企业会计准则' },
        { value: 'small', label: '小企业会计准则' },
        { value: 'custom', label: '自定义/公司内部编码' },
      ],
      hint: '选择公司目前遵循的会计科目标准',
    },
    {
      id: 'importHistory', module: 'dataSpec', type: 'radio', order: 2, required: true, fullOnly: false,
      label: '是否需要导入历史数据',
      options: [{ value: 'yes', label: '是，需要迁移历史数据' }, { value: 'no', label: '否，从零开始' }],
    },
    {
      id: 'dataSources', module: 'dataSpec', type: 'checkbox', order: 3, required: true, fullOnly: false,
      label: '数据来源系统',
      options: [
        { value: 'excel', label: 'Excel / WPS表格' },
        { value: 'yonyou', label: '用友' },
        { value: 'kingdee', label: '金蝶' },
        { value: 'invoice', label: '发票系统' },
        { value: 'bank', label: '银行系统' },
        { value: 'manual', label: '手工录入' },
      ],
    },
    {
      id: 'exportFormat', module: 'dataSpec', type: 'select', order: 4, required: false, fullOnly: false,
      label: '数据导出格式要求',
      options: [
        { value: 'excel', label: 'Excel (.xlsx)' },
        { value: 'pdf', label: 'PDF' },
        { value: 'csv', label: 'CSV' },
        { value: 'any', label: '无特殊要求' },
      ],
    },
    {
      id: 'taxSystem', module: 'dataSpec', type: 'radio', order: 10, required: false, fullOnly: true,
      label: '是否需要对接税局系统',
      options: [{ value: 'yes', label: '是' }, { value: 'no', label: '否' }],
      hint: '如需要自动生成税务申报数据',
    },
    {
      id: 'invoiceTypes', module: 'dataSpec', type: 'checkbox', order: 11, required: false, fullOnly: true,
      label: '涉及的发票类型',
      options: [
        { value: 'vat_special', label: '增值税专用发票' },
        { value: 'vat_normal', label: '增值税普通发票' },
        { value: 'e_invoice', label: '电子发票' },
        { value: 'other', label: '其他票据' },
      ],
    },
    {
      id: 'dataVolume', module: 'dataSpec', type: 'text', order: 12, required: false, fullOnly: true,
      label: '历史数据量级估算',
      placeholder: '如：过去3年约有5000条凭证数据、200MB',
      hint: '帮助评估数据迁移工作量',
    },

    // ----- 模块5：约束限制 -----
    {
      id: 'budget', module: 'constraints', type: 'select', order: 1, required: true, fullOnly: false,
      label: '预算范围',
      options: [
        { value: 'lt10k', label: '1万元以下' },
        { value: '10k-50k', label: '1万 - 5万元' },
        { value: '50k-200k', label: '5万 - 20万元' },
        { value: 'gt200k', label: '20万元以上' },
        { value: 'unlimited', label: '不限 / 待定' },
      ],
    },
    {
      id: 'timeline', module: 'constraints', type: 'select', order: 2, required: false, fullOnly: false,
      label: '期望完成时间',
      options: [
        { value: '1m', label: '1个月内' },
        { value: '1-3m', label: '1 - 3个月' },
        { value: '3-6m', label: '3 - 6个月' },
        { value: '6m+', label: '6个月以上 / 不着急' },
      ],
    },
    {
      id: 'techConstraints', module: 'constraints', type: 'textarea', order: 3, required: false, fullOnly: false,
      label: '技术限制条件', maxLength: 500,
      placeholder: '如：只能用内网不能连外网、必须用WPS不能装Office、电脑是XP系统...',
      hint: '任何技术上的限制都请写出来，避免做出不可用的方案',
    },
    {
      id: 'securityLevel', module: 'constraints', type: 'radio', order: 10, required: false, fullOnly: true,
      label: '数据安全要求等级',
      options: [
        { value: 'low', label: '低 — 内部使用即可' },
        { value: 'medium', label: '中 — 需要基本权限控制' },
        { value: 'high', label: '高 — 敏感财务数据，需严格权限和审计' },
      ],
    },
    {
      id: 'needPermission', module: 'constraints', type: 'radio', order: 11, required: false, fullOnly: true,
      label: '是否需要多级权限管理',
      options: [{ value: 'yes', label: '是，不同岗位看不同内容' }, { value: 'no', label: '否，所有用户权限一样' }],
    },
    {
      id: 'otherConstraints', module: 'constraints', type: 'textarea', order: 12, required: false, fullOnly: true,
      label: '其他约束条件', maxLength: 300,
      placeholder: '如：合规要求、审计要求、上级审批流程等...',
    },

    // ----- 模块6：特殊场景 -----
    {
      id: 'specialTax', module: 'specialScenarios', type: 'textarea', order: 1, required: false, fullOnly: false,
      label: '是否有特殊税种或税率计算', maxLength: 500,
      placeholder: '如：农产品收购发票抵扣、出口退税、简易计税等特殊场景...',
      hint: '如果有标准税种之外的税务处理，请详细说明',
    },
    {
      id: 'taxReportHelper', module: 'specialScenarios', type: 'radio', order: 2, required: false, fullOnly: false,
      label: '是否需要生成税务申报辅助数据',
      options: [{ value: 'yes', label: '是' }, { value: 'no', label: '否' }],
    },
    {
      id: 'foreignCurrency', module: 'specialScenarios', type: 'radio', order: 10, required: false, fullOnly: true,
      label: '是否有外币业务',
      options: [{ value: 'yes', label: '是，涉及外币结算' }, { value: 'no', label: '否，全部人民币' }],
    },
    {
      id: 'fixedAssets', module: 'specialScenarios', type: 'radio', order: 11, required: false, fullOnly: true,
      label: '是否需要固定资产折旧计算',
      options: [{ value: 'yes', label: '是，需要自动计算折旧' }, { value: 'no', label: '否' }],
    },
    {
      id: 'costAllocation', module: 'specialScenarios', type: 'radio', order: 12, required: false, fullOnly: true,
      label: '是否需要成本分摊',
      options: [{ value: 'yes', label: '是，多部门/项目分摊' }, { value: 'no', label: '否' }],
    },
    {
      id: 'otherScenarios', module: 'specialScenarios', type: 'textarea', order: 20, required: false, fullOnly: false,
      label: '其他特殊需求或场景', maxLength: 500,
      placeholder: '任何上面没有覆盖到的特殊需求，请在此说明...',
    },
  ];

  /* ================================================================
     模板组装
     ================================================================ */

  /**
   * 从原始字段数组生成模板对象
   * @param {string} industry - 行业标识
   * @param {string} version - "simple" | "full"
   * @param {Array} fields - 该行业的所有字段（含 fullOnly 标记）
   * @returns {Object} 模板对象
   */
  function buildTemplate(industry, version, fields) {
    var meta = INDUSTRY_META[industry];
    // 简易版过滤掉 fullOnly 字段
    var filteredFields = version === 'simple'
      ? fields.filter(function (f) { return !f.fullOnly; })
      : fields;

    return {
      id: industry + '-' + version,
      industry: industry,
      version: version,
      name: meta.name + ' - ' + (version === 'simple' ? '简易版' : '完整版'),
      icon: meta.icon,
      industryName: meta.name,
      versionLabel: version === 'simple' ? '简易版' : '完整版',
      description: version === 'simple' ? meta.descSimple : meta.descFull,
      fields: filteredFields,
      fieldCount: filteredFields.length,
    };
  }

  // 预生成所有 8 套模板
  var ALL_TEMPLATES = {};

  function initTemplates() {
    if (Object.keys(ALL_TEMPLATES).length > 0) return; // 只初始化一次

    // 财务行业（合并公共字段 + 财务特有字段）
    var finFields = COMMON_FIELDS.concat(FINANCE_FIELDS);
    ALL_TEMPLATES['finance-simple'] = buildTemplate('finance', 'simple', finFields);
    ALL_TEMPLATES['finance-full'] = buildTemplate('finance', 'full', finFields);

    // 其他行业先占位（后续补充字段定义后启用）
    ALL_TEMPLATES['workshop-simple'] = { id: 'workshop-simple', industry: 'workshop', version: 'simple', name: '生产车间 - 简易版', icon: '🏭', industryName: '生产车间', versionLabel: '简易版', description: '车间管理流程自动化需求采集', fields: COMMON_FIELDS, fieldCount: COMMON_FIELDS.length, _placeholder: true };
    ALL_TEMPLATES['workshop-full']   = { id: 'workshop-full',   industry: 'workshop', version: 'full',   name: '生产车间 - 完整版', icon: '🏭', industryName: '生产车间', versionLabel: '完整版', description: '全面车间管理自动化需求采集', fields: COMMON_FIELDS, fieldCount: COMMON_FIELDS.length, _placeholder: true };
    ALL_TEMPLATES['admin-simple']    = { id: 'admin-simple',    industry: 'admin',    version: 'simple', name: '行政人事 - 简易版', icon: '👥', industryName: '行政人事', versionLabel: '简易版', description: '行政人事流程自动化需求采集', fields: COMMON_FIELDS, fieldCount: COMMON_FIELDS.length, _placeholder: true };
    ALL_TEMPLATES['admin-full']      = { id: 'admin-full',      industry: 'admin',    version: 'full',   name: '行政人事 - 完整版', icon: '👥', industryName: '行政人事', versionLabel: '完整版', description: '全面行政人事自动化需求采集', fields: COMMON_FIELDS, fieldCount: COMMON_FIELDS.length, _placeholder: true };
    ALL_TEMPLATES['sales-simple']    = { id: 'sales-simple',    industry: 'sales',    version: 'simple', name: '销售台账 - 简易版', icon: '📊', industryName: '销售台账', versionLabel: '简易版', description: '销售数据管理自动化需求采集', fields: COMMON_FIELDS, fieldCount: COMMON_FIELDS.length, _placeholder: true };
    ALL_TEMPLATES['sales-full']      = { id: 'sales-full',      industry: 'sales',    version: 'full',   name: '销售台账 - 完整版', icon: '📊', industryName: '销售台账', versionLabel: '完整版', description: '全面销售管理自动化需求采集', fields: COMMON_FIELDS, fieldCount: COMMON_FIELDS.length, _placeholder: true };
  }

  // 初始化
  initTemplates();

  /* ===== 对外 API ===== */
  window.App.templates = {
    /**
     * 获取所有模板
     * @returns {Object} { templateId: templateObject }
     */
    getAll: function () {
      return ALL_TEMPLATES;
    },

    /**
     * 根据 ID 获取单个模板
     * @param {string} id - 模板ID，如 "finance-full"
     * @returns {Object|undefined}
     */
    getById: function (id) {
      return ALL_TEMPLATES[id];
    },

    /**
     * 获取指定行业的两个版本
     * @param {string} industry - 行业标识
     * @returns {Object} { simple, full }
     */
    getByIndustry: function (industry) {
      return {
        simple: ALL_TEMPLATES[industry + '-simple'],
        full: ALL_TEMPLATES[industry + '-full'],
      };
    },

    /**
     * 获取某个模板中指定模块的字段列表（已按 order 排序）
     * @param {string} templateId
     * @param {string} moduleName
     * @returns {Array}
     */
    getFields: function (templateId, moduleName) {
      var t = ALL_TEMPLATES[templateId];
      if (!t) return [];
      return t.fields
        .filter(function (f) { return f.module === moduleName; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    },

    // 模块名称映射（中文显示）
    MODULE_NAMES: {
      basicInfo: '基础信息',
      existingProcess: '现有流程',
      automationGoal: '自动化目标',
      dataSpec: '数据规范',
      constraints: '约束限制',
      specialScenarios: '特殊场景',
    },
  };

})();
