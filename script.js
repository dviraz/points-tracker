// Daily Action Tracker - JavaScript
class ActionTracker {
    constructor() {
        this.data = this.loadData();
        this.goals = this.loadGoals();
        this.achievements = this.loadAchievements();
        this.personalBests = this.loadPersonalBests();
        this.weeklyChart = null;
        this.monthlyChart = null;
        this.init();
    }

    init() {
        this.updateDateDisplay();
        this.loadTodaysData();
        this.updateStreakCounter();
        this.updateStats();
        this.createCharts();
        this.updateGoalProgress();
        this.updateReports();
        this.loadGoalSettings();
        // Enhance features
        this.updateProgressRings();
        this.updateBadges();
        this.updatePersonalBests();
        this.renderHeatmap();
        this.loadQuickTemplates();
        this.generateWeeklyInsights();
    }

    loadData() {
        const saved = localStorage.getItem('actionTrackerData');
        return saved ? JSON.parse(saved) : {};
    }

    loadGoals() {
        const saved = localStorage.getItem('actionTrackerGoals');
        return saved ? JSON.parse(saved) : {
            weeklyLife: 20,
            weeklyBusiness: 15,
            monthlyLife: 80,
            monthlyBusiness: 60
        };
    }

    loadAchievements() {
        const saved = localStorage.getItem('actionTrackerAchievements');
        return saved ? JSON.parse(saved) : {};
    }

    loadPersonalBests() {
        const saved = localStorage.getItem('actionTrackerPersonalBests');
        return saved ? JSON.parse(saved) : {
            longestStreak: 0,
            longestStreakDate: null,
            mostProductiveDay: 0,
            mostProductiveDayDate: null,
            bestWeek: 0,
            bestWeekDate: null,
            bestMonth: 0,
            bestMonthDate: null,
            mostLifeActions: 0,
            mostLifeActionsDate: null,
            mostBusinessActions: 0,
            mostBusinessActionsDate: null
        };
    }

    saveData() {
        localStorage.setItem('actionTrackerData', JSON.stringify(this.data));
    }

    saveGoals() {
        localStorage.setItem('actionTrackerGoals', JSON.stringify(this.goals));
    }

    saveAchievements() {
        localStorage.setItem('actionTrackerAchievements', JSON.stringify(this.achievements));
    }

    savePersonalBests() {
        localStorage.setItem('actionTrackerPersonalBests', JSON.stringify(this.personalBests));
    }

    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    updateDateDisplay() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = today.toLocaleDateString('en-US', options);
        }
    }

    loadTodaysData() {
        const today = this.getTodayKey();
        const todayData = this.data[today];
        
        if (todayData) {
            const lifeField = document.getElementById('lifeActions');
            const businessField = document.getElementById('businessActions');
            if (lifeField) lifeField.value = todayData.life || 0;
            if (businessField) businessField.value = todayData.business || 0;
            
            const summaryEl = document.getElementById('todaySummary');
            if (summaryEl) summaryEl.style.display = 'block';
            this.showTodaySummary(todayData.life || 0, todayData.business || 0);
        } else {
            const lifeField = document.getElementById('lifeActions');
            const businessField = document.getElementById('businessActions');
            if (lifeField) lifeField.value = 0;
            if (businessField) businessField.value = 0;
            
            const summaryEl = document.getElementById('todaySummary');
            if (summaryEl) summaryEl.style.display = 'none';
        }
    }

    showTodaySummary(life, business) {
        const todayLifeEl = document.getElementById('todayLife');
        const todayBusinessEl = document.getElementById('todayBusiness');
        const todaySummaryEl = document.getElementById('todaySummary');
        
        if (todayLifeEl) todayLifeEl.textContent = life;
        if (todayBusinessEl) todayBusinessEl.textContent = business;
        if (todaySummaryEl) todaySummaryEl.style.display = 'block';
    }

    updateStreakCounter() {
        let streak = 0;
        let currentDate = new Date();
        
        while (true) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayData = this.data[dateKey];
            
            if (dayData && (dayData.life > 0 || dayData.business > 0)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        const streakCountEl = document.getElementById('streakCount');
        if (streakCountEl) {
            streakCountEl.textContent = streak;
            
            // Add streak celebration
            if (streak > 0) {
                streakCountEl.style.color = '#48bb78';
                if (streak >= 7) {
                    streakCountEl.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
                    streakCountEl.style.webkitBackgroundClip = 'text';
                    streakCountEl.style.webkitTextFillColor = 'transparent';
                }
            }
        }
    }

    // Unified getWeekTotal method that works with or without type parameter
    getWeekTotal(type = null) {
        let total = 0;
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() - i);
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayData = this.data[dateKey];
            
            if (dayData) {
                if (type === 'life') {
                    total += (dayData.life || 0);
                } else if (type === 'business') {
                    total += (dayData.business || 0);
                } else {
                    // If no type specified, return total of both life and business
                    total += (dayData.life || 0) + (dayData.business || 0);
                }
            }
        }
        
        return total;
    }

    getMonthlyAverage() {
        const monthData = this.getMonthData();
        const total = monthData.totalData.reduce((sum, val) => sum + val, 0);
        const daysWithData = monthData.totalData.filter(val => val > 0).length;
        return daysWithData > 0 ? total / daysWithData : 0;
    }

    getBestDay() {
        let max = 0;
        Object.values(this.data).forEach(day => {
            const total = (day.life || 0) + (day.business || 0);
            if (total > max) max = total;
        });
        return max;
    }

    updateStats() {
        const weekTotal = this.getWeekTotal();
        const monthlyAverage = this.getMonthlyAverage();
        const bestDay = this.getBestDay();

        const weekTotalEl = document.getElementById('weekTotal');
        const dailyAverageEl = document.getElementById('dailyAverage');
        const bestDayEl = document.getElementById('bestDay');

        if (weekTotalEl) weekTotalEl.textContent = weekTotal;
        if (dailyAverageEl) dailyAverageEl.textContent = monthlyAverage.toFixed(1);
        if (bestDayEl) bestDayEl.textContent = bestDay;
    }

    createCharts() {
        this.createWeeklyChart();
        this.createMonthlyChart();
    }

    getWeekData() {
        const labels = [];
        const lifeData = [];
        const businessData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dateKey = date.toISOString().split('T')[0];
            const dayData = this.data[dateKey] || { life: 0, business: 0 };
            
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            lifeData.push(dayData.life);
            businessData.push(dayData.business);
        }
        
        return { labels, lifeData, businessData };
    }

    getMonthData() {
        const labels = [];
        const totalData = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayData = this.data[dateKey];
            
            const dayLabel = date.getDate();
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
            labels.push(`${monthLabel} ${dayLabel}`);
            totalData.push(dayData ? dayData.life + dayData.business : 0);
        }
        
        return { labels, totalData };
    }

    createWeeklyChart() {
        const chartEl = document.getElementById('weeklyChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        const weekData = this.getWeekData();
        
        if (typeof Chart !== 'undefined') {
            // Store reference to this for use in event handlers
            const tracker = this;
            
            this.weeklyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: weekData.labels,
                    datasets: [
                        {
                            label: 'Life Actions',
                            data: weekData.lifeData.map(val => val === 0 ? 1 : val), // Ensure 0-value bars are visible and clickable
                            backgroundColor: 'rgba(72, 187, 120, 0.7)',
                            borderColor: 'rgba(72, 187, 120, 1)',
                            borderWidth: 2
                        },
                        {
                            label: 'Business Actions',
                            data: weekData.businessData.map(val => val === 0 ? 1 : val), // Ensure 0-value bars are visible and clickable
                            backgroundColor: 'rgba(102, 126, 234, 0.7)',
                            borderColor: 'rgba(102, 126, 234, 1)',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    },
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'This Week\'s Progress (Click bars to edit)' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const datasetLabel = context.dataset.label || '';
                                    const dataIndex = context.dataIndex;
                                    const clickedDate = tracker.getDateFromChartIndex(dataIndex);
                                    const dayData = tracker.data[clickedDate];
                                    let actualValue = 0;
                                    if (dayData) {
                                        if (datasetLabel === 'Life Actions') {
                                            actualValue = dayData.life || 0;
                                        } else if (datasetLabel === 'Business Actions') {
                                            actualValue = dayData.business || 0;
                                        }
                                    }
                                    return `${datasetLabel}: ${actualValue}`;
                                },
                                afterLabel: function(context) {
                                    return 'Click to edit this day';
                                }
                            }
                        }
                    },
                    onClick: function(event, elements) {
                        if (elements.length > 0) {
                            const elementIndex = elements[0].index;
                            const clickedDate = tracker.getDateFromChartIndex(elementIndex);
                            tracker.openEditModal(clickedDate);
                        }
                    },
                    onHover: function(event, elements) {
                        if (event.native && event.native.target) {
                            event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                        }
                    }
                }
            });
        }
    }

    createMonthlyChart() {
        const chartEl = document.getElementById('monthlyChart');
        if (!chartEl) return;
        
        const ctx = chartEl.getContext('2d');
        const monthData = this.getMonthData();
        
        if (typeof Chart !== 'undefined') {
            this.monthlyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthData.labels,
                    datasets: [{
                        label: 'Total Daily Actions',
                        data: monthData.totalData,
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    },
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Last 30 Days Trend' }
                    }
                }
            });
        }
    }

    updateCharts() {
        if (this.weeklyChart) {
            this.weeklyChart.destroy();
        }
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
        }
        this.createCharts();
    }

    updateGoalProgress() {
        const weeklyLife = this.getWeekTotal('life');
        const weeklyBusiness = this.getWeekTotal('business');
        
        // Update life goal progress
        const lifeProgress = Math.min((weeklyLife / this.goals.weeklyLife) * 100, 100);
        const lifeProgressBar = document.getElementById('lifeGoalProgress');
        const lifeGoalText = document.getElementById('lifeGoalText');
        
        if (lifeProgressBar) {
            lifeProgressBar.style.width = lifeProgress + '%';
        }
        if (lifeGoalText) {
            lifeGoalText.textContent = `${weeklyLife} / ${this.goals.weeklyLife}`;
        }
        
        // Update business goal progress
        const businessProgress = Math.min((weeklyBusiness / this.goals.weeklyBusiness) * 100, 100);
        const businessProgressBar = document.getElementById('businessGoalProgress');
        const businessGoalText = document.getElementById('businessGoalText');
        
        if (businessProgressBar) {
            businessProgressBar.style.width = businessProgress + '%';
        }
        if (businessGoalText) {
            businessGoalText.textContent = `${weeklyBusiness} / ${this.goals.weeklyBusiness}`;
        }
    }

    generateWeeklyReport() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        
        let totalLife = 0;
        let totalBusiness = 0;
        let activeDays = 0;
        let bestDay = 0;
        let bestDayDate = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const dayData = this.data[dateKey];
            
            if (dayData) {
                totalLife += dayData.life;
                totalBusiness += dayData.business;
                activeDays++;
                
                const dayTotal = dayData.life + dayData.business;
                if (dayTotal > bestDay) {
                    bestDay = dayTotal;
                    bestDayDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                }
            }
        }
        
        return {
            period: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            totalLife,
            totalBusiness,
            totalActions: totalLife + totalBusiness,
            activeDays,
            averagePerDay: activeDays > 0 ? ((totalLife + totalBusiness) / activeDays).toFixed(1) : 0,
            bestDay,
            bestDayDate: bestDayDate || 'No data',
            consistency: ((activeDays / 7) * 100).toFixed(0)
        };
    }

    generateMonthlyReport() {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        
        let totalLife = 0;
        let totalBusiness = 0;
        let activeDays = 0;
        let bestDay = 0;
        let bestDayDate = '';
        
        for (let i = 0; i < daysInMonth; i++) {
            const date = new Date(monthStart);
            date.setDate(monthStart.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const dayData = this.data[dateKey];
            
            if (dayData && (dayData.life > 0 || dayData.business > 0)) {
                totalLife += dayData.life;
                totalBusiness += dayData.business;
                activeDays++;
                
                const dayTotal = dayData.life + dayData.business;
                if (dayTotal > bestDay) {
                    bestDay = dayTotal;
                    bestDayDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                }
            }
        }
        
        // Use the existing getCurrentStreak() method for accurate streak calculation
        const currentStreak = this.getCurrentStreak();
        
        return {
            period: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            totalLife,
            totalBusiness,
            totalActions: totalLife + totalBusiness,
            activeDays,
            averagePerDay: activeDays > 0 ? ((totalLife + totalBusiness) / activeDays).toFixed(1) : 0,
            bestDay,
            bestDayDate: bestDayDate || 'No data',
            consistency: ((activeDays / daysInMonth) * 100).toFixed(0),
            currentStreak: currentStreak
        };
    }

    updateReports() {
        if (!document.getElementById('weeklyPeriod')) {
            return;
        }

        const weeklyReport = this.generateWeeklyReport();
        const monthlyReport = this.generateMonthlyReport();
        
        // Update weekly report
        this.safeUpdateElement('weeklyPeriod', weeklyReport.period);
        this.safeUpdateElement('weeklyTotalActions', weeklyReport.totalActions);
        this.safeUpdateElement('weeklyLifeActions', weeklyReport.totalLife);
        this.safeUpdateElement('weeklyBusinessActions', weeklyReport.totalBusiness);
        this.safeUpdateElement('weeklyActiveDays', weeklyReport.activeDays);
        this.safeUpdateElement('weeklyAverage', weeklyReport.averagePerDay);
        this.safeUpdateElement('weeklyBestDay', weeklyReport.bestDay);
        this.safeUpdateElement('weeklyBestDayDate', weeklyReport.bestDayDate);
        this.safeUpdateElement('weeklyConsistency', weeklyReport.consistency + '%');
        
        // Update monthly report
        this.safeUpdateElement('monthlyPeriod', monthlyReport.period);
        this.safeUpdateElement('monthlyTotalActions', monthlyReport.totalActions);
        this.safeUpdateElement('monthlyLifeActions', monthlyReport.totalLife);
        this.safeUpdateElement('monthlyBusinessActions', monthlyReport.totalBusiness);
        this.safeUpdateElement('monthlyActiveDays', monthlyReport.activeDays);
        this.safeUpdateElement('monthlyAverage', monthlyReport.averagePerDay);
        this.safeUpdateElement('monthlyBestDay', monthlyReport.bestDay);
        this.safeUpdateElement('monthlyBestDayDate', monthlyReport.bestDayDate);
        this.safeUpdateElement('monthlyConsistency', monthlyReport.consistency + '%');
        this.safeUpdateElement('monthlyStreak', monthlyReport.currentStreak);
    }

    safeUpdateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    loadGoalSettings() {
        const weeklyLifeGoal = document.getElementById('weeklyLifeGoal');
        const weeklyBusinessGoal = document.getElementById('weeklyBusinessGoal');
        const monthlyLifeGoal = document.getElementById('monthlyLifeGoal');
        const monthlyBusinessGoal = document.getElementById('monthlyBusinessGoal');

        if (weeklyLifeGoal) weeklyLifeGoal.value = this.goals.weeklyLife;
        if (weeklyBusinessGoal) weeklyBusinessGoal.value = this.goals.weeklyBusiness;
        if (monthlyLifeGoal) monthlyLifeGoal.value = this.goals.monthlyLife;
        if (monthlyBusinessGoal) monthlyBusinessGoal.value = this.goals.monthlyBusiness;
    }

    updateGoals() {
        const weeklyLife = parseInt(document.getElementById('weeklyLifeGoal').value) || 20;
        const weeklyBusiness = parseInt(document.getElementById('weeklyBusinessGoal').value) || 15;
        const monthlyLife = parseInt(document.getElementById('monthlyLifeGoal').value) || 80;
        const monthlyBusiness = parseInt(document.getElementById('monthlyBusinessGoal').value) || 60;

        this.goals = {
            weeklyLife,
            weeklyBusiness,
            monthlyLife,
            monthlyBusiness
        };

        this.saveGoals();
        this.updateGoalProgress();
        
        this.showCelebration("🎯 Goals Updated!", "Your new goals have been saved successfully!");
    }

    // Basic implementations for enhancement features
    updateProgressRings() {
        // Get today's data
        const today = this.getTodayKey();
        const todayData = this.data[today] || { life: 0, business: 0 };
        
        const lifeActions = todayData.life || 0;
        const businessActions = todayData.business || 0;
        const totalActions = lifeActions + businessActions;
        
        // Update ring values
        const lifeRingValue = document.getElementById('lifeRingValue');
        const businessRingValue = document.getElementById('businessRingValue');
        const totalRingValue = document.getElementById('totalRingValue');
        
        if (lifeRingValue) lifeRingValue.textContent = lifeActions;
        if (businessRingValue) businessRingValue.textContent = businessActions;
        if (totalRingValue) totalRingValue.textContent = totalActions;
        
        // Update progress ring visual indicators
        const lifeRing = document.getElementById('lifeProgressRing');
        const businessRing = document.getElementById('businessProgressRing');
        const totalRing = document.getElementById('totalProgressRing');
        
        // Calculate progress percentages (max 20 actions for full ring)
        const maxActions = 20;
        const lifeProgress = Math.min((lifeActions / maxActions) * 100, 100);
        const businessProgress = Math.min((businessActions / maxActions) * 100, 100);
        const totalProgress = Math.min((totalActions / (maxActions * 2)) * 100, 100);
        
        // Update stroke-dasharray for progress rings
        const circumference = 2 * Math.PI * 50; // radius = 50
        
        if (lifeRing) {
            const offset = circumference - (lifeProgress / 100) * circumference;
            lifeRing.style.strokeDasharray = `${circumference} ${circumference}`;
            lifeRing.style.strokeDashoffset = offset;
        }
        
        if (businessRing) {
            const offset = circumference - (businessProgress / 100) * circumference;
            businessRing.style.strokeDasharray = `${circumference} ${circumference}`;
            businessRing.style.strokeDashoffset = offset;
        }
        
        if (totalRing) {
            const offset = circumference - (totalProgress / 100) * circumference;
            totalRing.style.strokeDasharray = `${circumference} ${circumference}`;
            totalRing.style.strokeDashoffset = offset;
        }
    }

    updateBadges() {
        const currentStreak = this.getCurrentStreak();
        const totalActions = this.getTotalActions();
        const todayActions = this.getTodayActions();
        const weeklyBalance = this.getWeeklyBalance();
        
        // First Day Badge
        const firstDayBadge = document.getElementById('badge-first-day');
        if (firstDayBadge) {
            if (totalActions > 0) {
                firstDayBadge.classList.add('earned');
                this.achievements['first-day'] = true;
            } else {
                firstDayBadge.classList.remove('earned');
            }
        }
        
        // Week Streak Badge
        const weekStreakBadge = document.getElementById('badge-week-streak');
        if (weekStreakBadge) {
            if (currentStreak >= 7) {
                weekStreakBadge.classList.add('earned');
                this.achievements['week-streak'] = true;
            } else {
                weekStreakBadge.classList.remove('earned');
            }
        }
        
        // Month Streak Badge
        const monthStreakBadge = document.getElementById('badge-month-streak');
        if (monthStreakBadge) {
            if (currentStreak >= 30) {
                monthStreakBadge.classList.add('earned');
                this.achievements['month-streak'] = true;
            } else {
                monthStreakBadge.classList.remove('earned');
            }
        }
        
        // Hundred Actions Badge
        const hundredActionsBadge = document.getElementById('badge-hundred-actions');
        if (hundredActionsBadge) {
            if (totalActions >= 100) {
                hundredActionsBadge.classList.add('earned');
                this.achievements['hundred-actions'] = true;
            } else {
                hundredActionsBadge.classList.remove('earned');
            }
        }
        
        // Big Day Badge
        const bigDayBadge = document.getElementById('badge-big-day');
        if (bigDayBadge) {
            if (todayActions >= 20) {
                bigDayBadge.classList.add('earned');
                this.achievements['big-day'] = true;
            } else {
                bigDayBadge.classList.remove('earned');
            }
        }
        
        // Consistency Badge (balanced life/business actions)
        const consistencyBadge = document.getElementById('badge-consistency');
        if (consistencyBadge) {
            if (weeklyBalance) {
                consistencyBadge.classList.add('earned');
                this.achievements['consistency'] = true;
            } else {
                consistencyBadge.classList.remove('earned');
            }
        }
        
        // Save achievements
        this.saveAchievements();
    }

    updatePersonalBests() {
        const currentStreak = this.getCurrentStreak();
        const todayActions = this.getTodayActions();
        const weekTotal = this.getWeekTotal();
        const monthTotal = this.getMonthTotal();
        const todayData = this.getTodayData();
        const today = this.getTodayKey();
        
        let updated = false;
        
        // Update longest streak
        if (currentStreak > this.personalBests.longestStreak) {
            this.personalBests.longestStreak = currentStreak;
            this.personalBests.longestStreakDate = today;
            updated = true;
        }
        
        // Update most productive day
        if (todayActions > this.personalBests.mostProductiveDay) {
            this.personalBests.mostProductiveDay = todayActions;
            this.personalBests.mostProductiveDayDate = today;
            updated = true;
        }
        
        // Update best week
        if (weekTotal > this.personalBests.bestWeek) {
            this.personalBests.bestWeek = weekTotal;
            this.personalBests.bestWeekDate = today;
            updated = true;
        }
        
        // Update best month
        if (monthTotal > this.personalBests.bestMonth) {
            this.personalBests.bestMonth = monthTotal;
            this.personalBests.bestMonthDate = today;
            updated = true;
        }
        
        // Update most life actions in a day
        if (todayData.life > this.personalBests.mostLifeActions) {
            this.personalBests.mostLifeActions = todayData.life;
            this.personalBests.mostLifeActionsDate = today;
            updated = true;
        }
        
        // Update most business actions in a day
        if (todayData.business > this.personalBests.mostBusinessActions) {
            this.personalBests.mostBusinessActions = todayData.business;
            this.personalBests.mostBusinessActionsDate = today;
            updated = true;
        }
        
        // Update UI elements
        this.safeUpdateElement('bestStreak', this.personalBests.longestStreak);
        this.safeUpdateElement('bestStreakDate', this.formatDate(this.personalBests.longestStreakDate));
        this.safeUpdateElement('bestSingleDay', this.personalBests.mostProductiveDay);
        this.safeUpdateElement('bestSingleDayDate', this.formatDate(this.personalBests.mostProductiveDayDate));
        this.safeUpdateElement('bestWeek', this.personalBests.bestWeek);
        this.safeUpdateElement('bestWeekDate', this.formatDate(this.personalBests.bestWeekDate));
        this.safeUpdateElement('bestMonth', this.personalBests.bestMonth);
        this.safeUpdateElement('bestMonthDate', this.formatDate(this.personalBests.bestMonthDate));
        this.safeUpdateElement('bestLifeDay', this.personalBests.mostLifeActions);
        this.safeUpdateElement('bestLifeDayDate', this.formatDate(this.personalBests.mostLifeActionsDate));
        this.safeUpdateElement('bestBusinessDay', this.personalBests.mostBusinessActions);
        this.safeUpdateElement('bestBusinessDayDate', this.formatDate(this.personalBests.mostBusinessActionsDate));
        
        // Save if updated
        if (updated) {
            this.savePersonalBests();
        }
    }

    renderHeatmap() {
        const heatmapGrid = document.getElementById('heatmapGrid');
        if (!heatmapGrid) return;
        
        // Clear existing heatmap
        heatmapGrid.innerHTML = '';
        
        // Generate last 365 days
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);
        
        // Create weeks array
        const weeks = [];
        let currentWeek = [];
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const dayData = this.data[dateKey] || { life: 0, business: 0 };
            const totalActions = dayData.life + dayData.business;
            
            // Determine activity level (0-4)
            let level = 0;
            if (totalActions > 0) level = 1;
            if (totalActions >= 5) level = 2;
            if (totalActions >= 10) level = 3;
            if (totalActions >= 15) level = 4;
            
            const dayInfo = {
                date: dateKey,
                level: level,
                actions: totalActions,
                life: dayData.life,
                business: dayData.business
            };
            
            currentWeek.push(dayInfo);
            
            // If it's Sunday or the last day, complete the week
            if (date.getDay() === 0 || i === 364) {
                weeks.push([...currentWeek]);
                currentWeek = [];
            }
        }
        
        // Create heatmap HTML
        weeks.forEach(week => {
            const weekDiv = document.createElement('div');
            weekDiv.className = 'heatmap-week';
            
            week.forEach(day => {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'heatmap-day';
                dayDiv.setAttribute('data-level', day.level);
                dayDiv.setAttribute('data-date', day.date);
                dayDiv.setAttribute('data-actions', day.actions);
                dayDiv.setAttribute('data-life', day.life);
                dayDiv.setAttribute('data-business', day.business);
                
                // Add tooltip functionality
                dayDiv.addEventListener('mouseenter', (e) => {
                    const tooltip = document.getElementById('heatmapTooltip');
                    if (tooltip) {
                        const date = new Date(day.date);
                        const dateStr = date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                        });
                        
                        tooltip.querySelector('.tooltip-date').textContent = dateStr;
                        tooltip.querySelector('.tooltip-actions').textContent =
                            `${day.actions} actions (${day.life} life, ${day.business} business)`;
                        
                        tooltip.style.display = 'block';
                        tooltip.style.left = e.pageX + 10 + 'px';
                        tooltip.style.top = e.pageY - 10 + 'px';
                    }
                });
                
                dayDiv.addEventListener('mouseleave', () => {
                    const tooltip = document.getElementById('heatmapTooltip');
                    if (tooltip) {
                        tooltip.style.display = 'none';
                    }
                });
                
                weekDiv.appendChild(dayDiv);
            });
            
            heatmapGrid.appendChild(weekDiv);
        });
    }

    loadQuickTemplates() {
        // Generate insights based on user's action history
        const weekData = this.getWeekData();
        const currentStreak = this.getCurrentStreak();
        const weekTotal = this.getWeekTotal();
        const weekLife = this.getWeekTotal('life');
        const weekBusiness = this.getWeekTotal('business');
        
        const insights = [];
        
        // Insight 1: Weekly performance
        if (weekTotal > 0) {
            const avgDaily = (weekTotal / 7).toFixed(1);
            insights.push({
                icon: '📊',
                text: `You're averaging ${avgDaily} actions per day this week. ${weekTotal > 35 ? 'Excellent pace!' : weekTotal > 20 ? 'Good momentum!' : 'Room to grow!'}`
            });
        } else {
            insights.push({
                icon: '📊',
                text: 'Start tracking your daily actions to see your progress patterns and build momentum.'
            });
        }
        
        // Insight 2: Streak motivation
        if (currentStreak > 0) {
            insights.push({
                icon: '🎯',
                text: `${currentStreak}-day streak active! ${currentStreak >= 7 ? 'You\'re on fire!' : 'Keep it going!'} Consistency builds lasting habits.`
            });
        } else {
            insights.push({
                icon: '🎯',
                text: 'Start your streak today! Even small actions count towards building momentum.'
            });
        }
        
        // Insight 3: Balance analysis
        if (weekLife > 0 && weekBusiness > 0) {
            const ratio = weekLife / weekBusiness;
            if (ratio >= 0.8 && ratio <= 1.2) {
                insights.push({
                    icon: '💡',
                    text: 'Great balance between life and business actions! This holistic approach leads to sustainable growth.'
                });
            } else if (weekLife > weekBusiness) {
                insights.push({
                    icon: '💡',
                    text: 'Strong focus on life actions this week. Consider adding some business activities for balanced growth.'
                });
            } else {
                insights.push({
                    icon: '💡',
                    text: 'Heavy business focus this week. Don\'t forget to nurture your personal life for overall well-being.'
                });
            }
        } else if (weekLife > 0) {
            insights.push({
                icon: '💡',
                text: 'Great personal development focus! Consider adding business actions to accelerate your professional growth.'
            });
        } else if (weekBusiness > 0) {
            insights.push({
                icon: '💡',
                text: 'Strong business momentum! Balance it with life actions for sustainable long-term success.'
            });
        } else {
            insights.push({
                icon: '💡',
                text: 'Ready to start? Try setting small, achievable goals for both life and business areas.'
            });
        }
        
        // Insight 4: Motivational recommendation
        const bestDay = Math.max(...weekData.lifeData.map((life, i) => life + weekData.businessData[i]));
        if (bestDay > 0) {
            insights.push({
                icon: '⭐',
                text: `Your best day this week had ${bestDay} actions! You've proven you can do it - aim to repeat that energy.`
            });
        } else {
            insights.push({
                icon: '⭐',
                text: 'Every expert was once a beginner. Start with just one action today and build from there!'
            });
        }
        
        // Update insight cards
        insights.forEach((insight, index) => {
            const cardId = `insightCard${index + 1}`;
            const card = document.getElementById(cardId);
            if (card) {
                const iconEl = card.querySelector('.insight-icon');
                const textEl = card.querySelector('.insight-text');
                if (iconEl) iconEl.textContent = insight.icon;
                if (textEl) textEl.textContent = insight.text;
            }
        });
    }
// Helper methods for badge and personal best calculations
    getTotalActions() {
        let total = 0;
        Object.values(this.data).forEach(day => {
            total += (day.life || 0) + (day.business || 0);
        });
        return total;
    }

    getTodayActions() {
        const today = this.getTodayKey();
        const todayData = this.data[today] || { life: 0, business: 0 };
        return (todayData.life || 0) + (todayData.business || 0);
    }

    getTodayData() {
        const today = this.getTodayKey();
        return this.data[today] || { life: 0, business: 0 };
    }

    getWeeklyBalance() {
        const weekLife = this.getWeekTotal('life');
        const weekBusiness = this.getWeekTotal('business');
        
        if (weekLife === 0 && weekBusiness === 0) return false;
        if (weekLife === 0 || weekBusiness === 0) return false;
        
        const ratio = weekLife / weekBusiness;
        return ratio >= 0.7 && ratio <= 1.3; // Within 30% of each other
    }

    getMonthTotal() {
        let total = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() - i);
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayData = this.data[dateKey];
            
            if (dayData) {
                total += (dayData.life || 0) + (dayData.business || 0);
            }
        }
        
        return total;
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    generateWeeklyInsights() {
        // Get weekly data
        const weekData = this.getWeekData();
        const weekLife = weekData.lifeData.reduce((sum, val) => sum + val, 0);
        const weekBusiness = weekData.businessData.reduce((sum, val) => sum + val, 0);
        const weekTotal = weekLife + weekBusiness;
        
        // Get day with most activity
        let bestDay = 0;
        let bestDayIndex = -1;
        for (let i = 0; i < weekData.lifeData.length; i++) {
            const dayTotal = weekData.lifeData[i] + weekData.businessData[i];
            if (dayTotal > bestDay) {
                bestDay = dayTotal;
                bestDayIndex = i;
            }
        }
        
        // Calculate goal progress
        const lifeGoalProgress = Math.round((weekLife / this.goals.weeklyLife) * 100);
        const businessGoalProgress = Math.round((weekBusiness / this.goals.weeklyBusiness) * 100);
        
        // Get current streak
        const streak = this.getCurrentStreak();
        
        // Generate insights object with all expected properties
        return {
            weekTotal: weekTotal,
            weekLife: weekLife,
            weekBusiness: weekBusiness,
            bestDayMessage: bestDayIndex >= 0 ?
                `Your most productive day was ${weekData.labels[bestDayIndex]} with ${bestDay} actions` :
                "No actions recorded this week yet",
            streakMessage: streak === 0 ?
                "You don't have an active streak yet. Start today!" :
                `You're on a ${streak}-day streak! 🔥`,
            goalMessage: `Life actions: ${lifeGoalProgress}% of weekly goal. Business actions: ${businessGoalProgress}% of weekly goal.`,
            suggestion: this.generateSuggestion(weekLife, weekBusiness, streak)
        };
    }

    getCurrentStreak() {
        let streak = 0;
        let currentDate = new Date();
        
        while (true) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayData = this.data[dateKey];
            
            if (dayData && (dayData.life > 0 || dayData.business > 0)) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    generateSuggestion(weekLife, weekBusiness, streak) {
        // Generate personalized suggestions based on data
        if (weekLife === 0 && weekBusiness === 0) {
            return "Start small with just one or two actions today to build momentum.";
        } else if (weekLife < weekBusiness / 2) {
            return "Consider adding more life actions for better work-life balance.";
        } else if (weekBusiness < weekLife / 2) {
            return "Try to focus on some business actions to maintain balance.";
        } else if (streak === 0) {
            return "Log actions daily to build a streak and create consistent habits.";
        } else if (streak > 0 && streak < 7) {
            return `Keep going! You're ${7 - streak} days away from a 7-day streak badge.`;
        } else {
            return "You're doing great with balanced actions. Keep up the good work!";
        }
    }

    saveEntry() {
        const lifeActions = parseInt(document.getElementById('lifeActions').value) || 0;
        const businessActions = parseInt(document.getElementById('businessActions').value) || 0;
        
        if (lifeActions === 0 && businessActions === 0) {
            this.showCelebration("Don't forget to add your actions! 😊", "Every action counts, no matter how small!");
            return;
        }

        const today = this.getTodayKey();
        this.data[today] = {
            life: lifeActions,
            business: businessActions,
            timestamp: new Date().toISOString()
        };

        this.saveData();
        this.showTodaySummary(lifeActions, businessActions);
        this.updateStreakCounter();
        this.updateStats();
        this.updateCharts();
        this.updateGoalProgress();
        this.updateReports();
        this.updateProgressRings();
        this.updateBadges(); // Changed from this.updateAchievements() to this.updateBadges()
        this.updatePersonalBests();
        this.renderHeatmap();
        this.generateWeeklyInsights();

        // Add success feedback
        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<span class="save-icon">✅</span> Saved!';
            saveBtn.style.background = 'linear-gradient(45deg, #48bb78, #38a169)';
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.style.background = '';
            }, 2000);
        }
    }

    resetField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = 0;
            field.focus();
            
            // Add visual feedback for reset
            field.style.transform = 'scale(1.1)';
            field.style.borderColor = '#ff6b6b';
            field.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.5)';
            
            setTimeout(() => {
                if (field) {
                    field.style.transform = '';
                    field.style.borderColor = '';
                    field.style.boxShadow = '';
                }
            }, 300);
        }
    }

    showCelebration(title, message) {
        const celebrationMessage = document.getElementById('celebrationMessage');
        const modal = document.getElementById('celebrationModal');
        
        if (celebrationMessage) celebrationMessage.textContent = message;
        if (modal) {
            const modalH2 = modal.querySelector('h2');
            if (modalH2) modalH2.textContent = title;
            modal.style.display = 'block';
        }
    }

    closeCelebration() {
        const modal = document.getElementById('celebrationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Helper method to convert chart index to date
    getDateFromChartIndex(index) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index)); // 6-index because chart shows last 7 days
        return date.toISOString().split('T')[0];
    }

    // Method to open edit modal for a specific date
    openEditModal(dateKey) {
        const dayData = this.data[dateKey] || { life: 0, business: 0 };
        const date = new Date(dateKey);
        
        // Populate modal with existing data
        document.getElementById('editLifeActions').value = dayData.life;
        document.getElementById('editBusinessActions').value = dayData.business;
        document.getElementById('editDateDisplay').textContent =
            date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        
        // Store current editing date
        this.currentEditDate = dateKey;
        
        // Show modal
        document.getElementById('editDayModal').style.display = 'block';
    }

    // Method to save edited day data
    saveEditedDay() {
        const lifeActions = parseInt(document.getElementById('editLifeActions').value) || 0;
        const businessActions = parseInt(document.getElementById('editBusinessActions').value) || 0;
        
        // Validation (same as current day)
        if (lifeActions < 0 || lifeActions > 400 || businessActions < 0 || businessActions > 400) {
            this.showCelebration("Invalid Input ❌", "Please enter values between 0 and 400");
            return;
        }
        
        // Update data
        this.data[this.currentEditDate] = {
            life: lifeActions,
            business: businessActions,
            timestamp: this.data[this.currentEditDate]?.timestamp || new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // Save and update all metrics
        this.saveData();
        this.updateAllMetrics();
        this.closeEditModal();
        
        // Show success feedback
        this.showCelebration("✅ Day Updated!", "Your changes have been saved successfully.");
    }

    // Method to delete a day's entry
    deleteDay() {
        if (confirm('Are you sure you want to delete this day\'s entry? This action cannot be undone.')) {
            delete this.data[this.currentEditDate];
            this.saveData();
            this.updateAllMetrics();
            this.closeEditModal();
            this.showCelebration("🗑️ Entry Deleted", "The day's entry has been removed.");
        }
    }

    // Comprehensive metrics update method
    updateAllMetrics() {
        this.updateStreakCounter();
        this.updateStats();
        this.updateCharts();
        this.updateGoalProgress();
        this.updateReports();
        this.updateProgressRings();
        this.updateBadges();
        this.updatePersonalBests();
        this.renderHeatmap();
        this.generateWeeklyInsights();
    }

    // Close edit modal
    closeEditModal() {
        document.getElementById('editDayModal').style.display = 'none';
        this.currentEditDate = null;
    }

    // Reset field in edit modal
    resetEditField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = 0;
            field.focus();
            
            // Add visual feedback for reset
            field.style.transform = 'scale(1.1)';
            field.style.borderColor = '#ff6b6b';
            field.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.5)';
            
            setTimeout(() => {
                if (field) {
                    field.style.transform = '';
                    field.style.borderColor = '';
                    field.style.boxShadow = '';
                }
            }, 300);
        }
    }
}

// Global functions for HTML onclick events
function setQuickValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        const currentValue = parseInt(field.value) || 0;
        const newValue = currentValue + value;
        field.value = newValue;
        field.focus();
        
        // Add visual feedback
        field.style.transform = 'scale(1.1)';
        field.style.borderColor = '#48bb78';
        field.style.boxShadow = '0 0 15px rgba(72, 187, 120, 0.5)';
        
        setTimeout(() => {
            field.style.transform = 'scale(1)';
            field.style.borderColor = '#e2e8f0';
            field.style.boxShadow = 'none';
        }, 300);
    }
}

function saveEntry() {
    if (window.tracker) {
        tracker.saveEntry();
    }
}

function closeCelebration() {
    if (window.tracker) {
        tracker.closeCelebration();
    }
}

function resetField(fieldId) {
    if (window.tracker) {
        tracker.resetField(fieldId);
    }
}

function updateGoals() {
    if (window.tracker) {
        tracker.updateGoals();
    }
}

// Global functions for edit modal interactions
function setEditQuickValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        const currentValue = parseInt(field.value) || 0;
        const newValue = currentValue + value;
        field.value = newValue;
        field.focus();
        
        // Add visual feedback
        field.style.transform = 'scale(1.1)';
        field.style.borderColor = '#48bb78';
        field.style.boxShadow = '0 0 15px rgba(72, 187, 120, 0.5)';
        
        setTimeout(() => {
            field.style.transform = 'scale(1)';
            field.style.borderColor = '#e2e8f0';
            field.style.boxShadow = 'none';
        }, 300);
    }
}

function saveEditedDay() {
    if (window.tracker) {
        tracker.saveEditedDay();
    }
}

function closeEditModal() {
    if (window.tracker) {
        tracker.closeEditModal();
    }
}

function deleteDay() {
    if (window.tracker) {
        tracker.deleteDay();
    }
}

function resetEditField(fieldId) {
    if (window.tracker) {
        tracker.resetEditField(fieldId);
    }
}

// Initialize the app when the page loads
let tracker;
document.addEventListener('DOMContentLoaded', function() {
    tracker = new ActionTracker();
    window.tracker = tracker; // Make it globally accessible
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            tracker.saveEntry();
        }
        
        // Escape to close modal
        if (e.key === 'Escape') {
            const editModal = document.getElementById('editDayModal');
            if (editModal && editModal.style.display === 'block') {
                tracker.closeEditModal();
            } else {
                tracker.closeCelebration();
            }
        }
    });
    
    // Auto-save when inputs change (for ADHD-friendly experience)
    let autoSaveTimeout;
    const inputs = document.querySelectorAll('#lifeActions, #businessActions');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                if (input.value && input.value !== '0') {
                    // Visual hint that data will be saved
                    input.style.borderColor = '#48bb78';
                    setTimeout(() => {
                        input.style.borderColor = '#e2e8f0';
                    }, 1000);
                }
            }, 2000);
        });
    });
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // You can add a service worker later for offline functionality
    });
}