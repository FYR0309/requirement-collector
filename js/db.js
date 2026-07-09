/* ============================================================
   db.js — localStorage 封装
   负责应用状态的持久化存储，所有读写操作统一在这里管理
   挂载点：window.App.db
   ============================================================ */
(function () {
  'use strict';

  // 确保全局命名空间存在
  window.App = window.App || {};

  // localStorage 的键名常量
  var KEY_STATE = 'req_collector_state';       // 当前工作状态
  var KEY_BACKUPS = 'req_collector_backups';    // 已保存的项目备份

  /**
   * 默认初始状态（首次打开或重置后使用）
   */
  var INITIAL_STATE = {
    currentStep: 'selectTemplate',
    selectedTemplateId: null,
    formData: {},
    lastSaved: null,
    completionMap: {
      basicInfo: false,
      existingProcess: false,
      automationGoal: false,
      dataSpec: false,
      constraints: false,
      specialScenarios: false,
    },
  };

  /**
   * 从 localStorage 读取当前工作状态
   * @returns {Object} 应用状态对象（新对象，可安全修改）
   */
  function loadState() {
    try {
      var raw = localStorage.getItem(KEY_STATE);
      if (!raw) {
        return JSON.parse(JSON.stringify(INITIAL_STATE));
      }
      var parsed = JSON.parse(raw);
      // 合并默认值，确保新版本新增的字段有默认值
      var result = JSON.parse(JSON.stringify(INITIAL_STATE));
      Object.keys(parsed).forEach(function (key) {
        if (key === 'completionMap') {
          result.completionMap = Object.assign({}, INITIAL_STATE.completionMap, parsed.completionMap);
        } else {
          result[key] = parsed[key];
        }
      });
      return result;
    } catch (e) {
      console.warn('读取状态失败，使用默认状态', e);
      return JSON.parse(JSON.stringify(INITIAL_STATE));
    }
  }

  /**
   * 将应用状态保存到 localStorage
   * @param {Object} state - 当前应用状态
   */
  function saveState(state) {
    try {
      state.lastSaved = new Date().toISOString();
      localStorage.setItem(KEY_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('保存状态失败（localStorage 可能已满）', e);
      throw new Error('保存失败：存储空间不足，请清理浏览器数据后重试');
    }
  }

  /**
   * 清空当前所有数据，恢复初始状态
   */
  function clearState() {
    try {
      localStorage.removeItem(KEY_STATE);
    } catch (e) {
      console.warn('清空状态失败', e);
    }
  }

  /**
   * 将当前状态备份为一个已命名项目
   * @param {string} projectName - 项目名称
   * @param {Object} state - 要备份的完整状态
   */
  function backupProject(projectName, state) {
    try {
      var backups = listBackups();
      backups[projectName] = Object.assign({}, state, {
        backedUpAt: new Date().toISOString(),
      });
      localStorage.setItem(KEY_BACKUPS, JSON.stringify(backups));
    } catch (e) {
      console.error('备份项目失败', e);
      throw new Error('备份失败：存储空间不足');
    }
  }

  /**
   * 恢复一个已备份的项目
   * @param {string} projectName - 项目名称
   * @returns {Object|null} 备份的状态，不存在则返回 null
   */
  function loadBackup(projectName) {
    try {
      var backups = listBackups();
      return backups[projectName] || null;
    } catch (e) {
      console.error('恢复备份失败', e);
      return null;
    }
  }

  /**
   * 列出所有已备份的项目
   * @returns {Object} { 项目名: 备份数据 }
   */
  function listBackups() {
    try {
      var raw = localStorage.getItem(KEY_BACKUPS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('读取备份列表失败', e);
      return {};
    }
  }

  /**
   * 删除一个备份项目
   * @param {string} projectName - 要删除的项目名称
   */
  function deleteBackup(projectName) {
    try {
      var backups = listBackups();
      delete backups[projectName];
      localStorage.setItem(KEY_BACKUPS, JSON.stringify(backups));
    } catch (e) {
      console.error('删除备份失败', e);
    }
  }

  // 挂载到全局命名空间
  window.App.db = {
    loadState: loadState,
    saveState: saveState,
    clearState: clearState,
    backupProject: backupProject,
    loadBackup: loadBackup,
    listBackups: listBackups,
    deleteBackup: deleteBackup,
  };

})();
