/* ============================================================
   export.js — 复制/下载/打印工具
   挂载点：window.App.export_
   ============================================================ */
(function () {
  'use strict';

  window.App = window.App || {};

  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 是否成功
   */
  function copyToClipboard(text) {
    // 优先使用现代 API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  /**
   * 降级复制方案（兼容 file:// 协议）
   */
  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      document.body.removeChild(textarea);
      return false;
    }
  }

  /**
   * 下载为文件
   * @param {string} text - 文件内容
   * @param {string} filename - 文件名
   * @param {string} mimeType - MIME 类型（默认 text/plain）
   */
  function downloadAsFile(text, filename, mimeType) {
    mimeType = mimeType || 'text/plain;charset=utf-8';
    var blob = new Blob(['﻿' + text], { type: mimeType }); // BOM 确保中文不乱码
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 打印 HTML 内容
   * @param {string} htmlString - 要打印的 HTML
   */
  function printDocument(htmlString) {
    var printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      // 弹窗被拦截，降级为同页面打印
      var origContent = document.body.innerHTML;
      document.body.innerHTML = htmlString;
      window.print();
      document.body.innerHTML = origContent;
      location.reload();
      return;
    }
    printWindow.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>打印确认书</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;line-height:1.8;padding:40px;max-width:800px;margin:0 auto;color:#1e293b;}');
    printWindow.document.write('h2{text-align:center;color:#1a73e8;}');
    printWindow.document.write('h3{color:#1a73e8;border-bottom:2px solid #e8f0fe;padding-bottom:4px;margin-top:20px;}');
    printWindow.document.write('.qa-pair{margin-bottom:10px;}');
    printWindow.document.write('.qa-q{font-weight:600;}');
    printWindow.document.write('.qa-a{padding-left:16px;border-left:3px solid #e8f0fe;color:#64748b;}');
    printWindow.document.write('@media print{body{padding:20px;}}');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(htmlString);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(function () {
      printWindow.print();
    }, 500);
  }

  /* ===== 对外 API ===== */
  window.App.export_ = {
    copyToClipboard: copyToClipboard,
    downloadAsFile: downloadAsFile,
    printDocument: printDocument,
  };

})();
