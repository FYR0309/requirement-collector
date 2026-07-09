/* ============================================================
   app.js — 主入口 + 步骤状态机
   职责：初始化应用、管理步骤流转、协调各模块
   依赖：db.js（必须在 app.js 之前加载）
   挂载点：window.App（使用 App.db、App.templates 等子模块）
   ============================================================ */
(function () {
  'use strict';

  /* ===== 步骤定义 ===== */
  var STEP_ORDER = [
    'selectTemplate',    // 步骤0：选择模板
    'basicInfo',         // 步骤1：基础信息
    'existingProcess',   // 步骤2：现有流程
    'automationGoal',    // 步骤3：自动化目标
    'dataSpec',          // 步骤4：数据规范
    'constraints',       // 步骤5：约束限制
    'specialScenarios',  // 步骤6：特殊场景
    'preview',           // 步骤7：预览确认
  ];

  // 步骤的中文显示名
  var STEP_NAMES = {
    selectTemplate: '选择模板',
    basicInfo: '基础信息',
    existingProcess: '现有流程',
    automationGoal: '自动化目标',
    dataSpec: '数据规范',
    constraints: '约束限制',
    specialScenarios: '特殊场景',
    preview: '预览确认',
  };

  // 各模块的描述文字
  var MODULE_DESCRIPTIONS = {
    basicInfo: '请填写项目的基本信息，包括公司名称、联系人、项目背景等。',
    existingProcess: '请描述当前的工作流程，包括涉及的人员、步骤、使用的工具等。',
    automationGoal: '请明确自动化的目标，包括期望达成的效果、关键指标等。',
    dataSpec: '请说明涉及的数据格式、数据来源、数据量等信息。',
    constraints: '请列出技术、时间、预算等方面的约束和限制条件。',
    specialScenarios: '请描述特殊情况和边界场景，确保系统能覆盖各种可能。',
  };

  /* ===== 应用全局状态 ===== */
  var appState = null;

  /* ===== DOM 元素引用（初始化时绑定） ===== */
  var els = {};

  // 自动保存计时器
  var autoSaveTimer = null;
  var AUTO_SAVE_DELAY = 300; // 300ms 防抖

  /* ===== 初始化 ===== */
  function init() {
    // 获取 DOM 引用
    els.stepIndicator = document.getElementById('stepIndicator');
    els.mainContent = document.getElementById('mainContent');
    els.btnPrev = document.getElementById('btnPrev');
    els.btnNext = document.getElementById('btnNext');
    els.btnReset = document.getElementById('btnReset');
    els.saveIndicator = document.getElementById('saveIndicator');
    els.modalOverlay = document.getElementById('modalOverlay');
    els.modalTitle = document.getElementById('modalTitle');
    els.modalMessage = document.getElementById('modalMessage');
    els.modalCancel = document.getElementById('modalCancel');
    els.modalConfirm = document.getElementById('modalConfirm');
    els.toast = document.getElementById('toast');

    // 加载状态
    appState = App.db.loadState();

    // 绑定事件
    els.btnPrev.addEventListener('click', handlePrev);
    els.btnNext.addEventListener('click', handleNext);
    els.btnReset.addEventListener('click', handleReset);
    els.modalCancel.addEventListener('click', closeModal);
    els.modalOverlay.addEventListener('click', function (e) {
      if (e.target === els.modalOverlay) closeModal();
    });

    // 首次渲染
    renderStepIndicator();
    renderCurrentStep();
    updateNavButtons();

    // 如果恢复的状态有 lastSaved，显示
    if (appState.lastSaved) {
      showSaveTime(appState.lastSaved);
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ===== 步骤指示器渲染 ===== */
  function renderStepIndicator() {
    var steps = els.stepIndicator.querySelectorAll('.step');
    var connectors = els.stepIndicator.querySelectorAll('.step-connector');
    var currentIdx = STEP_ORDER.indexOf(appState.currentStep);

    steps.forEach(function (stepEl) {
      var stepName = stepEl.dataset.step;
      var stepIdx = STEP_ORDER.indexOf(stepName);

      stepEl.classList.remove('active', 'completed');

      if (stepIdx < currentIdx) {
        stepEl.classList.add('completed');
        stepEl.onclick = (function (name) {
          return function () { navigateTo(name); };
        })(stepName);
      } else if (stepIdx === currentIdx) {
        stepEl.classList.add('active');
        stepEl.onclick = null;
      } else {
        stepEl.onclick = null;
      }
    });

    // 连接线颜色
    connectors.forEach(function (conn, i) {
      if (i < currentIdx) {
        conn.classList.add('completed');
      } else {
        conn.classList.remove('completed');
      }
    });
  }

  /* ===== 当前步骤内容渲染 ===== */
  function renderCurrentStep() {
    var step = appState.currentStep;
    var html = '';

    if (step === 'selectTemplate') {
      html = renderTemplateSelection();
    } else if (step === 'preview') {
      html = renderPreviewPlaceholder();
    } else {
      html = renderFormStep(step);
    }

    els.mainContent.innerHTML = html;
  }

  /**
   * 渲染模板选择页
   */
  function renderTemplateSelection() {
    // 如果模板模块已加载，使用真实数据渲染
    if (App.templates && App.templates.getAll) {
      return renderRealTemplateSelection();
    }
    return renderPlaceholderTemplateSelection();
  }

  function renderPlaceholderTemplateSelection() {
    return '<div class="content-card">'
      + '<h2>📑 选择需求采集模板</h2>'
      + '<p class="card-desc">根据项目类型选择对应的行业模板，系统将引导您逐步填写需求信息。</p>'
      + '<div class="template-grid">'
      + '<div class="template-card"><div class="card-icon">💰</div><div class="card-name">财务台账</div><div class="card-version">简易版</div><div class="card-desc">基础财务流程自动化需求采集</div></div>'
      + '<div class="template-card"><div class="card-icon">💰</div><div class="card-name">财务台账</div><div class="card-version">完整版</div><div class="card-desc">全面财务系统自动化需求采集</div></div>'
      + '<div class="template-card" style="opacity:0.5;"><div class="card-icon">🏭</div><div class="card-name">生产车间</div><div class="card-version">即将推出</div><div class="card-desc">车间管理流程自动化需求采集</div></div>'
      + '<div class="template-card" style="opacity:0.5;"><div class="card-icon">👥</div><div class="card-name">行政人事</div><div class="card-version">即将推出</div><div class="card-desc">行政人事流程自动化需求采集</div></div>'
      + '<div class="template-card" style="opacity:0.5;"><div class="card-icon">📊</div><div class="card-name">销售台账</div><div class="card-version">即将推出</div><div class="card-desc">销售数据管理自动化需求采集</div></div>'
      + '</div>'
      + '<p style="margin-top:16px;font-size:0.82rem;color:var(--color-text-muted);text-align:center;">'
      + '💡 提示：完整版包含更多细节字段，适用于复杂项目；简易版聚焦核心需求，适用于快速采集。</p>'
      + '</div>';
  }

  function renderRealTemplateSelection() {
    var templates = App.templates.getAll();
    var cardsHtml = '';
    Object.keys(templates).forEach(function (id) {
      var t = templates[id];
      cardsHtml += '<div class="template-card" data-template="' + t.id + '" onclick="App.selectTemplate(\'' + t.id + '\')">'
        + '<div class="card-icon">' + t.icon + '</div>'
        + '<div class="card-name">' + t.industryName + '</div>'
        + '<div class="card-version">' + t.versionLabel + '</div>'
        + '<div class="card-desc">' + t.description + '</div>'
        + '</div>';
    });
    return '<div class="content-card">'
      + '<h2>📑 选择需求采集模板</h2>'
      + '<p class="card-desc">根据项目类型选择对应的行业模板，系统将引导您逐步填写需求信息。</p>'
      + '<div class="template-grid">' + cardsHtml + '</div>'
      + '<p style="margin-top:16px;font-size:0.82rem;color:var(--color-text-muted);text-align:center;">'
      + '💡 提示：完整版包含更多细节字段，适用于复杂项目；简易版聚焦核心需求，适用于快速采集。</p>'
      + '</div>';
  }

  /**
   * 渲染表单步骤
   */
  function renderFormStep(stepName) {
    var displayName = STEP_NAMES[stepName];
    var desc = MODULE_DESCRIPTIONS[stepName] || '';

    // 如果表单渲染器可用，用它来渲染
    if (App.formRenderer && App.formRenderer.renderModule && appState.selectedTemplateId && App.templates) {
      var template = App.templates.getById(appState.selectedTemplateId);
      if (template) {
        return App.formRenderer.renderModule(template, stepName, appState.formData);
      }
    }

    // 否则显示占位
    return '<div class="content-card">'
      + '<h2>📝 ' + displayName + '</h2>'
      + '<p class="card-desc">' + desc + '</p>'
      + '<div style="padding:40px;text-align:center;color:var(--color-text-muted);">'
      + '<p style="font-size:3rem;margin-bottom:12px;">🚧</p>'
      + '<p>表单模块将在后续阶段实现</p>'
      + '<p style="font-size:0.8rem;">当前步骤：' + displayName + '</p>'
      + '</div></div>';
  }

  /**
   * 渲染预览页（使用真实的生成器）
   */
  function renderPreviewPlaceholder() {
    // 检查是否有可用的生成器
    if (!appState.selectedTemplateId || !App.templates || !App.docGenerator || !App.devPromptGenerator) {
      return '<div class="content-card">'
        + '<h2>✅ 预览确认</h2>'
        + '<p class="card-desc">请先选择模板并填写需求信息。</p>'
        + '<div style="padding:40px;text-align:center;color:var(--color-text-muted);">'
        + '<p style="font-size:3rem;margin-bottom:12px;">📝</p>'
        + '<p>请返回上一步选择模板</p>'
        + '</div></div>';
    }

    var template = App.templates.getById(appState.selectedTemplateId);
    if (!template) return '<div class="content-card"><p>模板未找到</p></div>';

    var docHtml = App.docGenerator.generate(template, appState.formData);
    var devPrompt = App.devPromptGenerator.generate(template, appState.formData);

    return '<div class="content-card" style="max-width:100%;">'
      + '<h2>✅ 预览确认</h2>'
      + '<p class="card-desc">请核对以下需求信息，确认无误后可复制或下载输出文件。</p>'
      + '<div class="preview-container">'

      // 左栏：客户确认书
      + '<div class="preview-panel">'
      + '<div class="preview-panel-header">'
      + '<span>📄 客户确认书</span>'
      + '<span>'
      + '<button class="btn btn-sm btn-outline" onclick="App.export_.printDocument(document.getElementById(\'docContent\').innerHTML)">🖨 打印</button>'
      + '<button class="btn btn-sm btn-primary" onclick="App.export_.downloadAsFile(document.getElementById(\'docContent\').innerText, \'需求确认书.txt\')">⬇ 下载</button>'
      + '</span>'
      + '</div>'
      + '<div class="preview-panel-body doc-preview" id="docContent">' + docHtml + '</div>'
      + '</div>'

      // 右栏：开发 Prompt
      + '<div class="preview-panel">'
      + '<div class="preview-panel-header">'
      + '<span>🤖 Claude Code 开发文本</span>'
      + '<button class="btn btn-sm btn-success" onclick="App.copyDevPrompt()">📋 一键复制</button>'
      + '</div>'
      + '<div class="preview-panel-body" id="devPromptContent">' + escapeHtmlForPreview(devPrompt) + '</div>'
      + '</div>'

      + '</div></div>';
  }

  /**
   * 复制开发 Prompt 到剪贴板
   */
  function copyDevPrompt() {
    var template = App.templates.getById(appState.selectedTemplateId);
    if (!template) return;
    var devPrompt = App.devPromptGenerator.generate(template, appState.formData);
    App.export_.copyToClipboard(devPrompt).then(function (ok) {
      if (ok) {
        App.showToast('✅ 已复制！可直接粘贴到 Claude Code 使用');
      } else {
        App.showToast('⚠️ 复制失败，请手动选中文本复制');
      }
    });
  }

  function escapeHtmlForPreview(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ===== 步骤导航 ===== */
  function navigateTo(stepName) {
    var targetIdx = STEP_ORDER.indexOf(stepName);
    var currentIdx = STEP_ORDER.indexOf(appState.currentStep);

    // 只允许跳转到已完成或当前步骤
    if (targetIdx > currentIdx) return;

    appState.currentStep = stepName;
    renderStepIndicator();
    renderCurrentStep();
    updateNavButtons();
  }

  function handleNext() {
    var currentIdx = STEP_ORDER.indexOf(appState.currentStep);
    var currentStep = appState.currentStep;

    // 如果是表单步骤且已选模板，执行校验
    if (appState.selectedTemplateId && currentStep !== 'selectTemplate' && currentStep !== 'preview') {
      if (App.validator && App.templates) {
        var template = App.templates.getById(appState.selectedTemplateId);
        if (template) {
          var result = App.validator.validateModule(template, currentStep, appState.formData);
          if (!result.valid) {
            App.validator.showErrors(result.errors);
            showToast('⚠️ 请填写所有必填项后再继续（共 ' + result.errors.length + ' 项未填）');
            return; // 阻止跳转
          }
        }
      }
      // 校验通过，标记模块完成
      appState.completionMap[currentStep] = true;
      App.validator.clearErrors();
    }

    if (currentIdx < STEP_ORDER.length - 1) {
      appState.currentStep = STEP_ORDER[currentIdx + 1];
      renderStepIndicator();
      renderCurrentStep();
      updateNavButtons();
      autoSave();
    }
  }

  function handlePrev() {
    var currentIdx = STEP_ORDER.indexOf(appState.currentStep);
    if (currentIdx > 0) {
      appState.currentStep = STEP_ORDER[currentIdx - 1];
      renderStepIndicator();
      renderCurrentStep();
      updateNavButtons();
    }
  }

  function updateNavButtons() {
    var currentIdx = STEP_ORDER.indexOf(appState.currentStep);

    // 上一步按钮：第一步时禁用
    els.btnPrev.disabled = (currentIdx === 0);

    // 下一步按钮：最后一步时改变文字
    if (currentIdx === STEP_ORDER.length - 1) {
      els.btnNext.textContent = '✅ 完成';
    } else {
      els.btnNext.textContent = '下一步 →';
    }
  }

  /* ===== 重新开始 ===== */
  function handleReset() {
    showModal({
      title: '确认重新开始',
      message: '将清空所有已填写的数据，此操作无法撤销。\n\n如需保留当前数据，请先使用备份功能。',
      confirmText: '确认清空',
      onConfirm: function () {
        App.db.clearState();
        appState = App.db.loadState();
        renderStepIndicator();
        renderCurrentStep();
        updateNavButtons();
        showToast('已清空所有数据，重新开始');
      },
    });
  }

  /* ===== 模板选择回调 ===== */
  function selectTemplate(templateId) {
    appState.selectedTemplateId = templateId;
    appState.completionMap = {
      basicInfo: false,
      existingProcess: false,
      automationGoal: false,
      dataSpec: false,
      constraints: false,
      specialScenarios: false,
    };
    // 选择后自动跳转到第一步
    appState.currentStep = 'basicInfo';
    renderStepIndicator();
    renderCurrentStep();
    updateNavButtons();
    autoSave();
    showToast('已选择模板：' + (App.templates.getById(templateId) || {}).name || templateId);
  }

  /* ===== 字段变更回调（由表单渲染器调用） ===== */
  function onFieldChange(fieldId, value) {
    appState.formData[fieldId] = value;
    autoSave();
  }

  /* ===== 自动保存 ===== */
  function autoSave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    els.saveIndicator.textContent = '⏳ 正在保存...';
    els.saveIndicator.className = 'save-indicator saving';

    autoSaveTimer = setTimeout(function () {
      try {
        App.db.saveState(appState);
        showSaveTime(appState.lastSaved);
      } catch (e) {
        showToast('⚠️ 保存失败：' + e.message);
      }
    }, AUTO_SAVE_DELAY);
  }

  function showSaveTime(isoString) {
    var time = new Date(isoString);
    var timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    els.saveIndicator.textContent = '💾 已自动保存 ' + timeStr;
    els.saveIndicator.className = 'save-indicator';
  }

  /* ===== 弹窗系统 ===== */
  function showModal(opts) {
    els.modalTitle.textContent = opts.title;
    els.modalMessage.textContent = opts.message;
    els.modalConfirm.textContent = opts.confirmText || '确认';
    els.modalConfirm.className = 'btn btn-danger';
    els.modalOverlay.style.display = 'flex';

    els.modalConfirm.onclick = function () {
      closeModal();
      if (opts.onConfirm) opts.onConfirm();
    };
  }

  function closeModal() {
    els.modalOverlay.style.display = 'none';
  }

  /* ===== Toast 提示 ===== */
  function showToast(message) {
    els.toast.textContent = message;
    els.toast.style.display = 'block';
    // 重新触发动画
    els.toast.style.animation = 'none';
    els.toast.offsetHeight; // 强制回流
    els.toast.style.animation = 'toastIn 0.3s ease, toastOut 0.3s ease 2.2s forwards';

    setTimeout(function () {
      els.toast.style.display = 'none';
    }, 2500);
  }

  /* ===== 对外暴露的 API（挂载到 window.App） ===== */
  window.App = window.App || {};
  Object.assign(window.App, {
    // 状态
    getState: function () { return appState; },
    // 步骤常量
    STEP_ORDER: STEP_ORDER,
    STEP_NAMES: STEP_NAMES,
    // 导航
    navigateTo: navigateTo,
    handleNext: handleNext,
    handlePrev: handlePrev,
    // 模板选择
    selectTemplate: selectTemplate,
    // 字段变更
    onFieldChange: onFieldChange,
    // 复制开发 Prompt
    copyDevPrompt: copyDevPrompt,
    // 标记数据脏（触发自动保存）
    markDirty: function () { autoSave(); },
    // UI 工具
    showToast: showToast,
    showModal: showModal,
    closeModal: closeModal,
    // 重新渲染（当外部模块更新后）
    refreshUI: function () {
      renderStepIndicator();
      renderCurrentStep();
      updateNavButtons();
    },
  });

})();
