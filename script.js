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
        
        // Format the week period with specific dates and month names
        const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
        const startDay = weekStart.getDate();
        const endMonth = today.toLocaleDateString('en-US', { month: 'short' });
        const endDay = today.getDate();
        const year = today.getFullYear();
        
        let periodText;
        if (startMonth === endMonth) {
            periodText = `${startMonth} ${startDay}-${endDay}, ${year}`;
        } else {
            periodText = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
        }
        
        return {
            period: periodText,
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
        
        // Format the month period with specific month name and year
        const monthName = today.toLocaleDateString('en-US', { month: 'long' });
        const year = today.getFullYear();
        
        return {
            period: `${monthName} ${year}`,
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
        let updated = false;
        
        // Get all dates and sort them
        const allDates = Object.keys(this.data).sort();
        if (allDates.length === 0) {
            // No data yet, reset to defaults
            this.safeUpdateElement('bestStreak', 0);
            this.safeUpdateElement('bestStreakDate', '-');
            this.safeUpdateElement('bestSingleDay', 0);
            this.safeUpdateElement('bestSingleDayDate', '-');
            this.safeUpdateElement('bestWeek', 0);
            this.safeUpdateElement('bestWeekDate', '-');
            this.safeUpdateElement('bestMonth', 0);
            this.safeUpdateElement('bestMonthDate', '-');
            this.safeUpdateElement('bestLifeDay', 0);
            this.safeUpdateElement('bestLifeDayDate', '-');
            this.safeUpdateElement('bestBusinessDay', 0);
            this.safeUpdateElement('bestBusinessDayDate', '-');
            return;
        }
        
        // Find longest streak using a more reliable method
        let longestStreak = 0;
        let longestStreakDate = null;
        let currentStreak = 0;
        let currentStreakStartDate = null;
        
        // Check current active streak first
        const currentActiveStreak = this.getCurrentStreak();
        if (currentActiveStreak > 0) {
            longestStreak = currentActiveStreak;
            const today = new Date();
            today.setDate(today.getDate() - (currentActiveStreak - 1));
            longestStreakDate = today.toISOString().split('T')[0];
        }
        
        // Now check historical streaks
        for (let i = 0; i < allDates.length; i++) {
            const dateKey = allDates[i];
            const dayData = this.data[dateKey];
            
            if (dayData && (dayData.life > 0 || dayData.business > 0)) {
                if (currentStreak === 0) {
                    currentStreakStartDate = dateKey;
                }
                currentStreak++;
                
                // Check if this is longer than our record
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    longestStreakDate = currentStreakStartDate;
                }
            } else {
                currentStreak = 0;
                currentStreakStartDate = null;
            }
        }
        
        // Find single day records
        let mostProductiveDay = 0;
        let mostProductiveDayDate = null;
        let mostLifeActions = 0;
        let mostLifeActionsDate = null;
        let mostBusinessActions = 0;
        let mostBusinessActionsDate = null;
        
        Object.entries(this.data).forEach(([dateKey, dayData]) => {
            const dayTotal = (dayData.life || 0) + (dayData.business || 0);
            
            if (dayTotal > mostProductiveDay) {
                mostProductiveDay = dayTotal;
                mostProductiveDayDate = dateKey;
            }
            
            if ((dayData.life || 0) > mostLifeActions) {
                mostLifeActions = dayData.life || 0;
                mostLifeActionsDate = dateKey;
            }
            
            if ((dayData.business || 0) > mostBusinessActions) {
                mostBusinessActions = dayData.business || 0;
                mostBusinessActionsDate = dateKey;
            }
        });
        
        // Find best week using calendar weeks
        let bestWeek = this.getWeekTotal(); // Current week
        let bestWeekDate = this.getWeekStartDate(new Date()); // Start of current week
        
        // Check last 8 weeks for comparison
        for (let weekOffset = 1; weekOffset <= 8; weekOffset++) {
            const weekStartDate = new Date();
            weekStartDate.setDate(weekStartDate.getDate() - (weekOffset * 7));
            const weekStart = this.getWeekStartDate(weekStartDate);
            
            let weekTotal = 0;
            for (let day = 0; day < 7; day++) {
                const checkDate = new Date(weekStart);
                checkDate.setDate(weekStart.getDate() + day);
                const dateKey = checkDate.toISOString().split('T')[0];
                const dayData = this.data[dateKey];
                
                if (dayData) {
                    weekTotal += (dayData.life || 0) + (dayData.business || 0);
                }
            }
            
            if (weekTotal > bestWeek) {
                bestWeek = weekTotal;
                bestWeekDate = weekStart.toISOString().split('T')[0];
            }
        }
        
        // Find best month using calendar months
        let bestMonth = this.getCurrentMonthTotal(); // Current calendar month
        let bestMonthDate = this.getMonthStartDate(new Date()); // Start of current month
        
        // Check last 6 months for comparison
        for (let monthOffset = 1; monthOffset <= 6; monthOffset++) {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() - monthOffset);
            const monthStart = this.getMonthStartDate(monthDate);
            const monthTotal = this.getCalendarMonthTotal(monthDate);
            
            if (monthTotal > bestMonth) {
                bestMonth = monthTotal;
                bestMonthDate = monthStart.toISOString().split('T')[0];
            }
        }
        
        // Update personal bests if new records found
        if (longestStreak > (this.personalBests.longestStreak || 0)) {
            this.personalBests.longestStreak = longestStreak;
            this.personalBests.longestStreakDate = longestStreakDate;
            updated = true;
        }
        
        if (mostProductiveDay > (this.personalBests.mostProductiveDay || 0)) {
            this.personalBests.mostProductiveDay = mostProductiveDay;
            this.personalBests.mostProductiveDayDate = mostProductiveDayDate;
            updated = true;
        }
        
        if (bestWeek > (this.personalBests.bestWeek || 0)) {
            this.personalBests.bestWeek = bestWeek;
            this.personalBests.bestWeekDate = bestWeekDate;
            updated = true;
        }
        
        if (bestMonth > (this.personalBests.bestMonth || 0)) {
            this.personalBests.bestMonth = bestMonth;
            this.personalBests.bestMonthDate = bestMonthDate;
            updated = true;
        }
        
        if (mostLifeActions > (this.personalBests.mostLifeActions || 0)) {
            this.personalBests.mostLifeActions = mostLifeActions;
            this.personalBests.mostLifeActionsDate = mostLifeActionsDate;
            updated = true;
        }
        
        if (mostBusinessActions > (this.personalBests.mostBusinessActions || 0)) {
            this.personalBests.mostBusinessActions = mostBusinessActions;
            this.personalBests.mostBusinessActionsDate = mostBusinessActionsDate;
            updated = true;
        }
        
        // Always update UI with current best values
        this.safeUpdateElement('bestStreak', this.personalBests.longestStreak || longestStreak || 0);
        this.safeUpdateElement('bestStreakDate', this.formatDate(this.personalBests.longestStreakDate || longestStreakDate));
        this.safeUpdateElement('bestSingleDay', this.personalBests.mostProductiveDay || mostProductiveDay || 0);
        this.safeUpdateElement('bestSingleDayDate', this.formatDate(this.personalBests.mostProductiveDayDate || mostProductiveDayDate));
        this.safeUpdateElement('bestWeek', this.personalBests.bestWeek || bestWeek || 0);
        this.safeUpdateElement('bestWeekDate', this.formatDate(this.personalBests.bestWeekDate || bestWeekDate));
        this.safeUpdateElement('bestMonth', this.personalBests.bestMonth || bestMonth || 0);
        this.safeUpdateElement('bestMonthDate', this.formatDate(this.personalBests.bestMonthDate || bestMonthDate));
        this.safeUpdateElement('bestLifeDay', this.personalBests.mostLifeActions || mostLifeActions || 0);
        this.safeUpdateElement('bestLifeDayDate', this.formatDate(this.personalBests.mostLifeActionsDate || mostLifeActionsDate));
        this.safeUpdateElement('bestBusinessDay', this.personalBests.mostBusinessActions || mostBusinessActions || 0);
        this.safeUpdateElement('bestBusinessDayDate', this.formatDate(this.personalBests.mostBusinessActionsDate || mostBusinessActionsDate));
        
        // Save if updated
        if (updated) {
            this.savePersonalBests();
        }
    }

    // Helper methods for proper calendar period calculations
    getWeekStartDate(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; // Sunday = 0
        return new Date(d.setDate(diff));
    }

    getMonthStartDate(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    getCurrentMonthTotal() {
        const today = new Date();
        return this.getCalendarMonthTotal(today);
    }

    getCalendarMonthTotal(date) {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        let total = 0;
        for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            const dayData = this.data[dateKey];
            
            if (dayData) {
                total += (dayData.life || 0) + (dayData.business || 0);
            }
        }
        
        return total;
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