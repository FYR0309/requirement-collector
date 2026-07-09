/* ============================================================
   form-renderer.js — 动态表单渲染引擎
   读取模板字段定义，自动生成交互式表单 DOM
   挂载点：window.App.formRenderer
   ============================================================ */
(function () {
  'use strict';

  window.App = window.App || {};

  /* ===== 模块标题映射 ===== */
  var MODULE_TITLES = {
    basicInfo: '📋 基础信息',
    existingProcess: '🔄 现有流程',
    automationGoal: '🎯 自动化目标',
    dataSpec: '📊 数据规范',
    constraints: '⚠️ 约束限制',
    specialScenarios: '🔍 特殊场景',
  };

  /**
   * 渲染指定模块的表单 HTML
   * @param {Object} template - 模板对象
   * @param {string} moduleName - 模块名
   * @param {Object} formData - 当前表单数据 { fieldId: value }
   * @returns {string} HTML 字符串
   */
  function renderModule(template, moduleName, formData) {
    var fields = template.fields
      .filter(function (f) { return f.module === moduleName; })
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

    if (fields.length === 0) {
      return '<div class="content-card"><h2>' + MODULE_TITLES[moduleName] + '</h2>'
        + '<p style="color:var(--color-text-muted);text-align:center;padding:40px;">此模块暂无字段</p></div>';
    }

    var title = MODULE_TITLES[moduleName] || moduleName;
    var html = '<div class="content-card"><h2>' + title + '</h2>';

    // 渲染每个字段
    fields.forEach(function (field) {
      html += renderField(field, formData);
    });

    html += '</div>';
    return html;
  }

  /**
   * 渲染单个字段
   * @param {Object} field - 字段定义
   * @param {Object} formData - 当前数据
   * @returns {string} HTML 字符串
   */
  function renderField(field, formData) {
    var value = formData[field.id] !== undefined ? formData[field.id] : (field.defaultValue || '');
    var requiredMark = field.required ? '<span class="required-star">*</span>' : '';
    var hintHtml = field.hint ? '<div class="field-hint">' + escapeHtml(field.hint) + '</div>' : '';

    var inputHtml = '';
    switch (field.type) {
      case 'text':
        inputHtml = renderTextInput(field, value);
        break;
      case 'textarea':
        inputHtml = renderTextarea(field, value);
        break;
      case 'select':
        inputHtml = renderSelect(field, value);
        break;
      case 'radio':
        inputHtml = renderRadioGroup(field, value);
        break;
      case 'checkbox':
        inputHtml = renderCheckboxGroup(field, value);
        break;
      case 'file':
        inputHtml = renderFileUpload(field, value);
        break;
      default:
        inputHtml = '<p style="color:var(--color-danger);">未知字段类型：' + field.type + '</p>';
    }

    return '<div class="form-field" data-field-id="' + field.id + '">'
      + '<label class="field-label">' + escapeHtml(field.label) + requiredMark + '</label>'
      + inputHtml
      + hintHtml
      + '<div class="field-error" id="err-' + field.id + '"></div>'
      + '</div>';
  }

  /* ----- 各类型字段渲染 ----- */

  function renderTextInput(field, value) {
    var maxAttr = field.maxLength ? ' maxlength="' + field.maxLength + '"' : '';
    var placeholder = field.placeholder ? ' placeholder="' + escapeAttr(field.placeholder) + '"' : '';
    return '<input type="text" id="field-' + field.id + '" value="' + escapeAttr(String(value))
      + '"' + placeholder + maxAttr
      + ' onchange="App.onFieldChange(\'' + field.id + '\', this.value)"'
      + ' oninput="App.onFieldChange(\'' + field.id + '\', this.value)">';
  }

  function renderTextarea(field, value) {
    var maxAttr = field.maxLength ? ' maxlength="' + field.maxLength + '"' : '';
    var placeholder = field.placeholder ? ' placeholder="' + escapeAttr(field.placeholder) + '"' : '';
    var countHtml = '';
    if (field.maxLength) {
      countHtml = '<div class="char-count" id="count-' + field.id + '">'
        + String(value).length + '/' + field.maxLength + '</div>';
    }
    return '<textarea id="field-' + field.id + '" rows="4"'
      + placeholder + maxAttr
      + ' onchange="App.onFieldChange(\'' + field.id + '\', this.value)"'
      + ' oninput="App.onFieldChange(\'' + field.id + '\', this.value);'
      + ' var ce=document.getElementById(\'count-' + field.id + '\');'
      + ' if(ce){ce.textContent=this.value.length+\'/' + field.maxLength + '\';'
      + ' ce.className=\'char-count' + (field.maxLength ? '' : '') + '\';}"'
      + '>' + escapeHtml(String(value)) + '</textarea>' + countHtml;
  }

  function renderSelect(field, value) {
    var html = '<select id="field-' + field.id + '" onchange="App.onFieldChange(\'' + field.id + '\', this.value)">';
    html += '<option value="">-- 请选择 --</option>';
    (field.options || []).forEach(function (opt) {
      var sel = (String(value) === String(opt.value)) ? ' selected' : '';
      html += '<option value="' + escapeAttr(opt.value) + '"' + sel + '>' + escapeHtml(opt.label) + '</option>';
    });
    html += '</select>';
    return html;
  }

  function renderRadioGroup(field, value) {
    var html = '<div class="radio-group">';
    (field.options || []).forEach(function (opt) {
      var sel = (String(value) === String(opt.value)) ? ' selected' : '';
      html += '<label class="radio-item' + sel + '" onclick="'
        + 'var items=this.parentNode.querySelectorAll(\'.radio-item\');'
        + 'items.forEach(function(i){i.classList.remove(\'selected\');});'
        + 'this.classList.add(\'selected\');'
        + 'App.onFieldChange(\'' + field.id + '\', \'' + escapeAttr(opt.value) + '\');'
        + '">'
        + '<input type="radio" name="' + field.id + '" value="' + escapeAttr(opt.value) + '"'
        + (sel ? ' checked' : '') + '>'
        + escapeHtml(opt.label)
        + '</label>';
    });
    html += '</div>';
    return html;
  }

  function renderCheckboxGroup(field, value) {
    var selectedValues = Array.isArray(value) ? value : (value ? value.split(',') : []);
    var html = '<div class="checkbox-group" data-field="' + field.id + '">';
    (field.options || []).forEach(function (opt) {
      var isSel = selectedValues.indexOf(String(opt.value)) >= 0;
      html += '<label class="checkbox-item' + (isSel ? ' selected' : '') + '" onclick="'
        + 'this.classList.toggle(\'selected\');'
        + 'var cb=this.querySelector(\'input\');'
        + 'cb.checked=!cb.checked;'
        + 'var group=this.parentNode;'
        + 'var vals=[];'
        + 'group.querySelectorAll(\'input:checked\').forEach(function(c){vals.push(c.value);});'
        + 'App.onFieldChange(\'' + field.id + '\', vals.join(\',\'));'
        + '">'
        + '<input type="checkbox" value="' + escapeAttr(opt.value) + '"'
        + (isSel ? ' checked' : '') + '>'
        + escapeHtml(opt.label)
        + '</label>';
    });
    html += '</div>';
    return html;
  }

  function renderFileUpload(field, value) {
    var fileHtml = value
      ? '<div class="file-name">📎 已选文件：' + escapeHtml(String(value)) + '</div>'
      : '';
    return '<div class="file-upload-zone" onclick="document.getElementById(\'file-' + field.id + '\').click()">'
      + '<div class="upload-icon">📁</div>'
      + '<div class="upload-text">点击选择文件（记录文件名作为参考）</div>'
      + '<input type="file" id="file-' + field.id + '" style="display:none;" onchange="'
      + 'var fn=this.files[0]?this.files[0].name:\'\';'
      + 'App.onFieldChange(\'' + field.id + '\', fn);'
      + 'var zone=this.parentNode;'
      + 'var existing=zone.querySelector(\'.file-name\');'
      + 'if(existing)existing.remove();'
      + 'if(fn){var d=document.createElement(\'div\');d.className=\'file-name\';d.textContent=\'📎 已选文件：\'+fn;zone.appendChild(d);}'
      + '">'
      + '</div>' + fileHtml;
  }

  /* ----- 工具函数 ----- */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ===== 对外 API ===== */
  window.App.formRenderer = {
    renderModule: renderModule,
    renderField: renderField,
  };

})();
