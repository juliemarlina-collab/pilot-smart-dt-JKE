/* =========================================================
   Smart DT Project V3
   js/app.js
   Global app bootstrap only.
   Do not put phase quiz/template logic here.
   ========================================================= */

(function () {
  'use strict';

  window.SmartDTApp = window.SmartDTApp || {};

  window.SmartDTApp.version = '3.0';
  window.SmartDTApp.name = 'Smart DT Project';

  window.SmartDTApp.paths = {
    index: 'index.html',
    welcome: 'welcome.html',
    login: 'login.html',
    dashboard: 'dashboard.html',
    progress: 'progress.html',
    profile: 'profile.html',
    phase01: 'phase01-empathy.html',
    phase02: 'phase02-define.html',
    phase03: 'phase03-ideation.html',
    phase04: 'phase04-prototype.html',
    phase05: 'phase05-test.html'
  };

  window.SmartDTApp.phaseFiles = [
    'phase01-empathy.html',
    'phase02-define.html',
    'phase03-ideation.html',
    'phase04-prototype.html',
    'phase05-test.html'
  ];

  window.SmartDTApp.safeGet = function (key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value !== null ? value : fallback;
    } catch (err) {
      console.warn('Smart DT: localStorage read failed for', key, err);
      return fallback;
    }
  };

  window.SmartDTApp.safeSet = function (key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.warn('Smart DT: localStorage write failed for', key, err);
      return false;
    }
  };

  window.SmartDTApp.safeRemove = function (key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.warn('Smart DT: localStorage remove failed for', key, err);
      return false;
    }
  };

  window.SmartDTApp.ready = function (callback) {
    if (typeof callback !== 'function') return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  window.SmartDTApp.go = function (page) {
    if (!page) return;
    window.location.href = page;
  };

  console.info('Smart DT Project V3 app.js loaded');
}());
