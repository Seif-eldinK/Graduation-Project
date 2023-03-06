// Manage Theme Preferences / Color mode toggler
(() => {
    'use strict'

    const THEMES = ['auto', 'dark', 'light']

    function isUserPreferringDarkMode() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    function getThemeFromLocalStorage() {
        return localStorage.getItem('theme');
    }

    function getPreferredTheme() {
        let storedTheme = getThemeFromLocalStorage()
        if (storedTheme && THEMES.includes(storedTheme)) {
            return storedTheme
        }

        return 'auto'
    }

    function setTheme(theme) {
        if (theme === 'auto' && isUserPreferringDarkMode()) {
            document.documentElement.setAttribute('data-bs-theme', 'dark')
        } else if (theme === 'auto') {
            document.documentElement.setAttribute('data-bs-theme', 'light')
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme)
        }
        localStorage.setItem('theme', theme)
    }

    setTheme(getPreferredTheme())

    function showActiveTheme(theme) {
        const activeThemeIcon = document.querySelector('.theme-icon-active')
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
        const iconOfActiveBtn = btnToActive.querySelector('i').classList
        const iconClass = String(iconOfActiveBtn).split(' ')[1];

        document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
            element.classList.remove('active')
        })

        btnToActive.classList.add('active')
        activeThemeIcon.className = `bi ${iconClass} my-1 theme-icon-active`
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        let storedTheme = getThemeFromLocalStorage()
        if (storedTheme === 'auto' || !THEMES.includes(storedTheme)) setTheme(getPreferredTheme())
    })

    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme())

        document.querySelectorAll('[data-bs-theme-value]')
            .forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const theme = toggle.getAttribute('data-bs-theme-value')
                    setTheme(theme)
                    showActiveTheme(theme)
                })
            })
    })
})()
