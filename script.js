// Relational Integration Trainer
// Based on Chuderski (2013) research

class RelationalIntegrationTask {
    constructor() {
        this.config = {
            taskType: 'letter',
            condition: 'three-same',
            numTrials: 40,
            trainingTrials: 5,
            trialDuration: 5500, // 5.5 seconds
            blinkDuration: 100 // 0.1 seconds between trials
        };

        this.consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
        this.digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        this.currentTrial = 0;
        this.isTraining = true;
        this.trials = [];
        this.results = {
            hits: 0,
            misses: 0,
            falseAlarms: 0,
            correctRejections: 0,
            reactionTimes: [],
            trialData: []
        };

        this.trialStartTime = 0;
        this.responded = false;
        this.timerInterval = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Welcome screen
        document.getElementById('start-btn').addEventListener('click', () => this.showInstructions());

        // Instructions screen
        document.getElementById('back-to-config-btn').addEventListener('click', () => this.showWelcome());
        document.getElementById('begin-task-btn').addEventListener('click', () => this.startTask());

        // Results screen
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('download-results-btn').addEventListener('click', () => this.downloadResults());

        // Keyboard input for task
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    showWelcome() {
        this.hideAllScreens();
        document.getElementById('welcome-screen').classList.add('active');
    }

    showInstructions() {
        // Get configuration
        this.config.taskType = document.getElementById('task-type').value;
        this.config.condition = document.getElementById('condition').value;
        this.config.numTrials = parseInt(document.getElementById('num-trials').value);
        this.config.trainingTrials = parseInt(document.getElementById('training-trials').value);

        // Generate instruction content
        const instructionContent = this.getInstructions();
        document.getElementById('instruction-content').innerHTML = instructionContent;

        this.hideAllScreens();
        document.getElementById('instructions-screen').classList.add('active');
    }

    getInstructions() {
        const typeText = this.config.taskType === 'letter' ? 'letters' : 'numbers';
        let ruleText = '';

        switch (this.config.condition) {
            case 'three-same':
                ruleText = `<p><strong>Rule:</strong> Respond (press SPACE) if you find <strong>three strings ending with the SAME ${typeText}</strong> in one <strong>row or column</strong>.</p>`;
                ruleText += `<p class="example">Example: If you see "XYZ ABC XYZ" in a row and all three end with "Z", press SPACE.</p>`;
                break;
            case 'five-same':
                ruleText = `<p><strong>Rule:</strong> Respond (press SPACE) if you find <strong>five strings ending with the SAME ${typeText}</strong> forming a <strong>cross or T pattern</strong>.</p>`;
                ruleText += `<p class="example">Cross: center + all four adjacent cells. T-pattern: any rotation of a T shape.</p>`;
                break;
            case 'three-different':
                ruleText = `<p><strong>Rule:</strong> Respond (press SPACE) if you find <strong>three strings ending with three DIFFERENT ${typeText}</strong> in one <strong>row or column</strong>.</p>`;
                ruleText += `<p class="example">Example: If you see "XYA ABC XYZ" in a row with endings "A", "C", and "Z" (all different), press SPACE.</p>`;
                break;
            case 'five-different':
                ruleText = `<p><strong>Rule:</strong> Respond (press SPACE) if you find <strong>five strings ending with five DIFFERENT ${typeText}</strong> forming a <strong>cross or T pattern</strong>.</p>`;
                ruleText += `<p class="example">All five endings in the pattern must be different from each other.</p>`;
                break;
        }

        return `
            ${ruleText}
            <h3>Important Points:</h3>
            <ul>
                <li>Each trial will display for <strong>5.5 seconds</strong></li>
                <li>You will start with <strong>${this.config.trainingTrials} training trials</strong> for practice</li>
                <li>Then you will complete <strong>${this.config.numTrials} test trials</strong></li>
                <li>Only press SPACE when you detect the target pattern</li>
                <li>Do NOT respond if the pattern is not present</li>
                <li>Focus on the <strong>last character</strong> of each three-character string</li>
                <li>About half of the trials will contain the target pattern</li>
            </ul>
            <p style="margin-top: 15px; font-weight: 600; color: #667eea;">Take your time to understand the rule. Click "Begin Task" when you're ready.</p>
        `;
    }

    startTask() {
        this.resetResults();
        this.generateTrials();
        this.currentTrial = 0;
        this.isTraining = true;

        this.hideAllScreens();
        document.getElementById('task-screen').classList.add('active');

        this.showNextTrial();
    }

    resetResults() {
        this.results = {
            hits: 0,
            misses: 0,
            falseAlarms: 0,
            correctRejections: 0,
            reactionTimes: [],
            trialData: []
        };
    }

    generateTrials() {
        const symbols = this.config.taskType === 'letter' ? this.consonants : this.digits;

        // Training trials
        const trainingTrials = [];
        for (let i = 0; i < this.config.trainingTrials; i++) {
            const hasRelation = i % 2 === 0; // Alternate between relation and no-relation
            trainingTrials.push(this.generateTrial(symbols, hasRelation));
        }

        // Test trials - half with relation, half without
        const testTrials = [];
        const numRelationTrials = Math.floor(this.config.numTrials / 2);
        const numNoRelationTrials = this.config.numTrials - numRelationTrials;

        for (let i = 0; i < numRelationTrials; i++) {
            testTrials.push(this.generateTrial(symbols, true));
        }
        for (let i = 0; i < numNoRelationTrials; i++) {
            testTrials.push(this.generateTrial(symbols, false));
        }

        // Shuffle test trials
        this.shuffleArray(testTrials);

        this.trials = [...trainingTrials, ...testTrials];
    }

    generateTrial(symbols, hasRelation) {
        const grid = Array(9).fill(null).map(() => this.generateRandomString(symbols));

        if (hasRelation) {
            this.insertRelation(grid, symbols);
        }

        return {
            grid: grid,
            hasRelation: hasRelation,
            condition: this.config.condition
        };
    }

    generateRandomString(symbols) {
        let str = '';
        for (let i = 0; i < 3; i++) {
            str += symbols[Math.floor(Math.random() * symbols.length)];
        }
        return str;
    }

    insertRelation(grid, symbols) {
        switch (this.config.condition) {
            case 'three-same':
                this.insertThreeSame(grid, symbols);
                break;
            case 'five-same':
                this.insertFiveSame(grid, symbols);
                break;
            case 'three-different':
                this.insertThreeDifferent(grid, symbols);
                break;
            case 'five-different':
                this.insertFiveDifferent(grid, symbols);
                break;
        }
    }

    insertThreeSame(grid, symbols) {
        const patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8]  // columns
        ];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        pattern.forEach(idx => {
            const prefix = grid[idx].substring(0, 2);
            grid[idx] = prefix + symbol;
        });
    }

    insertFiveSame(grid, symbols) {
        const patterns = [
            [1, 3, 4, 5, 7],  // cross
            [0, 1, 2, 4, 7],  // T up
            [1, 3, 4, 5, 6],  // T down
            [0, 3, 4, 6, 7],  // T left
            [1, 2, 4, 5, 8]   // T right
        ];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        pattern.forEach(idx => {
            const prefix = grid[idx].substring(0, 2);
            grid[idx] = prefix + symbol;
        });
    }

    insertThreeDifferent(grid, symbols) {
        const patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8]  // columns
        ];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const selectedSymbols = this.selectNDifferent(symbols, 3);

        pattern.forEach((idx, i) => {
            const prefix = grid[idx].substring(0, 2);
            grid[idx] = prefix + selectedSymbols[i];
        });
    }

    insertFiveDifferent(grid, symbols) {
        const patterns = [
            [1, 3, 4, 5, 7],  // cross
            [0, 1, 2, 4, 7],  // T up
            [1, 3, 4, 5, 6],  // T down
            [0, 3, 4, 6, 7],  // T left
            [1, 2, 4, 5, 8]   // T right
        ];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const selectedSymbols = this.selectNDifferent(symbols, 5);

        pattern.forEach((idx, i) => {
            const prefix = grid[idx].substring(0, 2);
            grid[idx] = prefix + selectedSymbols[i];
        });
    }

    selectNDifferent(symbols, n) {
        const shuffled = [...symbols].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    showNextTrial() {
        if (this.currentTrial >= this.trials.length) {
            this.showResults();
            return;
        }

        // Check if transitioning from training to test
        if (this.isTraining && this.currentTrial >= this.config.trainingTrials) {
            this.isTraining = false;
        }

        const trial = this.trials[this.currentTrial];
        this.displayTrial(trial);
        this.startTrialTimer();
    }

    displayTrial(trial) {
        // Update trial counter
        const trialNum = this.isTraining ?
            this.currentTrial + 1 :
            this.currentTrial - this.config.trainingTrials + 1;
        const totalTrials = this.isTraining ?
            this.config.trainingTrials :
            this.config.numTrials;

        document.getElementById('trial-type').textContent = this.isTraining ? 'Training' : 'Test';
        document.getElementById('current-trial').textContent = trialNum;
        document.getElementById('total-trials').textContent = totalTrials;

        // Clear grid
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';

        // Create grid cells
        trial.grid.forEach((str, idx) => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = str;
            gridContainer.appendChild(cell);
        });

        // Clear response indicator
        document.getElementById('response-indicator').textContent = '';
        document.getElementById('response-indicator').className = 'response-indicator';

        this.responded = false;
        this.trialStartTime = Date.now();
    }

    startTrialTimer() {
        const timerBar = document.getElementById('timer-bar');
        timerBar.style.width = '100%';

        const startTime = Date.now();
        const duration = this.config.trialDuration;

        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, duration - elapsed);
            const percentage = (remaining / duration) * 100;

            timerBar.style.width = percentage + '%';

            if (remaining === 0) {
                clearInterval(this.timerInterval);
                this.endTrial();
            }
        }, 50);
    }

    handleKeyPress(e) {
        // Only respond to space bar during active trial
        if (e.code !== 'Space' || this.responded) return;
        if (!document.getElementById('task-screen').classList.contains('active')) return;

        e.preventDefault();
        this.recordResponse();
    }

    recordResponse() {
        if (this.responded) return;

        this.responded = true;
        const reactionTime = Date.now() - this.trialStartTime;
        const trial = this.trials[this.currentTrial];

        // Record the response
        if (trial.hasRelation) {
            this.results.hits++;
            this.results.reactionTimes.push(reactionTime);
            this.showFeedback('Correct! (Hit)', 'correct');
        } else {
            this.results.falseAlarms++;
            this.showFeedback('Incorrect (False Alarm)', 'incorrect');
        }

        this.results.trialData.push({
            trialNumber: this.currentTrial + 1,
            isTraining: this.isTraining,
            hasRelation: trial.hasRelation,
            responded: true,
            correct: trial.hasRelation,
            reactionTime: reactionTime
        });
    }

    endTrial() {
        clearInterval(this.timerInterval);

        const trial = this.trials[this.currentTrial];

        if (!this.responded) {
            // No response given
            if (trial.hasRelation) {
                this.results.misses++;
                this.showFeedback('Miss (No Response)', 'incorrect');
            } else {
                this.results.correctRejections++;
                this.showFeedback('Correct (Rejection)', 'correct');
            }

            this.results.trialData.push({
                trialNumber: this.currentTrial + 1,
                isTraining: this.isTraining,
                hasRelation: trial.hasRelation,
                responded: false,
                correct: !trial.hasRelation,
                reactionTime: null
            });
        }

        // Move to next trial after brief delay
        setTimeout(() => {
            this.currentTrial++;
            // Brief blink between trials
            document.getElementById('grid-container').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('grid-container').style.opacity = '1';
                this.showNextTrial();
            }, this.config.blinkDuration);
        }, 500);
    }

    showFeedback(message, type) {
        const indicator = document.getElementById('response-indicator');
        indicator.textContent = message;
        indicator.className = 'response-indicator ' + type;
    }

    showResults() {
        this.hideAllScreens();
        document.getElementById('results-screen').classList.add('active');

        // Calculate statistics
        const totalRelationTrials = this.results.hits + this.results.misses;
        const totalNoRelationTrials = this.results.falseAlarms + this.results.correctRejections;

        const hitRate = totalRelationTrials > 0 ?
            (this.results.hits / totalRelationTrials) : 0;
        const falseAlarmRate = totalNoRelationTrials > 0 ?
            (this.results.falseAlarms / totalNoRelationTrials) : 0;

        // Accuracy score as per Chuderski (2013): Hit Rate - False Alarm Rate
        const accuracy = hitRate - falseAlarmRate;

        const meanRT = this.results.reactionTimes.length > 0 ?
            this.results.reactionTimes.reduce((a, b) => a + b, 0) / this.results.reactionTimes.length : 0;

        // Display results
        document.getElementById('result-condition').textContent = this.formatCondition(this.config.condition);
        document.getElementById('result-type').textContent = this.config.taskType === 'letter' ? 'Letters' : 'Numbers';
        document.getElementById('result-accuracy').textContent = accuracy.toFixed(3);
        document.getElementById('result-hits').textContent = `${(hitRate * 100).toFixed(1)}% (${this.results.hits}/${totalRelationTrials})`;
        document.getElementById('result-fa').textContent = `${(falseAlarmRate * 100).toFixed(1)}% (${this.results.falseAlarms}/${totalNoRelationTrials})`;
        document.getElementById('result-cr').textContent = this.results.correctRejections;
        document.getElementById('result-misses').textContent = this.results.misses;
        document.getElementById('result-rt').textContent = `${meanRT.toFixed(0)} ms`;

        // Interpretation
        const interpretation = this.getInterpretation(accuracy, this.config.condition);
        document.getElementById('interpretation-text').innerHTML = interpretation;
    }

    formatCondition(condition) {
        const map = {
            'three-same': 'Three Same (2 bindings)',
            'five-same': 'Five Same (2 bindings)',
            'three-different': 'Three Different (3 bindings)',
            'five-different': 'Five Different (5-10 bindings)'
        };
        return map[condition] || condition;
    }

    getInterpretation(accuracy, condition) {
        let interpretation = '<p>';

        // Accuracy interpretation
        if (accuracy >= 0.70) {
            interpretation += '<strong>Excellent performance!</strong> Your accuracy is very high for this task. ';
        } else if (accuracy >= 0.50) {
            interpretation += '<strong>Good performance.</strong> Your accuracy is above average for this condition. ';
        } else if (accuracy >= 0.30) {
            interpretation += '<strong>Moderate performance.</strong> This is typical for this task condition. ';
        } else {
            interpretation += '<strong>This condition is quite challenging.</strong> ';
        }

        // Condition-specific interpretation
        switch (condition) {
            case 'three-same':
                interpretation += 'The three-same condition requires maintaining only 2 bindings, making it relatively easier. Average accuracy is typically around 0.73.';
                break;
            case 'five-same':
                interpretation += 'The five-same condition also requires only 2 bindings despite more objects. Average accuracy is around 0.73, similar to three-same.';
                break;
            case 'three-different':
                interpretation += 'The three-different condition requires 3 bindings, making it moderately difficult. Average accuracy is around 0.38.';
                break;
            case 'five-different':
                interpretation += 'The five-different condition requires 5-10 bindings, making it the most challenging. Average accuracy is around 0.18.';
                break;
        }

        interpretation += '</p><p style="margin-top: 10px;"><strong>What does this measure?</strong> This task assesses your relational integration capacity - the ability to bind and integrate multiple pieces of information into complex relational structures. Research shows this ability is one of the strongest predictors of fluid reasoning and general intelligence.</p>';

        return interpretation;
    }

    downloadResults() {
        const data = {
            config: this.config,
            summary: {
                accuracy: (this.results.hits / (this.results.hits + this.results.misses)) -
                         (this.results.falseAlarms / (this.results.falseAlarms + this.results.correctRejections)),
                hits: this.results.hits,
                misses: this.results.misses,
                falseAlarms: this.results.falseAlarms,
                correctRejections: this.results.correctRejections,
                meanRT: this.results.reactionTimes.reduce((a, b) => a + b, 0) / this.results.reactionTimes.length
            },
            trialData: this.results.trialData,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relational-integration-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    restart() {
        this.showWelcome();
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }
}

// Initialize the task when the page loads
let task;
window.addEventListener('DOMContentLoaded', () => {
    task = new RelationalIntegrationTask();
});
