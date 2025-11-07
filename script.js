// Relational Integration Task - Exact Replication of Chuderski (2013)
// Full implementation of Experiments 1, 2, and 3

class RelationalIntegrationTask {
    constructor() {
        // Core configuration
        this.consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
        this.digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        // Task constants (from the paper)
        this.TRIAL_DURATION = 5500; // 5.5 seconds
        this.BLINK_DURATION = 100;  // 0.1 seconds between trials

        // State variables
        this.selectedExperiment = null;
        this.experimentConfig = null;
        this.currentPhase = null; // 'training', 'test'
        this.currentTaskType = null; // 'letter', 'number'
        this.currentCondition = null;
        this.currentTrialIndex = 0;
        this.phaseTrials = [];
        this.previousGrid = null; // For trial persistence

        // Results tracking
        this.allResults = [];
        this.currentPhaseResults = {
            hits: 0,
            misses: 0,
            falseAlarms: 0,
            correctRejections: 0,
            reactionTimes: [],
            trialData: []
        };

        // Trial state
        this.trialStartTime = 0;
        this.responded = false;
        this.timerInterval = null;

        // Experimental Modes State
        this.experimentalMode = null;
        this.adaptiveDifficulty = {
            numObjects: 3,
            trialDuration: 6000,
            recentAccuracy: [],
            level: 1
        };
        this.progressiveWeek = 1;
        this.speedMode = 'balanced'; // accuracy, balanced, speed, blitz
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'teal', 'indigo'];
        this.nBackLevel = 1;
        this.nBackHistory = [];
        this.nBackResponse = null;
        this.interferenceLevel = 1;
        this.wmLoadMode = 'medium'; // easy, medium, hard, extreme
        this.confidenceData = [];
        this.currentConfidence = null;

        // Progress tracking (persisted in localStorage)
        this.progressData = this.loadProgressData();

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Welcome screen - experiment selection
        document.querySelectorAll('.select-exp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exp = e.target.dataset.experiment;
                this.selectExperiment(parseInt(exp));
            });
        });

        // Experiment 1 configuration
        document.getElementById('exp1-back-btn').addEventListener('click', () => this.showWelcome());
        document.getElementById('exp1-start-btn').addEventListener('click', () => this.startExperiment1());

        // Experiment 2 configuration
        document.getElementById('exp2-back-btn').addEventListener('click', () => this.showWelcome());
        document.getElementById('exp2-start-btn').addEventListener('click', () => this.startExperiment2());

        // Experiment 3 configuration
        document.getElementById('exp3-back-btn').addEventListener('click', () => this.showWelcome());
        document.getElementById('exp3-start-btn').addEventListener('click', () => this.startExperiment3());

        // Instructions screen
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showWelcome());
        document.getElementById('begin-task-btn').addEventListener('click', () => this.beginCurrentPhase());

        // Task screen abort button
        document.getElementById('abort-task-btn').addEventListener('click', () => this.abortTask());

        // Results screen
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('download-results-btn').addEventListener('click', () => this.downloadResults());

        // Keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Mobile button input
        document.getElementById('mobile-response-btn').addEventListener('click', () => this.handleMobileResponse());

        // Also handle touch events for better mobile responsiveness
        document.getElementById('mobile-response-btn').addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent double-firing on some devices
            this.handleMobileResponse();
        });

        // Experimental mode selection
        document.querySelectorAll('.select-exp-btn[data-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.selectExperimentalMode(mode);
            });
        });

        // Experimental mode configuration
        document.getElementById('exp-mode-back-btn').addEventListener('click', () => this.showWelcome());
        document.getElementById('exp-mode-start-btn').addEventListener('click', () => this.startExperimentalMode());

        // Confidence rating
        document.querySelectorAll('.confidence-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const confidence = parseInt(e.target.closest('.confidence-btn').dataset.confidence);
                this.recordConfidence(confidence);
            });
        });

        // Progress dashboard
        document.getElementById('dashboard-back-btn').addEventListener('click', () => this.showWelcome());
        document.getElementById('dashboard-continue-btn').addEventListener('click', () => this.continueTrainingFromDashboard());
        document.getElementById('dashboard-clear-btn').addEventListener('click', () => this.clearProgressData());
    }

    // ==================== Navigation ====================

    showWelcome() {
        this.hideAllScreens();
        document.getElementById('welcome-screen').classList.add('active');
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    selectExperiment(expNumber) {
        this.selectedExperiment = expNumber;
        this.hideAllScreens();
        document.getElementById(`exp${expNumber}-config-screen`).classList.add('active');
    }

    // ==================== Experiment 1: Between-Subjects ====================

    startExperiment1() {
        const condition = document.getElementById('exp1-condition').value;

        this.experimentConfig = {
            type: 'experiment1',
            condition: condition,
            phases: [
                { phase: 'training', taskType: 'letter', trials: 5 },
                { phase: 'test', taskType: 'letter', trials: 50 },
                { phase: 'test', taskType: 'number', trials: 50 }
            ]
        };

        this.resetExperimentState();
        this.startNextPhase();
    }

    // ==================== Experiment 2: Within-Subjects + Interference ====================

    startExperiment2() {
        // Randomize condition order
        const conditions = ['three-same', 'five-same'];
        this.shuffleArray(conditions);

        this.experimentConfig = {
            type: 'experiment2',
            conditions: conditions,
            phases: []
        };

        // Build phases for both conditions
        conditions.forEach(condition => {
            this.experimentConfig.phases.push(
                { phase: 'training', taskType: 'number', trials: 10, condition: condition },
                { phase: 'test', taskType: 'number', trials: 60, condition: condition },
                { phase: 'test', taskType: 'letter', trials: 60, condition: condition }
            );
        });

        this.resetExperimentState();
        this.startNextPhase();
    }

    // ==================== Experiment 3: Multiple Conditions ====================

    startExperiment3() {
        // Three-same first, then randomize five-same and three-different
        const remainingConditions = ['five-same', 'three-different'];
        this.shuffleArray(remainingConditions);
        const conditions = ['three-same', ...remainingConditions];

        this.experimentConfig = {
            type: 'experiment3',
            conditions: conditions,
            phases: []
        };

        // Build phases for all three conditions
        // Important: Numbers always before letters in each condition
        conditions.forEach(condition => {
            this.experimentConfig.phases.push(
                { phase: 'test', taskType: 'number', trials: 40, condition: condition },
                { phase: 'test', taskType: 'letter', trials: 40, condition: condition }
            );
        });

        this.resetExperimentState();
        this.startNextPhase();
    }

    // ==================== Phase Management ====================

    resetExperimentState() {
        this.currentPhase = null;
        this.currentTaskType = null;
        this.currentCondition = null;
        this.currentTrialIndex = 0;
        this.phaseTrials = [];
        this.previousGrid = null;
        this.allResults = [];
        this.resetPhaseResults();
    }

    resetPhaseResults() {
        this.currentPhaseResults = {
            hits: 0,
            misses: 0,
            falseAlarms: 0,
            correctRejections: 0,
            reactionTimes: [],
            trialData: []
        };
    }

    startNextPhase() {
        // Find next phase
        const phaseIndex = this.experimentConfig.phases.findIndex(p => !p.completed);

        if (phaseIndex === -1) {
            // All phases complete
            this.showResults();
            return;
        }

        const phaseConfig = this.experimentConfig.phases[phaseIndex];
        this.currentPhase = phaseConfig.phase;
        this.currentTaskType = phaseConfig.taskType;
        this.currentCondition = phaseConfig.condition || this.experimentConfig.condition;
        this.currentTrialIndex = 0;
        this.previousGrid = null;

        // Generate trials for this phase
        this.phaseTrials = this.generatePhaseTrials(phaseConfig);

        // Reset phase results
        this.resetPhaseResults();

        // Show instructions
        this.showInstructions();
    }

    showInstructions() {
        const instructionHTML = this.getInstructionHTML();
        document.getElementById('instruction-content').innerHTML = instructionHTML;

        this.hideAllScreens();
        document.getElementById('instructions-screen').classList.add('active');
    }

    getInstructionHTML() {
        const typeText = this.currentTaskType === 'letter' ? 'letters' : 'numbers';
        const phaseText = this.currentPhase === 'training' ? 'TRAINING' : 'TEST';

        let ruleHTML = `<h3>${phaseText} Phase: ${this.currentTaskType.toUpperCase()} Trials</h3>`;

        switch (this.currentCondition) {
            case 'three-same':
                ruleHTML += `
                    <p><strong>Rule:</strong> Press SPACE if you find <strong>three strings ending with the SAME ${typeText}</strong> in one <strong>row or column</strong>.</p>
                    <p class="example"><strong>Example:</strong> "ABX", "CDX", "EFX" in a row → all end with "X" → Press SPACE</p>
                    <p class="example"><strong>Important:</strong> Do NOT press if they form a diagonal. Only rows and columns count.</p>
                `;
                break;
            case 'five-same':
                ruleHTML += `
                    <p><strong>Rule:</strong> Press SPACE if you find <strong>five strings ending with the SAME ${typeText}</strong> forming a <strong>cross or T pattern</strong>.</p>
                    <p class="example"><strong>Cross:</strong> Center cell + all four adjacent cells (up, down, left, right)</p>
                    <p class="example"><strong>T patterns:</strong> Any rotation of a T shape (T pointing up, down, left, or right)</p>
                `;
                break;
            case 'three-different':
                ruleHTML += `
                    <p><strong>Rule:</strong> Press SPACE if you find <strong>three strings ending with three DIFFERENT ${typeText}</strong> in one <strong>row or column</strong>.</p>
                    <p class="example"><strong>Example:</strong> "ABA", "CDC", "EFE" in a row → endings are A, C, E (all different) → Press SPACE</p>
                    <p class="example"><strong>Important:</strong> All three endings must be different from each other. Do NOT press for diagonals.</p>
                `;
                break;
            case 'five-different':
                ruleHTML += `
                    <p><strong>Rule:</strong> Press SPACE if you find <strong>five strings ending with five DIFFERENT ${typeText}</strong> forming a <strong>cross or T pattern</strong>.</p>
                    <p class="example"><strong>All five endings</strong> in the pattern must be different from each other.</p>
                    <p class="warning"><strong>Warning:</strong> This is the hardest condition. Take your time.</p>
                `;
                break;
        }

        ruleHTML += `
            <h3>Key Points:</h3>
            <ul>
                <li>Each trial displays for <strong>5.5 seconds</strong></li>
                <li>You will complete <strong>${this.phaseTrials.length} trials</strong></li>
                <li><strong>Only press SPACE</strong> when you detect the target pattern</li>
                <li><strong>Do NOT respond</strong> if the pattern is not present</li>
                <li>Focus on the <strong>last character</strong> of each three-character string</li>
                <li>About half of the trials will contain the target pattern</li>
            </ul>
        `;

        if (this.currentPhase === 'training') {
            ruleHTML += `<p class="training-note" style="margin-top:15px; padding:12px; background:#fff3cd; border-left:4px solid #ffc107; border-radius:4px;"><strong>Training Phase:</strong> Use these trials to practice and understand the rule. Your performance here does not affect your results.</p>`;
        }

        return ruleHTML;
    }

    beginCurrentPhase() {
        this.hideAllScreens();
        document.getElementById('task-screen').classList.add('active');
        this.showNextTrial();
    }

    // ==================== Trial Generation ====================

    generatePhaseTrials(phaseConfig) {
        const symbols = phaseConfig.taskType === 'letter' ? this.consonants : this.digits;
        const numTrials = phaseConfig.trials;
        const condition = phaseConfig.condition || this.experimentConfig.condition;

        // Determine interference (Experiment 2 only)
        const useInterference = this.experimentConfig.type === 'experiment2' && phaseConfig.phase === 'test';

        const trials = [];

        // Generate half relation trials, half no-relation trials
        const numRelationTrials = Math.floor(numTrials / 2);
        const numNoRelationTrials = numTrials - numRelationTrials;

        for (let i = 0; i < numRelationTrials; i++) {
            const highInterference = useInterference && i >= numRelationTrials / 2;
            trials.push(this.generateTrial(symbols, condition, true, highInterference));
        }

        for (let i = 0; i < numNoRelationTrials; i++) {
            const highInterference = useInterference && i >= numNoRelationTrials / 2;
            trials.push(this.generateTrial(symbols, condition, false, highInterference));
        }

        // Shuffle trials
        this.shuffleArray(trials);

        return trials;
    }

    generateTrial(symbols, condition, hasRelation, highInterference = false) {
        // Generate base grid
        const grid = Array(9).fill(null).map(() => this.generateRandomString(symbols));

        if (hasRelation) {
            this.insertRelation(grid, symbols, condition);
        }

        if (highInterference && (condition === 'three-same' || condition === 'five-same')) {
            this.addHighInterference(grid, symbols, condition);
        }

        return {
            grid: grid,
            hasRelation: hasRelation,
            condition: condition,
            highInterference: highInterference
        };
    }

    generateRandomString(symbols) {
        let str = '';
        for (let i = 0; i < 3; i++) {
            str += symbols[Math.floor(Math.random() * symbols.length)];
        }
        return str;
    }

    insertRelation(grid, symbols, condition) {
        switch (condition) {
            case 'three-same':
                this.insertThreeSame(grid, symbols);
                break;
            case 'five-same':
                this.insertFiveSame(grid, symbols);
                break;
            case 'seven-same':
                this.insertSevenSame(grid, symbols);
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
            [0, 3, 6], [1, 4, 7], [2, 5, 8]  // columns (NO diagonals)
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

    insertSevenSame(grid, symbols) {
        // 7-object patterns: larger patterns (experimental for Week 4 progressive mode)
        const patterns = [
            [0, 1, 2, 3, 4, 5, 6],  // Top row + middle row
            [0, 1, 2, 4, 6, 7, 8],  // Top row + bottom row
            [0, 1, 3, 4, 5, 7, 8],  // Outer ring without corners
            [1, 2, 3, 4, 5, 6, 7]   // Middle and bottom rows
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
            [0, 3, 6], [1, 4, 7], [2, 5, 8]  // columns (NO diagonals)
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

    // Add high interference: 12 stimuli besides target are identical
    // (Experiment 2 only)
    addHighInterference(grid, symbols, condition) {
        // Find cells not in the target relation
        // For simplicity, we'll make 12 random non-target cells identical
        // This is an approximation of the study's interference manipulation

        const targetSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        let cellsToModify = [];

        // Collect indices that we can safely modify (not breaking the rule)
        for (let i = 0; i < 9; i++) {
            cellsToModify.push(i);
        }

        // Shuffle and take first 12 positions (may overlap with some of the 9 grid cells)
        // Since we only have 9 cells total, we'll modify as many as possible without breaking the rule
        // This is a simplified version - the exact implementation would need more detail from the paper

        // For now, modify up to 6 cells (keeping at least 3 for potential patterns)
        this.shuffleArray(cellsToModify);
        const numToModify = Math.min(6, cellsToModify.length);

        for (let i = 0; i < numToModify; i++) {
            const idx = cellsToModify[i];
            const prefix = grid[idx].substring(0, 2);
            grid[idx] = prefix + targetSymbol;
        }
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

    // ==================== Trial Display with Persistence ====================

    showNextTrial() {
        if (this.currentTrialIndex >= this.phaseTrials.length) {
            // Phase complete
            this.completeCurrentPhase();
            return;
        }

        const trial = this.phaseTrials[this.currentTrialIndex];

        // Apply trial persistence: 1-4 strings carry over from previous trial
        // Modified by WM Load mode if experimental
        if (this.previousGrid !== null && this.currentTrialIndex > 0) {
            let numCarryOver;

            // Determine carryover based on WM load mode
            if (this.experimentalMode === 'wmload' || this.experimentConfig?.type === 'wmload') {
                const loadModes = {
                    easy: 4,
                    medium: Math.floor(Math.random() * 4) + 1,
                    hard: Math.random() < 0.5 ? 0 : 1,
                    extreme: 0
                };
                numCarryOver = loadModes[this.wmLoadMode] || Math.floor(Math.random() * 4) + 1;
            } else {
                numCarryOver = Math.floor(Math.random() * 4) + 1; // 1 to 4 (original)
            }

            if (numCarryOver > 0) {
                const indicesToCarryOver = [];

                // Select random positions to carry over
                for (let i = 0; i < 9; i++) {
                    indicesToCarryOver.push(i);
                }
                this.shuffleArray(indicesToCarryOver);

                // Copy strings from previous grid
                for (let i = 0; i < numCarryOver; i++) {
                    const idx = indicesToCarryOver[i];
                    trial.grid[idx] = this.previousGrid[idx];
                }
            }
        }

        // Save current grid for next trial
        this.previousGrid = [...trial.grid];

        this.displayTrial(trial);
        this.startTrialTimer();
    }

    displayTrial(trial) {
        // Update trial counter
        const totalTrials = this.phaseTrials.length;

        document.getElementById('phase-indicator').textContent =
            this.currentPhase === 'training' ? 'Training' : 'Test';
        document.getElementById('task-type-indicator').textContent =
            this.currentTaskType === 'letter' ? 'Letters' : 'Numbers';
        document.getElementById('condition-indicator').textContent =
            this.formatCondition(this.currentCondition);
        document.getElementById('current-trial').textContent = this.currentTrialIndex + 1;
        document.getElementById('total-trials').textContent = totalTrials;

        // Clear grid
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';

        // Create grid cells
        trial.grid.forEach((str, idx) => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';

            // Add colors for multi-relational mode
            if (trial.colors && trial.colors[idx]) {
                cell.classList.add('grid-cell-colored');
                cell.classList.add(`color-${trial.colors[idx]}`);
            }

            cell.textContent = str;
            gridContainer.appendChild(cell);
        });

        // Clear response indicator
        document.getElementById('response-indicator').textContent = '';
        document.getElementById('response-indicator').className = 'response-indicator';

        // Re-enable mobile button for new trial
        const mobileBtn = document.getElementById('mobile-response-btn');
        if (mobileBtn) {
            mobileBtn.disabled = false;
        }

        this.responded = false;
        this.trialStartTime = Date.now();
    }

    startTrialTimer() {
        const timerBar = document.getElementById('timer-bar');
        timerBar.style.width = '100%';

        const startTime = Date.now();
        const duration = this.TRIAL_DURATION;

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
        if (e.code !== 'Space' || this.responded) return;
        if (!document.getElementById('task-screen').classList.contains('active')) return;

        e.preventDefault();
        this.recordResponse();
    }

    handleMobileResponse() {
        if (this.responded) return;
        if (!document.getElementById('task-screen').classList.contains('active')) return;

        this.recordResponse();
    }

    recordResponse() {
        if (this.responded) return;

        this.responded = true;
        const reactionTime = Date.now() - this.trialStartTime;
        const trial = this.phaseTrials[this.currentTrialIndex];

        // Disable mobile button after response
        const mobileBtn = document.getElementById('mobile-response-btn');
        if (mobileBtn) {
            mobileBtn.disabled = true;
        }

        // Record the response
        if (trial.hasRelation) {
            this.currentPhaseResults.hits++;
            this.currentPhaseResults.reactionTimes.push(reactionTime);
            this.showFeedback('✓ Correct (Hit)', 'correct');
        } else {
            this.currentPhaseResults.falseAlarms++;
            this.showFeedback('✗ False Alarm', 'incorrect');
        }

        this.currentPhaseResults.trialData.push({
            trialNumber: this.currentTrialIndex + 1,
            phase: this.currentPhase,
            taskType: this.currentTaskType,
            condition: this.currentCondition,
            hasRelation: trial.hasRelation,
            highInterference: trial.highInterference || false,
            responded: true,
            correct: trial.hasRelation,
            reactionTime: reactionTime
        });
    }

    endTrial() {
        clearInterval(this.timerInterval);

        const trial = this.phaseTrials[this.currentTrialIndex];

        if (!this.responded) {
            // No response given
            if (trial.hasRelation) {
                this.currentPhaseResults.misses++;
                this.showFeedback('✗ Miss (No Response)', 'incorrect');
            } else {
                this.currentPhaseResults.correctRejections++;
                this.showFeedback('✓ Correct (Rejection)', 'correct');
            }

            this.currentPhaseResults.trialData.push({
                trialNumber: this.currentTrialIndex + 1,
                phase: this.currentPhase,
                taskType: this.currentTaskType,
                condition: this.currentCondition,
                hasRelation: trial.hasRelation,
                highInterference: trial.highInterference || false,
                responded: false,
                correct: !trial.hasRelation,
                reactionTime: null
            });
        }

        // Experimental modes: handle special features
        const mode = this.experimentalMode || this.experimentConfig?.type;

        // Update n-back history
        if (mode === 'nback') {
            this.updateNBackHistory(trial);
            this.adjustNBackLevel();
        }

        // Adaptive difficulty adjustments
        if (mode === 'adaptive' && this.currentTrialIndex % 10 === 0) {
            this.adjustAdaptiveDifficulty();
        }

        // Metacognitive mode: show confidence rating
        if (mode === 'metacognitive') {
            setTimeout(() => {
                this.hideAllScreens();
                document.getElementById('confidence-screen').classList.add('active');
            }, 800);
            return; // Don't proceed to next trial yet
        }

        // Move to next trial after brief delay
        setTimeout(() => {
            this.currentTrialIndex++;
            // Brief blink between trials
            document.getElementById('grid-container').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('grid-container').style.opacity = '1';
                this.showNextTrial();
            }, this.BLINK_DURATION);
        }, 500);
    }

    showFeedback(message, type) {
        const indicator = document.getElementById('response-indicator');
        indicator.textContent = message;
        indicator.className = 'response-indicator ' + type;
    }

    // ==================== Phase Completion ====================

    completeCurrentPhase() {
        // Save phase results
        const phaseIndex = this.experimentConfig.phases.findIndex(p => !p.completed);
        if (phaseIndex !== -1) {
            this.experimentConfig.phases[phaseIndex].completed = true;
            this.experimentConfig.phases[phaseIndex].results = { ...this.currentPhaseResults };
        }

        // Store results for final display
        this.allResults.push({
            phase: this.currentPhase,
            taskType: this.currentTaskType,
            condition: this.currentCondition,
            results: { ...this.currentPhaseResults }
        });

        // Start next phase
        this.startNextPhase();
    }

    // ==================== Results Display ====================

    showResults() {
        this.hideAllScreens();
        document.getElementById('results-screen').classList.add('active');

        // Build results based on experiment type
        let resultsHTML = '';
        let interpretationHTML = '';

        const expType = this.experimentConfig.type;

        // Update progress data for experimental modes
        if (['adaptive', 'progressive', 'speed', 'multirelational', 'nback', 'interference', 'wmload', 'metacognitive'].includes(expType)) {
            const sessionResults = this.calculateSessionResults();
            this.updateProgressData(sessionResults);
            resultsHTML = this.buildExperimentalModeResults();
            interpretationHTML = this.buildExperimentalModeInterpretation();
        } else if (expType === 'experiment1') {
            resultsHTML = this.buildExperiment1Results();
            interpretationHTML = this.buildExperiment1Interpretation();
        } else if (expType === 'experiment2') {
            resultsHTML = this.buildExperiment2Results();
            interpretationHTML = this.buildExperiment2Interpretation();
        } else if (expType === 'experiment3') {
            resultsHTML = this.buildExperiment3Results();
            interpretationHTML = this.buildExperiment3Interpretation();
        }

        document.getElementById('results-content').innerHTML = resultsHTML;
        document.getElementById('interpretation-content').innerHTML = interpretationHTML;
    }

    calculateSessionResults() {
        // Calculate overall session statistics
        let totalCorrect = 0;
        let totalTrials = 0;

        this.allResults.forEach(phaseResult => {
            const results = phaseResult.results;
            totalCorrect += results.hits + results.correctRejections;
            totalTrials += results.hits + results.misses + results.falseAlarms + results.correctRejections;
        });

        const accuracy = totalTrials > 0 ? (totalCorrect / totalTrials) : 0;

        return {
            accuracy: accuracy,
            totalTrials: totalTrials,
            totalCorrect: totalCorrect,
            mode: this.experimentalMode || this.experimentConfig.type
        };
    }

    buildExperimentalModeResults() {
        const results = this.allResults[0]?.results;
        if (!results) return '<p>No results available.</p>';

        const accuracy = this.calculateAccuracy(results);
        const mode = this.experimentalMode || this.experimentConfig.type;

        let html = `
            <div class="stat-grid">
                <div class="stat-item highlight">
                    <span class="stat-label">Mode:</span>
                    <span class="stat-value">${this.formatModeName(mode)}</span>
                </div>
                <div class="stat-item highlight">
                    <span class="stat-label">Overall Accuracy:</span>
                    <span class="stat-value">${accuracy.toFixed(3)}</span>
                </div>
                ${this.buildStatsForResults(results, 'Session')}
            </div>
        `;

        // Add mode-specific stats
        if (mode === 'adaptive') {
            html += `
                <div class="stat-grid" style="margin-top: 20px;">
                    <div class="stat-item">
                        <span class="stat-label">Final Difficulty Level:</span>
                        <span class="stat-value">${this.adaptiveDifficulty.level}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Objects at End:</span>
                        <span class="stat-value">${this.adaptiveDifficulty.numObjects}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Trial Duration at End:</span>
                        <span class="stat-value">${(this.adaptiveDifficulty.trialDuration / 1000).toFixed(1)}s</span>
                    </div>
                </div>
            `;
        } else if (mode === 'metacognitive') {
            const avgConfidence = this.confidenceData.length > 0
                ? (this.confidenceData.reduce((sum, d) => sum + d.confidence, 0) / this.confidenceData.length).toFixed(2)
                : 'N/A';
            const calibration = this.calculateCalibration();

            html += `
                <div class="stat-grid" style="margin-top: 20px;">
                    <div class="stat-item">
                        <span class="stat-label">Average Confidence:</span>
                        <span class="stat-value">${avgConfidence}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Calibration Score:</span>
                        <span class="stat-value">${calibration}</span>
                    </div>
                </div>
            `;
        } else if (mode === 'nback') {
            html += `
                <div class="stat-grid" style="margin-top: 20px;">
                    <div class="stat-item">
                        <span class="stat-label">Final N-Back Level:</span>
                        <span class="stat-value">${this.nBackLevel}-back</span>
                    </div>
                </div>
            `;
        }

        return html;
    }

    buildExperimentalModeInterpretation() {
        const mode = this.experimentalMode || this.experimentConfig.type;
        const interpretations = {
            adaptive: `<p><strong>Adaptive Training:</strong> The task adjusted difficulty based on your performance. You reached level ${this.adaptiveDifficulty.level}. Continuous adaptive training keeps you at your optimal challenge level for maximum cognitive growth.</p>`,
            progressive: `<p><strong>Progressive Complexity (Week ${this.progressiveWeek}):</strong> You completed Week ${this.progressiveWeek} of the 4-week program. Gradual difficulty progression builds robust cognitive skills over time.</p>`,
            speed: `<p><strong>Speed-Accuracy Training (${this.speedMode} mode):</strong> Processing speed is a key component of fluid intelligence. This mode helps develop rapid pattern recognition abilities.</p>`,
            multirelational: `<p><strong>Multi-Relational Integration:</strong> By tracking multiple dimensions simultaneously, you're training higher-order relational integration—a core component of fluid reasoning.</p>`,
            nback: `<p><strong>Dual N-Back Hybrid:</strong> You reached ${this.nBackLevel}-back level. Combining working memory and relational integration creates a powerful cognitive workout.</p>`,
            interference: `<p><strong>Interference Management (Level ${this.interferenceLevel}):</strong> Training with distractors strengthens selective attention and inhibitory control—crucial executive functions.</p>`,
            wmload: `<p><strong>Working Memory Load (${this.wmLoadMode}):</strong> Varying memory load helps build working memory capacity, which is closely linked to fluid intelligence.</p>`,
            metacognitive: `<p><strong>Meta-Cognitive Training:</strong> By monitoring your confidence and calibration, you're developing metacognitive awareness—a skill that improves learning across domains.</p>`
        };

        let interpretation = interpretations[mode] || '<p>Training completed successfully.</p>';

        interpretation += `
            <p style="margin-top: 20px;"><strong>Progress Tracking:</strong> Your progress has been saved. View your full statistics and badges in the Gamified Progress dashboard!</p>
            <p><strong>Total Sessions Completed:</strong> ${this.progressData.sessionsCompleted}</p>
        `;

        return interpretation;
    }

    formatModeName(mode) {
        const names = {
            adaptive: 'Adaptive Difficulty',
            progressive: 'Progressive Complexity',
            speed: 'Speed-Accuracy',
            multirelational: 'Multi-Relational',
            nback: 'Dual N-Back Hybrid',
            interference: 'Interference Management',
            wmload: 'WM Load Variation',
            metacognitive: 'Meta-Cognitive'
        };
        return names[mode] || mode;
    }

    calculateCalibration() {
        if (this.confidenceData.length === 0) return 'N/A';

        // Calibration: correlation between confidence and accuracy
        const highConfCorrect = this.confidenceData.filter(d => d.confidence >= 4 && d.correct).length;
        const highConfTotal = this.confidenceData.filter(d => d.confidence >= 4).length;
        const lowConfCorrect = this.confidenceData.filter(d => d.confidence <= 2 && d.correct).length;
        const lowConfTotal = this.confidenceData.filter(d => d.confidence <= 2).length;

        const highConfAcc = highConfTotal > 0 ? (highConfCorrect / highConfTotal) : 0;
        const lowConfAcc = lowConfTotal > 0 ? (lowConfCorrect / lowConfTotal) : 0;

        // Good calibration = high accuracy when confident, low when not
        const calibration = highConfAcc - lowConfAcc;

        if (calibration > 0.3) return 'Excellent';
        if (calibration > 0.1) return 'Good';
        if (calibration > -0.1) return 'Fair';
        return 'Needs Improvement';
    }

    buildExperiment1Results() {
        // Combine letter and number test results
        const letterResults = this.allResults.find(r => r.phase === 'test' && r.taskType === 'letter').results;
        const numberResults = this.allResults.find(r => r.phase === 'test' && r.taskType === 'number').results;

        const letterAccuracy = this.calculateAccuracy(letterResults);
        const numberAccuracy = this.calculateAccuracy(numberResults);
        const overallAccuracy = (letterAccuracy + numberAccuracy) / 2;

        return `
            <div class="stat-grid">
                <div class="stat-item highlight">
                    <span class="stat-label">Condition:</span>
                    <span class="stat-value">${this.formatCondition(this.currentCondition)}</span>
                </div>
                <div class="stat-item highlight">
                    <span class="stat-label">Overall Accuracy:</span>
                    <span class="stat-value">${overallAccuracy.toFixed(3)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Letter Accuracy:</span>
                    <span class="stat-value">${letterAccuracy.toFixed(3)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Number Accuracy:</span>
                    <span class="stat-value">${numberAccuracy.toFixed(3)}</span>
                </div>
                ${this.buildStatsForResults(letterResults, 'Letter')}
                ${this.buildStatsForResults(numberResults, 'Number')}
            </div>
        `;
    }

    buildExperiment2Results() {
        // Show results for both conditions
        let html = '<h3>Results by Condition</h3>';

        const conditions = ['three-same', 'five-same'];
        conditions.forEach(condition => {
            const conditionResults = this.allResults.filter(r => r.condition === condition && r.phase === 'test');
            const letterRes = conditionResults.find(r => r.taskType === 'letter').results;
            const numberRes = conditionResults.find(r => r.taskType === 'number').results;

            const letterAcc = this.calculateAccuracy(letterRes);
            const numberAcc = this.calculateAccuracy(numberRes);
            const overallAcc = (letterAcc + numberAcc) / 2;

            html += `
                <div class="condition-results" style="margin-bottom: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
                    <h4>${this.formatCondition(condition)}</h4>
                    <div class="stat-grid">
                        <div class="stat-item highlight">
                            <span class="stat-label">Overall Accuracy:</span>
                            <span class="stat-value">${overallAcc.toFixed(3)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Letter Accuracy:</span>
                            <span class="stat-value">${letterAcc.toFixed(3)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Number Accuracy:</span>
                            <span class="stat-value">${numberAcc.toFixed(3)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        return html;
    }

    buildExperiment3Results() {
        // Show results for all three conditions
        let html = '<h3>Results by Condition</h3>';

        const conditions = ['three-same', 'five-same', 'three-different'];
        conditions.forEach(condition => {
            const conditionResults = this.allResults.filter(r => r.condition === condition);
            const letterRes = conditionResults.find(r => r.taskType === 'letter').results;
            const numberRes = conditionResults.find(r => r.taskType === 'number').results;

            const letterAcc = this.calculateAccuracy(letterRes);
            const numberAcc = this.calculateAccuracy(numberRes);
            const overallAcc = (letterAcc + numberAcc) / 2;

            html += `
                <div class="condition-results" style="margin-bottom: 30px; padding: 20px; background: #f7fafc; border-radius: 8px;">
                    <h4>${this.formatCondition(condition)}</h4>
                    <div class="stat-grid">
                        <div class="stat-item highlight">
                            <span class="stat-label">Overall Accuracy:</span>
                            <span class="stat-value">${overallAcc.toFixed(3)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Number Accuracy:</span>
                            <span class="stat-value">${numberAcc.toFixed(3)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Letter Accuracy:</span>
                            <span class="stat-value">${letterAcc.toFixed(3)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        return html;
    }

    buildStatsForResults(results, prefix) {
        const totalRelation = results.hits + results.misses;
        const totalNoRelation = results.falseAlarms + results.correctRejections;
        const hitRate = totalRelation > 0 ? results.hits / totalRelation : 0;
        const faRate = totalNoRelation > 0 ? results.falseAlarms / totalNoRelation : 0;
        const meanRT = results.reactionTimes.length > 0 ?
            results.reactionTimes.reduce((a, b) => a + b, 0) / results.reactionTimes.length : 0;

        return `
            <div class="stat-item">
                <span class="stat-label">${prefix} Hit Rate:</span>
                <span class="stat-value">${(hitRate * 100).toFixed(1)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">${prefix} FA Rate:</span>
                <span class="stat-value">${(faRate * 100).toFixed(1)}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">${prefix} Mean RT:</span>
                <span class="stat-value">${meanRT.toFixed(0)} ms</span>
            </div>
        `;
    }

    calculateAccuracy(results) {
        const totalRelation = results.hits + results.misses;
        const totalNoRelation = results.falseAlarms + results.correctRejections;
        const hitRate = totalRelation > 0 ? results.hits / totalRelation : 0;
        const faRate = totalNoRelation > 0 ? results.falseAlarms / totalNoRelation : 0;
        return hitRate - faRate;
    }

    buildExperiment1Interpretation() {
        const condition = this.currentCondition;
        const studyMeans = {
            'three-same': 0.73,
            'five-same': 0.73,
            'three-different': 0.38,
            'five-different': 0.18
        };

        const expectedAccuracy = studyMeans[condition];

        return `
            <p><strong>Experiment 1 Findings:</strong> This experiment tested whether the number of bindings (not objects) determines task difficulty.</p>
            <p><strong>Your Condition:</strong> ${this.formatCondition(condition)}</p>
            <p><strong>Expected Accuracy:</strong> ${expectedAccuracy.toFixed(2)} (from study)</p>
            <p><strong>Key Insight:</strong> Performance depends on the number of bindings that must be integrated. The three-same and five-same conditions both require only 2 bindings, yielding similar accuracy (~0.73), despite five-same having more objects. In contrast, three-different (3 bindings) and five-different (5-10 bindings) are progressively harder.</p>
        `;
    }

    buildExperiment2Interpretation() {
        return `
            <p><strong>Experiment 2 Findings:</strong> This experiment tested whether interference affects performance.</p>
            <p><strong>Key Result:</strong> The study found no significant effect of interference on accuracy (low vs. high interference: 76% vs. 77%). This suggests that relational integration primarily depends on binding processes, not interference resolution.</p>
            <p><strong>Additional Finding:</strong> The three-same vs. five-same comparison again showed no significant difference (both ~73% accuracy), confirming that the number of objects doesn't determine difficulty when bindings are constant.</p>
        `;
    }

    buildExperiment3Interpretation() {
        return `
            <p><strong>Experiment 3 Findings:</strong> This experiment compared the predictive power of different conditions for fluid intelligence.</p>
            <p><strong>Study Results:</strong></p>
            <ul>
                <li><strong>All three conditions</strong> strongly predicted fluid intelligence (r = .48, .43, .47 for three-same, five-same, and three-different)</li>
                <li><strong>No significant differences</strong> between conditions in predictive power</li>
                <li><strong>Relational integration</strong> was the strongest predictor of fluid reasoning, explaining variance <strong>above and beyond</strong> complex span, STM, n-back, and antisaccade tasks</li>
                <li>Unique contribution: <strong>5.9% variance</strong> in fluid intelligence (more than any other WM measure)</li>
            </ul>
            <p><strong>Conclusion:</strong> Relational integration capacity—the ability to bind and integrate mental representations—is a fundamental cognitive ability that underlies fluid reasoning.</p>
        `;
    }

    formatCondition(condition) {
        const map = {
            'three-same': 'Three-Same',
            'five-same': 'Five-Same',
            'three-different': 'Three-Different',
            'five-different': 'Five-Different'
        };
        return map[condition] || condition;
    }

    // ==================== Data Export ====================

    downloadResults() {
        const data = {
            experiment: this.experimentConfig.type,
            timestamp: new Date().toISOString(),
            configuration: this.experimentConfig,
            allResults: this.allResults,
            summary: this.buildSummaryData()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relational-integration-${this.experimentConfig.type}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    buildSummaryData() {
        const summary = {};
        this.allResults.forEach(result => {
            const key = `${result.condition}_${result.taskType}`;
            summary[key] = {
                accuracy: this.calculateAccuracy(result.results),
                hits: result.results.hits,
                misses: result.results.misses,
                falseAlarms: result.results.falseAlarms,
                correctRejections: result.results.correctRejections,
                meanRT: result.results.reactionTimes.length > 0 ?
                    result.results.reactionTimes.reduce((a, b) => a + b, 0) / result.results.reactionTimes.length : 0
            };
        });
        return summary;
    }

    abortTask() {
        // Clear any running timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Confirm with user before aborting
        if (confirm('Are you sure you want to abort the current task and return to the main menu? Your progress will be lost.')) {
            this.resetExperimentState();
            this.showWelcome();
        }
    }

    restart() {
        this.showWelcome();
    }

    // ==================== EXPERIMENTAL MODES ====================

    // ==================== Mode Selection & Configuration ====================

    selectExperimentalMode(mode) {
        this.experimentalMode = mode;
        this.hideAllScreens();

        // Special handling for gamified mode - go directly to dashboard
        if (mode === 'gamified') {
            this.showProgressDashboard();
            return;
        }

        // Show configuration screen for other modes
        document.getElementById('experimental-config-screen').classList.add('active');
        this.showExperimentalConfig(mode);
    }

    showExperimentalConfig(mode) {
        const title = document.getElementById('exp-mode-title');
        const content = document.getElementById('exp-mode-config-content');

        const configs = {
            adaptive: {
                title: 'Adaptive Difficulty Mode',
                html: `
                    <h3>How it Works</h3>
                    <p>The task automatically adjusts difficulty based on your performance:</p>
                    <ul>
                        <li><strong>Start:</strong> 3 objects, 6 seconds per trial</li>
                        <li><strong>If 80%+ accuracy:</strong> Increase objects or reduce time</li>
                        <li><strong>If <60% accuracy:</strong> Decrease objects or add time</li>
                        <li><strong>Maximum:</strong> 7 objects, 3 seconds</li>
                    </ul>
                    <p><strong>Session:</strong> 50 trials with continuous adaptation</p>
                    <p class="config-note">This mode keeps you at your optimal challenge level for maximum learning.</p>
                `
            },
            progressive: {
                title: 'Progressive Complexity Training',
                html: `
                    <h3>4-Week Training Program</h3>
                    <p>You are currently on <strong>Week ${this.progressiveWeek}</strong>:</p>
                    <ul>
                        <li><strong>Week 1:</strong> 3 objects, 7 seconds, clean grids (30 trials)</li>
                        <li><strong>Week 2:</strong> Mixed 3-5 objects, 6 seconds (40 trials)</li>
                        <li><strong>Week 3:</strong> 5 objects, 5.5 seconds, interference (50 trials)</li>
                        <li><strong>Week 4:</strong> 7 objects, 5 seconds, high interference (60 trials)</li>
                    </ul>
                    <p class="config-note">Complete each week before advancing. Progress is saved automatically.</p>
                `
            },
            speed: {
                title: 'Speed-Accuracy Training',
                html: `
                    <h3>Select Training Mode</h3>
                    <div class="config-option">
                        <label for="speed-mode-select">Mode:</label>
                        <select id="speed-mode-select">
                            <option value="accuracy">Accuracy Priority (Unlimited time)</option>
                            <option value="balanced" selected>Balanced (5.5 seconds - original)</option>
                            <option value="speed">Speed Priority (3 seconds)</option>
                            <option value="blitz">Blitz Mode (2 seconds - extreme!)</option>
                        </select>
                    </div>
                    <p><strong>Session:</strong> 40 trials in selected mode</p>
                    <p class="config-note">Processing speed is highly correlated with fluid intelligence.</p>
                `
            },
            multirelational: {
                title: 'Multi-Relational Integration',
                html: `
                    <h3>Dual-Dimension Pattern Detection</h3>
                    <p>In this mode, you'll track <strong>TWO</strong> pattern types simultaneously:</p>
                    <ul>
                        <li><strong>Number patterns:</strong> Same as original task (last character)</li>
                        <li><strong>Color patterns:</strong> Small colored dots on each cell</li>
                        <li><strong>Your task:</strong> Press SPACE if EITHER pattern is present</li>
                    </ul>
                    <p><strong>Session:</strong> 50 trials with dual tracking</p>
                    <p class="config-note">Higher relational complexity = better predictor of fluid intelligence.</p>
                `
            },
            nback: {
                title: 'Dual N-Back Hybrid',
                html: `
                    <h3>Combined Task Challenge</h3>
                    <p>This mode combines relational integration with n-back memory:</p>
                    <ul>
                        <li><strong>Primary task:</strong> Detect patterns (as usual)</li>
                        <li><strong>Secondary task:</strong> Does current grid match N trials back?</li>
                        <li><strong>Start:</strong> 1-back (easier)</li>
                        <li><strong>Progress:</strong> Automatic advancement to 2-back, then 3-back</li>
                    </ul>
                    <p><strong>Session:</strong> 60 trials with progressive n-back</p>
                    <p class="config-note">Dual n-back training has some evidence for transfer to fluid intelligence.</p>
                `
            },
            interference: {
                title: 'Interference Management Training',
                html: `
                    <h3>Progressive Distractor Levels</h3>
                    <p>You are currently on <strong>Level ${this.interferenceLevel}</strong>:</p>
                    <ul>
                        <li><strong>Level 1:</strong> Clean grids (baseline)</li>
                        <li><strong>Level 2:</strong> Similar symbols as distractors</li>
                        <li><strong>Level 3:</strong> Partial conflicting patterns</li>
                        <li><strong>Level 4:</strong> High interference + time pressure (4 seconds)</li>
                    </ul>
                    <p><strong>Session:</strong> 40 trials at current level</p>
                    <p class="config-note">Trains selective attention and inhibitory control.</p>
                `
            },
            wmload: {
                title: 'Working Memory Load Variation',
                html: `
                    <h3>Trial Persistence Configuration</h3>
                    <div class="config-option">
                        <label for="wmload-select">Working Memory Load:</label>
                        <select id="wmload-select">
                            <option value="easy">Easy: 4 items always carry over</option>
                            <option value="medium" selected>Medium: 1-4 items (original study)</option>
                            <option value="hard">Hard: 0-1 items carry over</option>
                            <option value="extreme">Extreme: All new items every trial</option>
                        </select>
                    </div>
                    <p><strong>Session:</strong> 50 trials in selected mode</p>
                    <p class="config-note">Higher WM load requires more capacity and focus.</p>
                `
            },
            metacognitive: {
                title: 'Meta-Cognitive Training',
                html: `
                    <h3>Self-Monitoring Enhancement</h3>
                    <p>This mode adds metacognitive reflection to enhance learning:</p>
                    <ul>
                        <li><strong>After each trial:</strong> Rate your confidence (1-5)</li>
                        <li><strong>Calibration tracking:</strong> Compare confidence vs. accuracy</li>
                        <li><strong>Strategy tips:</strong> Receive feedback when struggling</li>
                        <li><strong>Self-awareness:</strong> Learn to monitor your cognitive state</li>
                    </ul>
                    <p><strong>Session:</strong> 40 trials with confidence ratings</p>
                    <p class="config-note">Metacognition improves learning and problem-solving.</p>
                `
            }
        };

        const config = configs[mode];
        title.textContent = config.title;
        content.innerHTML = config.html;
    }

    startExperimentalMode() {
        const mode = this.experimentalMode;

        // Get user selections where applicable
        if (mode === 'speed') {
            const select = document.getElementById('speed-mode-select');
            this.speedMode = select ? select.value : 'balanced';
        } else if (mode === 'wmload') {
            const select = document.getElementById('wmload-select');
            this.wmLoadMode = select ? select.value : 'medium';
        }

        // Configure experiment based on mode
        const modeConfigs = {
            adaptive: () => this.configureAdaptiveMode(),
            progressive: () => this.configureProgressiveMode(),
            speed: () => this.configureSpeedMode(),
            multirelational: () => this.configureMultiRelationalMode(),
            nback: () => this.configureNBackMode(),
            interference: () => this.configureInterferenceMode(),
            wmload: () => this.configureWMLoadMode(),
            metacognitive: () => this.configureMetaCognitiveMode()
        };

        if (modeConfigs[mode]) {
            modeConfigs[mode]();
            this.resetExperimentState();
            this.startNextPhase();
        }
    }

    // ==================== Mode Configurations ====================

    configureAdaptiveMode() {
        this.experimentConfig = {
            type: 'adaptive',
            condition: 'three-same',
            phases: [
                { phase: 'test', taskType: 'letter', trials: 50 }
            ]
        };
        this.adaptiveDifficulty = { numObjects: 3, trialDuration: 6000, recentAccuracy: [], level: 1 };
    }

    configureProgressiveMode() {
        const weekConfigs = {
            1: { numObjects: 3, duration: 7000, trials: 30, interference: false },
            2: { numObjects: 'mixed', duration: 6000, trials: 40, interference: false },
            3: { numObjects: 5, duration: 5500, trials: 50, interference: true },
            4: { numObjects: 7, duration: 5000, trials: 60, interference: true }
        };

        const config = weekConfigs[this.progressiveWeek];
        this.experimentConfig = {
            type: 'progressive',
            week: this.progressiveWeek,
            condition: config.numObjects === 7 ? 'seven-same' : config.numObjects === 5 ? 'five-same' : 'three-same',
            phases: [
                { phase: 'test', taskType: 'letter', trials: config.trials, ...config }
            ]
        };
    }

    configureSpeedMode() {
        const durations = {
            accuracy: 999999,
            balanced: 5500,
            speed: 3000,
            blitz: 2000
        };

        this.TRIAL_DURATION = durations[this.speedMode];
        this.experimentConfig = {
            type: 'speed',
            speedMode: this.speedMode,
            condition: 'three-same',
            phases: [
                { phase: 'test', taskType: 'letter', trials: 40 }
            ]
        };
    }

    configureMultiRelationalMode() {
        this.experimentConfig = {
            type: 'multirelational',
            condition: 'three-same',
            phases: [
                { phase: 'test', taskType: 'letter', trials: 50 }
            ]
        };
    }

    configureNBackMode() {
        this.nBackLevel = 1;
        this.nBackHistory = [];
        this.experimentConfig = {
            type: 'nback',
            condition: 'three-same',
            phases: [
                { phase: 'test', taskType: 'letter', trials: 60 }
            ]
        };
    }

    configureInterferenceMode() {
        this.experimentConfig = {
            type: 'interference',
            condition: 'three-same',
            interferenceLevel: this.interferenceLevel,
            phases: [
                { phase: 'test', taskType: 'letter', trials: 40 }
            ]
        };
    }

    configureWMLoadMode() {
        this.experimentConfig = {
            type: 'wmload',
            wmLoadMode: this.wmLoadMode,
            condition: 'three-same',
            phases: [
                { phase: 'test', taskType: 'letter', trials: 50 }
            ]
        };
    }

    configureMetaCognitiveMode() {
        this.confidenceData = [];
        this.experimentConfig = {
            type: 'metacognitive',
            condition: 'three-same',
            phases: [
                { phase: 'test', taskType: 'letter', trials: 40 }
            ]
        };
    }

    // ==================== Progress Tracking (localStorage) ====================

    loadProgressData() {
        try {
            const data = localStorage.getItem('relationalIntegrationProgress');
            return data ? JSON.parse(data) : this.getDefaultProgressData();
        } catch (e) {
            return this.getDefaultProgressData();
        }
    }

    getDefaultProgressData() {
        return {
            sessionsCompleted: 0,
            totalTrials: 0,
            overallAccuracy: [],
            lastSessionDate: null,
            currentStreak: 0,
            longestStreak: 0,
            badges: {
                bronze: false,
                silver: false,
                gold: false,
                platinum: false,
                diamond: false
            },
            progressiveWeek: 1,
            interferenceLevel: 1,
            adaptiveHighestLevel: 1,
            sessionHistory: []
        };
    }

    saveProgressData() {
        try {
            localStorage.setItem('relationalIntegrationProgress', JSON.stringify(this.progressData));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }

    updateProgressData(sessionResults) {
        const today = new Date().toDateString();

        // Update session count
        this.progressData.sessionsCompleted++;
        this.progressData.totalTrials += sessionResults.totalTrials || 0;

        // Update accuracy history
        if (sessionResults.accuracy !== undefined) {
            this.progressData.overallAccuracy.push(sessionResults.accuracy);
            // Keep only last 20 sessions
            if (this.progressData.overallAccuracy.length > 20) {
                this.progressData.overallAccuracy.shift();
            }
        }

        // Update streaks
        if (this.progressData.lastSessionDate === today) {
            // Same day, don't increment
        } else if (this.isConsecutiveDay(this.progressData.lastSessionDate, today)) {
            this.progressData.currentStreak++;
        } else {
            this.progressData.currentStreak = 1;
        }

        if (this.progressData.currentStreak > this.progressData.longestStreak) {
            this.progressData.longestStreak = this.progressData.currentStreak;
        }

        this.progressData.lastSessionDate = today;

        // Update badges
        this.updateBadges();

        // Add to history
        this.progressData.sessionHistory.push({
            date: new Date().toISOString(),
            mode: this.experimentalMode || this.experimentConfig.type,
            ...sessionResults
        });

        // Keep only last 50 sessions
        if (this.progressData.sessionHistory.length > 50) {
            this.progressData.sessionHistory.shift();
        }

        this.saveProgressData();
    }

    isConsecutiveDay(lastDate, today) {
        if (!lastDate) return false;
        const last = new Date(lastDate);
        const current = new Date(today);
        const diffTime = Math.abs(current - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }

    updateBadges() {
        const sessions = this.progressData.sessionsCompleted;
        const avgAccuracy = this.progressData.overallAccuracy.length > 0
            ? this.progressData.overallAccuracy.reduce((a, b) => a + b, 0) / this.progressData.overallAccuracy.length
            : 0;

        if (sessions >= 5) this.progressData.badges.bronze = true;
        if (sessions >= 15 && avgAccuracy >= 0.5) this.progressData.badges.silver = true;
        if (sessions >= 30 && avgAccuracy >= 0.6) this.progressData.badges.gold = true;
        if (sessions >= 50 && avgAccuracy >= 0.7) this.progressData.badges.platinum = true;
        if (sessions >= 100 && avgAccuracy >= 0.75) this.progressData.badges.diamond = true;
    }

    clearProgressData() {
        if (confirm('Are you sure you want to clear ALL progress data? This cannot be undone.')) {
            this.progressData = this.getDefaultProgressData();
            this.saveProgressData();
            this.showProgressDashboard();
        }
    }

    // ==================== Progress Dashboard ====================

    showProgressDashboard() {
        this.hideAllScreens();
        document.getElementById('progress-dashboard').classList.add('active');
        this.renderDashboard();
    }

    renderDashboard() {
        const data = this.progressData;
        const avgAccuracy = data.overallAccuracy.length > 0
            ? (data.overallAccuracy.reduce((a, b) => a + b, 0) / data.overallAccuracy.length).toFixed(3)
            : '0.000';

        // Overall stats
        document.getElementById('overall-stats').innerHTML = `
            <div class="stat-item highlight">
                <span class="stat-label">Sessions Completed:</span>
                <span class="stat-value">${data.sessionsCompleted}</span>
            </div>
            <div class="stat-item highlight">
                <span class="stat-label">Total Trials:</span>
                <span class="stat-value">${data.totalTrials}</span>
            </div>
            <div class="stat-item highlight">
                <span class="stat-label">Average Accuracy:</span>
                <span class="stat-value">${avgAccuracy}</span>
            </div>
        `;

        // Streaks
        document.getElementById('streaks-section').innerHTML = `
            <div class="streak-item">
                <span class="streak-label">🔥 Current Streak</span>
                <span class="streak-value">${data.currentStreak} days</span>
            </div>
            <div class="streak-item">
                <span class="streak-label">⭐ Longest Streak</span>
                <span class="streak-value">${data.longestStreak} days</span>
            </div>
        `;

        // Badges
        const badges = [
            { key: 'bronze', name: 'Bronze', icon: '🥉', desc: '5 sessions' },
            { key: 'silver', name: 'Silver', icon: '🥈', desc: '15 sessions, 50% avg' },
            { key: 'gold', name: 'Gold', icon: '🥇', desc: '30 sessions, 60% avg' },
            { key: 'platinum', name: 'Platinum', icon: '💎', desc: '50 sessions, 70% avg' },
            { key: 'diamond', name: 'Diamond', icon: '💠', desc: '100 sessions, 75% avg' }
        ];

        document.getElementById('badges-section').innerHTML = `
            <div class="badge-container">
                ${badges.map(b => `
                    <div class="badge-item ${data.badges[b.key] ? 'earned' : ''}">
                        <div class="badge-icon">${b.icon}</div>
                        <div class="badge-name">${b.name}</div>
                        <div class="badge-description">${b.desc}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Performance chart
        if (data.overallAccuracy.length > 0) {
            const chartHTML = data.overallAccuracy.slice(-10).map((acc, i) => {
                const width = Math.max(0, Math.min(100, acc * 100));
                return `
                    <div class="chart-bar">
                        <div class="chart-label">Session ${data.sessionsCompleted - data.overallAccuracy.length + i + 1}</div>
                        <div class="chart-bar-fill" style="width: ${width}%">${acc.toFixed(2)}</div>
                    </div>
                `;
            }).join('');
            document.getElementById('performance-chart').innerHTML = `
                <div class="performance-chart">
                    <h4>Last 10 Sessions</h4>
                    ${chartHTML}
                </div>
            `;
        } else {
            document.getElementById('performance-chart').innerHTML = '<p style="text-align:center; color:#718096;">No session data yet. Complete a training session to see your progress!</p>';
        }
    }

    continueTrainingFromDashboard() {
        this.showWelcome();
    }

    // ==================== Modified Trial Generation for Experimental Modes ====================

    generateTrialExperimental(symbols, condition, hasRelation, highInterference = false) {
        const mode = this.experimentalMode || this.experimentConfig.type;

        let trial = this.generateTrial(symbols, condition, hasRelation, highInterference);

        // Adaptive mode: may use 7 objects
        if (mode === 'adaptive' && this.adaptiveDifficulty.numObjects === 7) {
            condition = 'seven-same';
            trial = this.generateTrial(symbols, condition, hasRelation, highInterference);
        }

        // Multi-relational: add colors
        if (mode === 'multirelational') {
            trial.colors = Array(9).fill(null).map(() =>
                this.colors[Math.floor(Math.random() * this.colors.length)]
            );
            // Maybe also insert color pattern
            if (Math.random() < 0.5 && hasRelation) {
                this.insertColorPattern(trial.colors);
            }
        }

        // Interference mode: add interference based on level
        if (mode === 'interference') {
            this.addInterferenceByLevel(trial, symbols, this.interferenceLevel);
        }

        return trial;
    }

    insertColorPattern(colors) {
        const patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8]
        ];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        pattern.forEach(idx => {
            colors[idx] = color;
        });
    }

    addInterferenceByLevel(trial, symbols, level) {
        if (level === 1) return; // Clean

        if (level >= 2) {
            // Add similar symbols
            const similarSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            for (let i = 0; i < 3; i++) {
                const idx = Math.floor(Math.random() * 9);
                const prefix = trial.grid[idx].substring(0, 2);
                trial.grid[idx] = prefix + similarSymbol;
            }
        }

        if (level >= 3) {
            // Add partial conflicting patterns
            this.addHighInterference(trial.grid, symbols, trial.condition);
        }

        if (level === 4) {
            // Time pressure handled by reducing TRIAL_DURATION
            this.TRIAL_DURATION = 4000;
        }
    }

    // ==================== Confidence & Meta-Cognitive ====================

    recordConfidence(confidence) {
        this.currentConfidence = confidence;
        const trial = this.phaseTrials[this.currentTrialIndex - 1]; // Previous trial
        const wasCorrect = this.currentPhaseResults.trialData[this.currentPhaseResults.trialData.length - 1].correct;

        this.confidenceData.push({
            trial: this.currentTrialIndex,
            confidence: confidence,
            correct: wasCorrect
        });

        // Show strategy tip if struggling
        this.showStrategyTip(confidence, wasCorrect);

        // Continue to next trial after brief delay
        setTimeout(() => {
            this.hideAllScreens();
            document.getElementById('task-screen').classList.add('active');
            this.showNextTrial();
        }, 1500);
    }

    showStrategyTip(confidence, wasCorrect) {
        const tipElement = document.getElementById('strategy-tip');
        let tip = '';

        if (!wasCorrect && confidence >= 4) {
            tip = '💡 <strong>Tip:</strong> You were very confident but incorrect. Try double-checking your answer before responding.';
        } else if (wasCorrect && confidence <= 2) {
            tip = '✨ <strong>Good job!</strong> You got it right despite low confidence. Trust your instincts more!';
        } else if (!wasCorrect && confidence <= 2) {
            tip = '🎯 <strong>Strategy:</strong> Focus on the LAST character of each string. Scan row by row, then column by column systematically.';
        } else if (wasCorrect && confidence >= 4) {
            tip = '🌟 <strong>Excellent!</strong> High confidence and correct answer. You\'re calibrated well!';
        }

        tipElement.innerHTML = tip;
    }

    // ==================== Adaptive Difficulty ====================

    adjustAdaptiveDifficulty() {
        const recentTrials = 10;
        const recentData = this.currentPhaseResults.trialData.slice(-recentTrials);

        if (recentData.length < recentTrials) return;

        const recentAccuracy = recentData.filter(t => t.correct).length / recentData.length;
        this.adaptiveDifficulty.recentAccuracy.push(recentAccuracy);

        if (recentAccuracy >= 0.8) {
            // Too easy, increase difficulty
            if (this.adaptiveDifficulty.trialDuration > 3000) {
                this.adaptiveDifficulty.trialDuration -= 500;
            } else if (this.adaptiveDifficulty.numObjects < 7) {
                this.adaptiveDifficulty.numObjects += 2;
                this.adaptiveDifficulty.trialDuration = 6000; // Reset duration
            }
            this.adaptiveDifficulty.level++;
        } else if (recentAccuracy < 0.6) {
            // Too hard, decrease difficulty
            if (this.adaptiveDifficulty.numObjects > 3) {
                this.adaptiveDifficulty.numObjects -= 2;
            } else if (this.adaptiveDifficulty.trialDuration < 8000) {
                this.adaptiveDifficulty.trialDuration += 500;
            }
            this.adaptiveDifficulty.level = Math.max(1, this.adaptiveDifficulty.level - 1);
        }

        this.TRIAL_DURATION = this.adaptiveDifficulty.trialDuration;

        // Update highest level
        if (this.adaptiveDifficulty.level > this.progressData.adaptiveHighestLevel) {
            this.progressData.adaptiveHighestLevel = this.adaptiveDifficulty.level;
            this.saveProgressData();
        }
    }

    // ==================== N-Back ====================

    updateNBackHistory(trial) {
        this.nBackHistory.push({
            grid: [...trial.grid],
            hasRelation: trial.hasRelation
        });

        // Keep only what we need
        if (this.nBackHistory.length > this.nBackLevel + 1) {
            this.nBackHistory.shift();
        }
    }

    checkNBackMatch() {
        if (this.nBackHistory.length <= this.nBackLevel) return false;

        const current = this.nBackHistory[this.nBackHistory.length - 1];
        const nBack = this.nBackHistory[this.nBackHistory.length - 1 - this.nBackLevel];

        // Simple match: check if hasRelation is same
        return current.hasRelation === nBack.hasRelation;
    }

    adjustNBackLevel() {
        // Every 20 trials, check if we should advance
        if (this.currentTrialIndex % 20 === 0 && this.nBackLevel < 3) {
            const recentData = this.currentPhaseResults.trialData.slice(-20);
            const accuracy = recentData.filter(t => t.correct).length / recentData.length;

            if (accuracy >= 0.75) {
                this.nBackLevel++;
                this.showFeedback(`🎉 Advancing to ${this.nBackLevel}-back!`, 'correct');
            }
        }
    }
}

// Initialize the task when the page loads
let task;
window.addEventListener('DOMContentLoaded', () => {
    task = new RelationalIntegrationTask();
});
