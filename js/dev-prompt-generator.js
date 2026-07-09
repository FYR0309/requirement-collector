/* ============================================================
   dev-prompt-generator.js — Claude Code 开发文本生成器
   将表单数据转换为结构化的 Claude Code 开发 prompt
   挂载点：window.App.devPromptGenerator
   ============================================================ */
(function () {
  'use strict';

  window.App = window.App || {};

  var MODULE_TITLES = {
    basicInfo: '【基本信息】',
    existingProcess: '【现有流程】',
    automationGoal: '【自动化目标】',
    dataSpec: '【数据规范】',
    constraints: '【约束限制】',
    specialScenarios: '【特殊场景】',
  };

  /**
   * 生成 Claude Code 开发专用 prompt
   * @param {Object} template - 模板对象
   * @param {Object} formData - 表单数据
   * @returns {string} 开发 prompt 文本
   */
  function generate(template, formData) {
    var modules = ['basicInfo', 'existingProcess', 'automationGoal', 'dataSpec', 'constraints', 'specialScenarios'];
    var now = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

    var lines = [];
    lines.push('---');
    lines.push('角色：你是一个办公自动化开发专家，擅长将业务需求转化为高效的应用系统');
    lines.push('项目类型：' + template.name);
    lines.push('生成日期：' + now);
    lines.push('---');
    lines.push('');
    lines.push('请基于以下需求信息，开发一个完整的办公自动化应用。');
    lines.push('');

    // 遍历每个模块
    modules.forEach(function (mod) {
      var fields = template.fields
        .filter(function (f) { return f.module === mod; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

      lines.push(MODULE_TITLES[mod]);

      fields.forEach(function (field) {
        var value = formData[field.id];
        var displayValue = formatPromptValue(field, value);
        if (displayValue) {
          lines.push('- ' + field.label + '：' + displayValue);
        } else {
          lines.push('- ' + field.label + '：（未提供）');
        }
      });

      lines.push('');
    });

    // 技术推断与建议
    lines.push('【技术建议（基于需求推断）】');
    lines.push('- 项目类型：' + template.name);
    lines.push('- 建议技术方案：纯前端 SPA（HTML + CSS + JavaScript），可离线使用，零依赖');
    lines.push('- 数据存储：localStorage（如需多用户共享可升级为后端方案）');
    lines.push('- 部署方式：静态文件部署，双击 HTML 即可运行');
    lines.push('');

    // 输出要求
    lines.push('【输出要求】');
    lines.push('1. 生成完整的可运行代码，包含 HTML、CSS、JavaScript');
    lines.push('2. 代码中关键位置添加中文注释');
    lines.push('3. 界面风格简洁专业，适合办公场景');
    lines.push('4. 确保在 Chrome/Edge 等主流浏览器上正常运行');
    lines.push('5. 所有功能在单个 HTML 文件中实现，方便直接使用');
    lines.push('');
    lines.push('请基于以上需求，生成完整的项目代码。');

    return lines.join('\n');
  }

  /**
   * 格式化字段值用于开发 prompt
   */
  function formatPromptValue(field, value) {
    if (value === undefined || value === null || String(value).trim() === '') {
      return '';
    }

    // 对于 select/radio，使用标签文本
    if ((field.type === 'select' || field.type === 'radio') && field.options) {
      var opt = field.options.find(function (o) { return String(o.value) === String(value); });
      if (opt) return opt.label;
    }

    // 对于 checkbox，翻译每个值
    if (field.type === 'checkbox' && field.options) {
      var vals = String(value).split(',');
      return vals.map(function (v) {
        var opt = field.options.find(function (o) { return String(o.value) === String(v); });
        return opt ? opt.label : v;
      }).join('、');
    }

    return String(value);
  }

  /* ===== 对外 API ===== */
  window.App.devPromptGenerator = {
    generate: generate,
  };

})();
