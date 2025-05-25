// Daily Action Tracker - Test Suite
class ActionTrackerTester {
    constructor() {
        this.originalDocumentMethods = null;
        this.originalLocalStorageMethods = null; 
        this.originalChart = null;
        this.originalDate = null;
        
        this.mockedDOMElements = {}; // Central store for mocked DOM elements
        this.docEventListeners = {}; // Store mocked document event listeners

        this.setupMocks(); // Call before creating ActionTracker instance
        this.tracker = new ActionTracker();
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    setupMocks() {
        console.log("Setting up mocks...");

        // Store original methods and objects
        this.originalDocumentMethods = {
            getElementById: document.getElementById,
            querySelector: document.querySelector,
            querySelectorAll: document.querySelectorAll,
            addEventListener: document.addEventListener,
            removeEventListener: document.removeEventListener // Added for completeness
        };

        // Store original localStorage methods before patching
        this.originalLocalStorageMethods = {
            getItem: window.localStorage.getItem.bind(window.localStorage),
            setItem: window.localStorage.setItem.bind(window.localStorage),
            clear: window.localStorage.clear.bind(window.localStorage),
            removeItem: window.localStorage.removeItem.bind(window.localStorage)
        };

        this.originalChart = window.Chart;
        this.originalDate = window.Date;

        // Reset mock stores
        this.mockedDOMElements = {
            'lifeActions': { value: '0', focus: () => {}, style: {}, addEventListener: (event, handler) => { console.log(`Mock lifeActions.addEventListener for ${event}`); } },
            'businessActions': { value: '0', focus: () => {}, style: {}, addEventListener: (event, handler) => { console.log(`Mock businessActions.addEventListener for ${event}`); } },
            'currentDate': { textContent: '', style: {} },
            'todayLife': { textContent: '', style: {} },
            'todayBusiness': { textContent: '', style: {} },
            'todaySummary': { style: { display: 'none' } },
            'streakCount': { textContent: '', style: {} },
            'weekTotal': { textContent: '', style: {} },
            'dailyAverage': { textContent: '', style: {} },
            'bestDay': { textContent: '', style: {} },
            'weeklyChart': { getContext: (contextId) => { console.log(`Mock weeklyChart.getContext('${contextId}')`); return { destroy: () => { console.log("Mock weeklyChart context destroyed"); } }; }, style: {} },
            'monthlyChart': { getContext: (contextId) => { console.log(`Mock monthlyChart.getContext('${contextId}')`); return { destroy: () => { console.log("Mock monthlyChart context destroyed"); } }; }, style: {} },
            'weeklyLifeGoal': { value: '20', style: {} },
            'weeklyBusinessGoal': { value: '15', style: {} },
            'monthlyLifeGoal': { value: '80', style: {} },
            'monthlyBusinessGoal': { value: '60', style: {} },
            'celebrationMessage': { textContent: '', style: {} },
            'celebrationModal': { 
                style: { display: 'none' }, 
                querySelector: (selector) => {
                    if (selector === 'h2') {
                        // Return a consistent reference so textContent updates work
                        if (!self.mockedDOMElements['celebrationModalH2']) {
                            self.mockedDOMElements['celebrationModalH2'] = { textContent: '' };
                        }
                        return self.mockedDOMElements['celebrationModalH2'];
                    }
                    console.warn(`Mock celebrationModal.querySelector for unexpected selector: ${selector}`);
                    return { textContent: ''};
                }
            },
            // Report elements from FUNCTION_REFERENCE.md and script.js
            'weeklyPeriod': { textContent: '', style: {} }, 'weeklyTotalActions': { textContent: '', style: {} },
            'weeklyLifeActions': { textContent: '', style: {} }, 'weeklyBusinessActions': { textContent: '', style: {} },
            'weeklyActiveDays': { textContent: '', style: {} }, 'weeklyAverage': { textContent: '', style: {} },
            'weeklyBestDay': { textContent: '', style: {} }, 'weeklyBestDayDate': { textContent: '', style: {} },
            'weeklyConsistency': { textContent: '', style: {} },
            'monthlyPeriod': { textContent: '', style: {} }, 'monthlyTotalActions': { textContent: '', style: {} },
            'monthlyLifeActions': { textContent: '', style: {} }, 'monthlyBusinessActions': { textContent: '', style: {} },
            'monthlyActiveDays': { textContent: '', style: {} }, 'monthlyAverage': { textContent: '', style: {} },
            'monthlyBestDay': { textContent: '', style: {} }, 'monthlyBestDayDate': { textContent: '', style: {} },
            'monthlyConsistency': { textContent: '', style: {} }, 'monthlyStreak': { textContent: '', style: {} },
        };
        this.docEventListeners = {};

        const self = this; // To capture 'this' for callbacks

        // Patch document methods
        document.getElementById = function(id) {
            // console.log(`Mock document.getElementById called for: ${id}`);
            if (!self.mockedDOMElements[id]) {
                console.warn(`Mock getElementById: Creating generic mock for ID: ${id}`);
                self.mockedDOMElements[id] = {
                    value: '', textContent: '', style: {}, focus: () => {},
                    getContext: id.includes('Chart') ? (contextId) => { console.log(`Mock ${id}.getContext('${contextId}')`); return { destroy: () => { console.log(`Mock chart ${id} context destroyed`); } }; } : undefined,
                    addEventListener: (event, handler) => { console.log(`Mock ${id}.addEventListener for ${event}`); },
                    querySelector: (selector) => {
                        console.warn(`Mock ${id}.querySelector for selector: ${selector}`);
                        return { textContent: '' };
                    },
                };
            }
            return self.mockedDOMElements[id];
        };

        document.querySelector = function(selector) {
            // console.log(`Mock document.querySelector called for: ${selector}`);
            if (selector === '.save-btn') { // Used in saveEntry
                return self.mockedDOMElements['mockSaveBtn'] = self.mockedDOMElements['mockSaveBtn'] || { innerHTML: '', style: {} };
            }
            if (selector === '.streak-fire') { // Used in updateStreakCounter
                return self.mockedDOMElements['mockStreakFire'] = self.mockedDOMElements['mockStreakFire'] || { style: {}, textContent: ''};
            }
            // For selectors like '#celebrationModal h2', it's better if getElementById('celebrationModal').querySelector('h2') is used.
            // The mock for 'celebrationModal' handles its own querySelector.
            console.warn(`Mock document.querySelector: Using generic mock for selector: ${selector}`);
            const key = `querySelector_${selector.replace(/[^a-zA-Z0-9]/g, '_')}`; // Sanitize selector for key
            return self.mockedDOMElements[key] = self.mockedDOMElements[key] || { innerHTML: '', style: {}, textContent: '', focus: () => {}, addEventListener: () => {} };
        };

        document.querySelectorAll = function(selector) {
            // console.log(`Mock document.querySelectorAll called for: ${selector}`);
            if (selector === '#lifeActions, #businessActions') { // Used in script.js DOMContentLoaded for auto-save
                return [self.mockedDOMElements['lifeActions'], self.mockedDOMElements['businessActions']].filter(el => el); // Filter out undefined if any
            }
            console.warn(`Mock document.querySelectorAll: Returning empty array for selector: ${selector}`);
            return [];
        };
        
        document.addEventListener = function(type, listener, options) {
            console.log(`Mock document.addEventListener for type: ${type}`);
            if (!self.docEventListeners[type]) {
                self.docEventListeners[type] = [];
            }
            self.docEventListeners[type].push({listener, options});
            // In a test environment, we typically don't want the original document listeners to fire.
        };
        
        document.removeEventListener = function(type, listener, options) {
            console.log(`Mock document.removeEventListener for type: ${type}`);
            if (self.docEventListeners[type]) {
                self.docEventListeners[type] = self.docEventListeners[type].filter(l => l.listener !== listener);
            }
        };

        // Mock localStorage by patching its methods
        const lsStore = {}; // This will be our in-memory store for the mock

        window.localStorage.getItem = (key) => {
            // console.log(`Mock localStorage.getItem for key: ${key}`);
            return lsStore[key] === undefined ? null : lsStore[key];
        };
        window.localStorage.setItem = (key, value) => {
            // console.log(`Mock localStorage.setItem for key: ${key}, value: ${value}`);
            lsStore[key] = String(value);
        };
        window.localStorage.clear = () => {
            console.log("Mock localStorage.clear()");
            Object.keys(lsStore).forEach(key => delete lsStore[key]);
        };
        window.localStorage.removeItem = (key) => {
            console.log(`Mock localStorage.removeItem for key: ${key}`);
            delete lsStore[key];
        };

        // Mock Chart.js
        const OriginalChart = this.originalChart; // Keep a reference if needed for some reason
        window.Chart = class Chart {
            constructor(ctx, config) {
                console.log('Mock Chart instance created with config:', JSON.stringify(config).substring(0, 100) + '...');
                this.destroy = () => { console.log('Mock Chart destroyed.'); };
                this.config = config; // Store for inspection
                this.ctx = ctx;
                // Simulate Chart.js structure if methods like update are called
                this.data = config.data;
                this.options = config.options;
                this.update = () => { console.log("Mock Chart.update() called."); };
            }
        };

        // Mock Date
        const OriginalDate = this.originalDate; // Crucial for 'super' and 'static now'
        window.Date = class extends OriginalDate {
            constructor(...args) {
                if (args.length === 0) {
                    super('2025-05-23T12:00:00Z'); // Mock current date
                } else {
                    super(...args); // Allow specific date creation
                }
            }
            static now() {
                return new OriginalDate('2025-05-23T12:00:00Z').getTime();
            }
            // Inherits toISOString, getFullYear, getMonth, getDate, etc.
        };
        console.log("Mocks setup complete.");
    }

    cleanupMocks() {
        console.log("Cleaning up mocks...");
        if (this.originalDocumentMethods) {
            document.getElementById = this.originalDocumentMethods.getElementById;
            document.querySelector = this.originalDocumentMethods.querySelector;
            document.querySelectorAll = this.originalDocumentMethods.querySelectorAll;
            document.addEventListener = this.originalDocumentMethods.addEventListener;
            document.removeEventListener = this.originalDocumentMethods.removeEventListener;
        }
        // Restore original localStorage methods
        if (this.originalLocalStorageMethods) {
            window.localStorage.getItem = this.originalLocalStorageMethods.getItem;
            window.localStorage.setItem = this.originalLocalStorageMethods.setItem;
            window.localStorage.clear = this.originalLocalStorageMethods.clear;
            window.localStorage.removeItem = this.originalLocalStorageMethods.removeItem;
        }
        if (this.originalChart) window.Chart = this.originalChart;
        if (this.originalDate) window.Date = this.originalDate;
        
        this.mockedDOMElements = {};
        this.docEventListeners = {};
        console.log("Mocks cleaned up.");
    }

    // Assert function for testing
    assert(condition, message) {
        this.testResults.total++;
        if (condition) {
            this.testResults.passed++;
            console.log(`✅ PASS: ${message}`);
            return true;
        } else {
            this.testResults.failed++;
            console.error(`❌ FAIL: ${message}`);
            // Optionally throw an error to stop on first failure, or collect all failures
            // throw new Error(`Assertion Failed: ${message}`); 
            return false;
        }
    }

    // Helper to set up test data
    setupTestData() {
        window.localStorage.clear(); // Uses patched mock localStorage.clear
        const today = new Date(); // Uses mock Date (2025-05-23)
        const testData = {};
        for (let i = 0; i < 10; i++) {
            const date = new Date(today); // Uses mock Date
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            testData[dateKey] = {
                life: 5 + i,
                business: 3 + (i % 3),
                timestamp: date.toISOString()
            };
        }
        window.localStorage.setItem('actionTrackerData', JSON.stringify(testData)); // Uses patched mock
        return testData;
    }

    // Test Data Loading and Storage Functions
    testDataManagement() {
        console.log("\\n📊 TESTING DATA MANAGEMENT FUNCTIONS");
        const testData = this.setupTestData();
        // Re-initialize tracker to ensure it picks up fresh localStorage data if its constructor reads it.
        // ActionTracker constructor calls this.loadData()
        this.tracker = new ActionTracker(); 
        this.assert(
            JSON.stringify(this.tracker.data) === JSON.stringify(testData),
            "loadData() should correctly load data from localStorage"
        );
        
        this.tracker.data = { testKey: { life: 10, business: 5, timestamp: new Date().toISOString() } };
        this.tracker.saveData();
        const savedData = JSON.parse(window.localStorage.getItem('actionTrackerData')); // Uses patched mock
        this.assert(
            savedData.testKey && savedData.testKey.life === 10 && savedData.testKey.business === 5,
            "saveData() should correctly save data to localStorage"
        );
        
        const customGoals = { weeklyLife: 25, weeklyBusiness: 20, monthlyLife: 100, monthlyBusiness: 80 };
        window.localStorage.setItem('actionTrackerGoals', JSON.stringify(customGoals)); // Uses patched mock
        this.tracker = new ActionTracker(); // Re-init to pick up goals
        this.assert(
            this.tracker.goals.weeklyLife === 25 && this.tracker.goals.weeklyBusiness === 20,
            "loadGoals() should correctly load custom goals from localStorage"
        );
        
        window.localStorage.removeItem('actionTrackerGoals'); // Uses patched mock
        this.tracker = new ActionTracker(); // Re-init
        this.assert(
            this.tracker.goals.weeklyLife === 20 && this.tracker.goals.weeklyBusiness === 15,
            "loadGoals() should provide default goals when none exist"
        );
    }

    // Test Date and Time Management Functions
    testDateFunctions() {
        console.log("\\n🗓️ TESTING DATE FUNCTIONS");
        this.tracker = new ActionTracker(); // Ensure fresh instance with mocked Date
        const todayKey = this.tracker.getTodayKey();
        this.assert(
            todayKey === '2025-05-23',
            "getTodayKey() should return the current date (mocked) in YYYY-MM-DD format"
        );
        
        this.tracker.updateDateDisplay();
        const dateElement = document.getElementById('currentDate'); // Uses mock
        this.assert(
            dateElement.textContent.includes('May 23, 2025'), // Mocked date
            "updateDateDisplay() should update the current date display with mocked date"
        );
    }

    // Test Entry Management Functions
    testEntryFunctions() {
        console.log("\\n📝 TESTING ENTRY FUNCTIONS");
        const testData = this.setupTestData();
        this.tracker = new ActionTracker(); // Uses mocked localStorage and Date
        this.tracker.loadTodaysData(); // Should load data for '2025-05-23'
        
        const lifeField = document.getElementById('lifeActions'); // Mocked
        const businessField = document.getElementById('businessActions'); // Mocked
        
        const expectedTodayData = testData['2025-05-23'];
        this.assert(
            lifeField.value == expectedTodayData.life && businessField.value == expectedTodayData.business,
            `loadTodaysData() should populate form fields with today's data (Life: ${expectedTodayData.life}, Biz: ${expectedTodayData.business})`
        );
        
        const todaySummary = document.getElementById('todaySummary'); // Mocked
        this.assert(
            todaySummary.style.display === 'block',
            "loadTodaysData() should display today's summary"
        );
        
        lifeField.value = '8'; // Set as string, as input fields do
        businessField.value = '6';
        this.tracker.saveEntry(); // Uses mocked document, localStorage, Date
        
        const updatedData = this.tracker.data['2025-05-23'];
        this.assert(
            updatedData.life === 8 && updatedData.business === 6, // saveEntry parses to int
            "saveEntry() should save the form data (parsed as int)"
        );
        
        lifeField.value = '0';
        businessField.value = '0';
        this.tracker.saveEntry(); // Should trigger celebration for empty entry
        const modalElement = document.getElementById('celebrationModal'); // Mocked
        this.assert(
            modalElement.style.display === 'block',
            "saveEntry() should show reminder (celebration modal) when no actions are entered"
        );
        // Close modal for next tests
        if (this.tracker.closeCelebration) this.tracker.closeCelebration();
    }

    // Test Statistics and Calculation Functions
    testStatisticsFunctions() {
        console.log("\\n📊 TESTING STATISTICS FUNCTIONS");
        window.localStorage.clear(); // Uses patched mock
        const statTestData = {};
        const today = new Date(); // Mocked: 2025-05-23
        
        // Today: 5 life, 3 biz = 8 total
        statTestData[today.toISOString().split('T')[0]] = { life: 5, business: 3, timestamp: today.toISOString() };
        
        // Yesterday (2025-05-22): 7 life, 4 biz = 11 total
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        statTestData[yesterday.toISOString().split('T')[0]] = { life: 7, business: 4, timestamp: yesterday.toISOString() };
        
        // 2 days ago (2025-05-21): 10 life, 5 biz = 15 total
        const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
        statTestData[twoDaysAgo.toISOString().split('T')[0]] = { life: 10, business: 5, timestamp: twoDaysAgo.toISOString() };
        
        window.localStorage.setItem('actionTrackerData', JSON.stringify(statTestData)); // Uses patched mock
        this.tracker = new ActionTracker(); // Reloads data
        
        const weekTotal = this.tracker.getWeekTotal(); // Considers last 7 days from mocked 'today'
        // For these 3 days: 8 + 11 + 15 = 34
        this.assert(
            weekTotal === 34,
            `getWeekTotal() should calculate sum for past days (expected 34, got ${weekTotal})`
        );
        
        const bestDay = this.tracker.getBestDay();
        this.assert(
            bestDay === 15,
            `getBestDay() should find day with highest total (expected 15, got ${bestDay})`
        );
        
        this.tracker.updateStreakCounter(); // Uses mocked document.getElementById
        const streakCountEl = document.getElementById('streakCount');
        this.assert(
            streakCountEl.textContent == '3', // Streak of 3 days
            `updateStreakCounter() should count consecutive days (expected 3, got ${streakCountEl.textContent})`
        );
    }

    // Test Chart and Visualization Functions
    testChartFunctions() {
        console.log("\\n📈 TESTING CHART FUNCTIONS");
        this.setupTestData(); // Ensure some data exists
        this.tracker = new ActionTracker();
        
        const weekData = this.tracker.getWeekData();
        this.assert(
            weekData.labels.length === 7 && weekData.lifeData.length === 7 && weekData.businessData.length === 7,
            "getWeekData() should return 7 days of data for weekly chart"
        );
        
        const monthData = this.tracker.getMonthData();
        this.assert(
            monthData.labels.length === 30 && monthData.totalData.length === 30,
            "getMonthData() should return 30 days of data for monthly chart"
        );
        
        let chartInstanceCreated = false;
        const originalChartClass = window.Chart;
        window.Chart = class TestChart { // Temporarily override mock Chart to check instantiation
            constructor(ctx, config) { chartInstanceCreated = true; this.destroy = () => {}; this.config = config; }
        };
        
        this.tracker.createWeeklyChart(); // Uses mocked getElementById and new TestChart
        this.assert(chartInstanceCreated, "createWeeklyChart() should attempt to create a chart instance");
        
        chartInstanceCreated = false; // Reset for next test
        this.tracker.createMonthlyChart();
        this.assert(chartInstanceCreated, "createMonthlyChart() should attempt to create a chart instance");
        
        window.Chart = originalChartClass; // Restore the more general mock Chart or original
    }

    // Test Report Generation Functions
    testReportFunctions() {
        console.log("\\n📋 TESTING REPORT FUNCTIONS");
        this.setupTestData(); // Ensure data for reports
        this.tracker = new ActionTracker();
        
        const weeklyReport = this.tracker.generateWeeklyReport(); // Uses mocked Date
        this.assert(
            weeklyReport.totalActions >= 0 && weeklyReport.period.includes('May'), // Based on mocked date
            "generateWeeklyReport() should produce a weekly report object"
        );
        
        const monthlyReport = this.tracker.generateMonthlyReport(); // Uses mocked Date
        this.assert(
            monthlyReport.totalActions >= 0 && monthlyReport.period.includes('May 2025'), // Based on mocked date
            "generateMonthlyReport() should produce a monthly report object"
        );
        
        // Test safeUpdateElement - it should not throw if element doesn't exist
        // Temporarily make getElementById return null for a specific ID
        const originalGetElementById = document.getElementById;
        const nonExistentId = 'thisIdDoesNotExistForSure' + Math.random();
        document.getElementById = (id) => (id === nonExistentId) ? null : originalGetElementById.call(document, id);
        
        let safeUpdateDidNotThrow = true;
        try {
            this.tracker.safeUpdateElement(nonExistentId, 'test value');
        } catch (e) {
            safeUpdateDidNotThrow = false;
        }
        this.assert(safeUpdateDidNotThrow, "safeUpdateElement() should not throw for non-existent elements");
        document.getElementById = originalGetElementById; // Restore mock
        
        // Test updateReports calls safeUpdateElement, which uses mocked getElementById
        // We need to ensure the report elements are in mockedDOMElements for textContent to be set
        this.tracker.updateReports(); // Should run without error and update mocked elements
        this.assert(document.getElementById('weeklyPeriod').textContent !== '', "updateReports() should populate weekly report DOM elements (mocked)");
        this.assert(document.getElementById('monthlyPeriod').textContent !== '', "updateReports() should populate monthly report DOM elements (mocked)");

    }

    // Test Goal Management Functions
    testGoalFunctions() {
        console.log("\\n🎯 TESTING GOAL FUNCTIONS");
        this.tracker = new ActionTracker(); // Fresh instance
        window.localStorage.removeItem('actionTrackerGoals'); // Clear previous goals for a clean test state
        
        // Mock goal input fields' values before calling updateGoals
        document.getElementById('weeklyLifeGoal').value = '30';
        document.getElementById('weeklyBusinessGoal').value = '25';
        document.getElementById('monthlyLifeGoal').value = '120';
        document.getElementById('monthlyBusinessGoal').value = '100';
        
        this.tracker.updateGoals(); // Reads from mocked elements, saves to mocked localStorage
        
        this.assert(
            this.tracker.goals.weeklyLife === 30 && this.tracker.goals.weeklyBusiness === 25,
            "updateGoals() should update weekly goals in the tracker instance"
        );
        this.assert(
            this.tracker.goals.monthlyLife === 120 && this.tracker.goals.monthlyBusiness === 100,
            "updateGoals() should update monthly goals in the tracker instance"
        );
        
        const savedGoals = JSON.parse(window.localStorage.getItem('actionTrackerGoals')); // Uses patched mock
        this.assert(
            savedGoals && savedGoals.weeklyLife === 30 && savedGoals.monthlyBusiness === 100,
            "updateGoals() should save updated goals to localStorage"
        );
        // Test that celebration modal is shown
        this.assert(document.getElementById('celebrationModal').style.display === 'block', "updateGoals() should show celebration modal");
        if (this.tracker.closeCelebration) this.tracker.closeCelebration(); // Clean up
    }

    // Test UI Helper Functions (excluding those heavily tied to CSS like animations)
    testUIHelperFunctions() {
        console.log("\\n🎨 TESTING UI HELPER FUNCTIONS");
        this.tracker = new ActionTracker();

        // Test resetField
        const lifeField = document.getElementById('lifeActions'); // Mocked
        lifeField.value = '10';
        this.tracker.resetField('lifeActions'); // Uses mocked getElementById
        this.assert(lifeField.value == '0', "resetField() should reset field value to '0'");
        
        // Test showCelebration & closeCelebration
        this.tracker.showCelebration("UI Test Title", "UI Test Message");
        const celebrationModal = document.getElementById('celebrationModal'); // Mocked
        const celebrationMsg = document.getElementById('celebrationMessage'); // Mocked
        const modalH2 = celebrationModal.querySelector('h2'); // Uses mock querySelector on mock element

        this.assert(
            celebrationModal.style.display === 'block' && 
            celebrationMsg.textContent === 'UI Test Message' &&
            modalH2.textContent === 'UI Test Title',
            "showCelebration() should display modal with title and message"
        );
        
        this.tracker.closeCelebration();
        this.assert(celebrationModal.style.display === 'none', "closeCelebration() should hide modal");
    }


    // Test Enhancement Functions
    testEnhancementFunctions() {
        console.log("\n✨ TESTING ENHANCEMENT FUNCTIONS");
        // Ensure methods exist and do not throw
        const methods = [
            'updateProgressRings',
            'updateBadges',
            'updatePersonalBests',
            'renderHeatmap',
            'loadQuickTemplates',
            'generateWeeklyInsights'
        ];
        methods.forEach(name => {
            this.assert(
                typeof this.tracker[name] === 'function',
                `${name}() should be defined`
            );
            let threw = false;
            try { this.tracker[name](); } catch(e) { threw = true; }
            this.assert(
                !threw,
                `${name}() should not throw when called`
            );
        });
        // Test generateWeeklyInsights return structure
        const insights = this.tracker.generateWeeklyInsights();
        const expectedKeys = ['weekTotal','weekLife','weekBusiness','bestDayMessage','streakMessage','goalMessage','suggestion'];
        expectedKeys.forEach(key => {
            this.assert(
                key in insights,
                `generateWeeklyInsights() result should contain ${key}`
            );
        });
    }

    runTests() {
        console.log("🧪 STARTING ACTION TRACKER FUNCTION TESTS");
        let allTestsPassed = false;
        try {
            // Reset results for this run
            this.testResults = { passed: 0, failed: 0, total: 0 };
            
            // Ensure tracker is using current mocks. Constructor already calls setupMocks.
            // If tests modify global state that ActionTracker reads on init, re-init here.
            // this.tracker = new ActionTracker(); // Already created in constructor after setupMocks

            this.testDataManagement();
            this.testDateFunctions();
            this.testEntryFunctions();
            this.testStatisticsFunctions();
            this.testChartFunctions();
            this.testReportFunctions();
            this.testGoalFunctions();
            this.testUIHelperFunctions();
            this.testEnhancementFunctions(); // Run enhancement tests

            // Test global helper functions (defined in script.js)
            console.log("\\n🌐 TESTING GLOBAL HELPER FUNCTIONS");
            
            // Test setQuickValue
            const lifeField = document.getElementById('lifeActions'); // Mocked element
            lifeField.value = '3'; // Initial value as string
            if (typeof window.setQuickValue === 'function') {
                window.setQuickValue('lifeActions', 2); // Adds 2
                // setQuickValue parses field.value, adds, then sets field.value (number to string)
                this.assert(
                    lifeField.value == '5', // Value becomes string '5'
                    "setQuickValue() should add to the current field value"
                );
            } else {
                this.assert(false, "Global function setQuickValue not found on window");
            }

            // Test global saveEntry (if it exists and is different from tracker.saveEntry)
            // Assuming global saveEntry calls tracker.saveEntry as per script.js
            if (typeof window.saveEntry === 'function' && window.tracker === this.tracker) {
                 lifeField.value = '1'; businessActions.value = '1'; // ensure some data
                 window.saveEntry(); // This should call this.tracker.saveEntry()
                 this.assert(this.tracker.data[this.tracker.getTodayKey()].life === 1, "Global saveEntry() should trigger tracker.saveEntry()");
            }


            // Test global closeCelebration
            // Test global resetField
            // Test global updateGoals
            // These typically call methods on the global `tracker` instance.
            // Ensure window.tracker is the one we are testing (this.tracker)
            // For simplicity, these are indirectly tested via this.tracker methods.

            allTestsPassed = this.testResults.failed === 0;

        } catch (e) {
            console.error("ERROR DURING TEST EXECUTION:", e);
            console.error(e.stack); // Log stack trace
            this.assert(false, `Test suite crashed: ${e.message}`);
            allTestsPassed = false; // Ensure it's marked as failed
        } finally {
            this.cleanupMocks(); // CRUCIAL: Restore original environment
        }

        console.log("\\n📋 TEST SUMMARY");
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        
        return allTestsPassed;
    }
}

// Function to run the tests (used by test-runner.html)
function runActionTrackerTests() {
    const tester = new ActionTrackerTester();
    return tester.runTests();
}

// Node.js specific execution (won't run in browser)
if (typeof require !== 'undefined' && require.main === module) {
    // This part is for potential Node.js execution, which is not the primary target here.
    // For this to work in Node, ActionTracker and its dependencies (DOM, localStorage, Chart)
    // would need more extensive Node-compatible mocking (e.g., using jsdom).
    // const { ActionTracker } = require('./script.js'); // This would fail without DOM.
    // global.ActionTracker = ActionTracker; // Make it available if script.js doesn't expose it.
    
    // Basic stubs for browser globals if running in Node without full jsdom
    global.window = global;
    global.localStorage = { getItem: () => null, setItem: () => {}, clear: () => {}, removeItem: () => {} };
    global.document = { 
        getElementById: () => ({ value: '', textContent: '', style: {}, focus: () => {}, getContext: () => ({ destroy: () => {} }), querySelector: () => ({textContent:''}) }),
        querySelector: () => ({ innerHTML: '', style: {}, textContent: '' }),
        querySelectorAll: () => [],
        addEventListener: () => {},
        removeEventListener: () => {}
    };
    global.Chart = class { constructor() { this.destroy = () => {}; } };
    // Date is native in Node.

    // Make global helper functions available if they are defined in script.js
    // This would require parsing script.js or a different module structure.
    // For now, assume they are tested via window.setQuickValue in the browser context.

    runActionTrackerTests();
}

// Export for potential integration with other test runners (e.g. Jest in browser mode)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ActionTrackerTester, runActionTrackerTests };
}