/* ============================================================
   validator.js — 表单校验
   校验必填字段，返回错误列表
   挂载点：window.App.validator
   ============================================================ */
(function () {
  'use strict';

  window.App = window.App || {};

  /**
   * 校验指定模块的所有必填字段
   * @param {Object} template - 模板对象
   * @param {string} moduleName - 模块名
   * @param {Object} formData - 当前表单数据
   * @returns {Object} { valid: boolean, errors: [{fieldId, label, message}] }
   */
  function validateModule(template, moduleName, formData) {
    var fields = template.fields.filter(function (f) {
      return f.module === moduleName && f.required;
    });

    var errors = [];
    fields.forEach(function (field) {
      var value = formData[field.id];
      var isEmpty = value === undefined || value === null || String(value).trim() === '';

      if (isEmpty) {
        errors.push({
          fieldId: field.id,
          label: field.label,
          message: '「' + field.label + '」为必填项，请填写后再继续',
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * 校验所有模块（预览前使用）
   * @param {Object} template - 模板对象
   * @param {Object} formData - 当前表单数据
   * @returns {Object} { valid: boolean, moduleErrors: { moduleName: errors[] } }
   */
  function validateAll(template, formData) {
    var modules = ['basicInfo', 'existingProcess', 'automationGoal', 'dataSpec', 'constraints', 'specialScenarios'];
    var moduleErrors = {};
    var allValid = true;

    modules.forEach(function (mod) {
      var result = validateModule(template, mod, formData);
      if (!result.valid) {
        moduleErrors[mod] = result.errors;
        allValid = false;
      }
    });

    return {
      valid: allValid,
      moduleErrors: moduleErrors,
    };
  }

  /**
   * 在页面上显示校验错误
   * @param {Array} errors - validateModule 返回的 errors 数组
   */
  function showErrors(errors) {
    // 先清除所有错误
    document.querySelectorAll('.field-error').forEach(function (el) {
      el.classList.remove('visible');
      el.textContent = '';
    });
    document.querySelectorAll('input.error, textarea.error, select.error').forEach(function (el) {
      el.classList.remove('error');
    });

    // 显示当前错误
    errors.forEach(function (err) {
      var errEl = document.getElementById('err-' + err.fieldId);
      if (errEl) {
        errEl.textContent = err.message;
        errEl.classList.add('visible');
      }
      var inputEl = document.getElementById('field-' + err.fieldId);
      if (inputEl) {
        inputEl.classList.add('error');
      }
    });
  }

  /**
   * 清除所有校验错误提示
   */
  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(function (el) {
      el.classList.remove('visible');
      el.textContent = '';
    });
    document.querySelectorAll('input.error, textarea.error, select.error').forEach(function (el) {
      el.classList.remove('error');
    });
  }

  /* ===== 对外 API ===== */
  window.App.validator = {
    validateModule: validateModule,
    validateAll: validateAll,
    showErrors: showErrors,
    clearErrors: clearErrors,
  };

})();
