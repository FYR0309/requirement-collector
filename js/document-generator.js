/* ============================================================
   document-generator.js — 客户确认书生成器
   将表单数据转换为通俗易懂的客户确认书 HTML
   挂载点：window.App.docGenerator
   ============================================================ */
(function () {
  'use strict';

  window.App = window.App || {};

  var MODULE_TITLES = {
    basicInfo: '一、基本信息',
    existingProcess: '二、现有流程',
    automationGoal: '三、自动化目标',
    dataSpec: '四、数据规范',
    constraints: '五、约束限制',
    specialScenarios: '六、特殊场景',
  };

  /**
   * 生成客户确认书 HTML
   * @param {Object} template - 模板对象
   * @param {Object} formData - 表单数据
   * @returns {string} 确认书 HTML 字符串
   */
  function generate(template, formData) {
    var modules = ['basicInfo', 'existingProcess', 'automationGoal', 'dataSpec', 'constraints', 'specialScenarios'];
    var now = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

    var html = '<div class="doc-preview">';
    html += '<h2 style="text-align:center;margin-bottom:4px;">自动化项目需求确认书</h2>';
    html += '<p style="text-align:center;color:var(--color-text-muted);font-size:0.85rem;margin-bottom:20px;">'
      + '模板：' + escapeHtml(template.name) + ' | 生成日期：' + now + '</p>';

    modules.forEach(function (mod) {
      var fields = template.fields
        .filter(function (f) { return f.module === mod; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

      html += '<h3>' + MODULE_TITLES[mod] + '</h3>';

      var hasContent = false;
      fields.forEach(function (field) {
        var value = formData[field.id];
        var displayValue = formatValue(field, value);
        html += '<div class="qa-pair">';
        html += '<div class="qa-q">问：' + escapeHtml(field.label) + '</div>';
        html += '<div class="qa-a">答：' + (displayValue || '（未填写）') + '</div>';
        html += '</div>';
        if (displayValue) hasContent = true;
      });

      if (!hasContent) {
        html += '<p style="color:var(--color-text-muted);font-style:italic;">（此部分尚未填写）</p>';
      }
    });

    // 底部签字区
    html += '<hr style="margin-top:24px;border:0;border-top:1px solid var(--color-border);">';
    html += '<div style="margin-top:16px;font-size:0.88rem;">';
    html += '<p><strong>客户确认：</strong></p>';
    html += '<p style="margin-top:20px;">签字：________________ &nbsp;&nbsp; 日期：________________</p>';
    html += '<p style="margin-top:10px;color:var(--color-text-muted);font-size:0.8rem;">'
      + '以上需求信息经本人/本部门确认无误，可作为后续开发依据。</p>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  /**
   * 格式化字段值用于展示
   */
  function formatValue(field, value) {
    if (value === undefined || value === null || String(value).trim() === '') {
      return '';
    }

    // 对于 select/radio 类型，尝试翻译为选项标签
    if ((field.type === 'select' || field.type === 'radio') && field.options) {
      var opt = field.options.find(function (o) { return String(o.value) === String(value); });
      if (opt) return opt.label;
    }

    // 对于 checkbox，翻译每个选中值
    if (field.type === 'checkbox' && field.options) {
      var vals = String(value).split(',');
      return vals.map(function (v) {
        var opt = field.options.find(function (o) { return String(o.value) === String(v); });
        return opt ? opt.label : v;
      }).join('、');
    }

    return String(value);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ===== 对外 API ===== */
  window.App.docGenerator = {
    generate: generate,
  };

})();
