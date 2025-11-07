# Relational Integration Trainer

A web-based cognitive training tool based on the research by Chuderski (2013) on relational integration and fluid reasoning.

## Overview

This application implements the **Relational Integration Task**, a cognitive assessment tool that measures the ability to bind mental representations into complex relational structures. Research has shown that performance on this task is one of the strongest predictors of fluid reasoning and general intelligence.

## Scientific Background

### What is Relational Integration?

Relational integration is the cognitive process that allows us to:
- Bind mental representations together
- Create temporary connections between pieces of information
- Integrate multiple bindings into complex relational structures
- Process abstract relationships independent of specific content

### Key Research Findings

Based on **Chuderski, A. (2013). The relational integration task explains fluid reasoning above and beyond other working memory tasks. Memory & Cognition, 42(3), 448-463.**

**Main Findings:**
1. **Strongest predictor of fluid intelligence**: The relational integration task predicted more variance in fluid reasoning than:
   - Complex span tasks
   - Short-term memory tasks
   - N-back tasks
   - Antisaccade (attention control) tasks

2. **Number of bindings matters**: Performance depends on how many temporary bindings must be constructed and integrated:
   - **Three-same/Five-same**: Only 2 bindings needed → Easier (avg accuracy ~0.73)
   - **Three-different**: 3 bindings needed → Moderate (avg accuracy ~0.38)
   - **Five-different**: 5-10 bindings needed → Hardest (avg accuracy ~0.18)

3. **Not just working memory**: The task predicts intelligence above and beyond:
   - Storage capacity (how many items you can hold)
   - Attention control (ability to focus and inhibit)
   - Processing speed

4. **Unique contribution**: Relational integration accounted for **5.9% unique variance** in fluid reasoning, more than any other working memory measure tested.

## The Task

### Task Structure

Participants view a 3×3 grid of three-character strings (e.g., "ABC" or "123") and must detect whether a specific pattern is present.

### Conditions

#### 1. Three-Same (2 bindings - Easier)
- **Rule**: Find three strings ending with the SAME letter/digit in one row or column
- **Example**: "XYA", "BCA", "DFA" in a row (all end with "A")
- **Bindings required**: 2 (incremental comparison possible)

#### 2. Five-Same (2 bindings - Easier)
- **Rule**: Find five strings ending with the SAME letter/digit in a cross or T pattern
- **Patterns**: Cross (center + 4 adjacent) or T-shape (4 rotations possible)
- **Bindings required**: 2 (same as three-same)

#### 3. Three-Different (3 bindings - Harder)
- **Rule**: Find three strings ending with three DIFFERENT letters/digits in one row or column
- **Example**: "XYA", "BCB", "DFC" in a row (endings: A, B, C - all different)
- **Bindings required**: 3 (each pair must be compared)

#### 4. Five-Different (5-10 bindings - Hardest)
- **Rule**: Find five strings ending with five DIFFERENT letters/digits in a cross or T pattern
- **Bindings required**: 5 (item-context) or 10 (item-item comparisons)

### Trial Structure

- **Duration**: 5.5 seconds per trial
- **Response**: Press SPACE when target pattern detected
- **No response**: Withhold response if pattern absent
- **Target ratio**: 50% of trials contain the target pattern
- **Training**: 5-10 practice trials before testing
- **Testing**: 20-60 test trials (40 standard)

## Features

### Core Functionality
- ✅ Four different task conditions
- ✅ Letter and number variants
- ✅ Configurable trial counts
- ✅ Training trials with feedback
- ✅ Precise timing (5.5s per trial)
- ✅ Visual timer display
- ✅ Keyboard response recording
- ✅ Reaction time measurement

### Results & Analysis
- ✅ Accuracy score (Hit Rate - False Alarm Rate)
- ✅ Hit rate and false alarm rate
- ✅ Misses and correct rejections
- ✅ Mean reaction time
- ✅ Performance interpretation
- ✅ Trial-by-trial data export (JSON)

### User Interface
- ✅ Clean, modern design
- ✅ Responsive layout
- ✅ Clear instructions for each condition
- ✅ Visual feedback during trials
- ✅ Comprehensive results display
- ✅ Downloadable results

## Usage

### Getting Started

1. **Open the application**
   ```bash
   # Simply open index.html in a web browser
   open index.html
   ```
   Or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Then visit http://localhost:8000
   ```

2. **Configure the task**
   - Select task type (Letters or Numbers)
   - Choose condition (difficulty level)
   - Set number of trials
   - Set training trials

3. **Read instructions**
   - Review the specific rules for your chosen condition
   - Understand the pattern you're looking for

4. **Complete the task**
   - Practice with training trials
   - Complete test trials
   - Focus on the last character of each string
   - Press SPACE only when you detect the target

5. **Review results**
   - Check your accuracy score
   - Compare to average performance
   - Download detailed results if needed

### Interpreting Results

**Accuracy Score** = Hit Rate - False Alarm Rate
- This is the primary measure used in the research
- Accounts for both hits and false alarms
- Range: -1.0 to 1.0 (higher is better)

**Expected Performance** (based on Chuderski, 2013):
- Three-same: ~0.73
- Five-same: ~0.73
- Three-different: ~0.38
- Five-different: ~0.18

**What affects performance:**
- ✅ Number of bindings (primary factor)
- ❌ NOT just number of objects
- ❌ NOT just interference/distractors
- ❌ NOT just attention span

## Technical Details

### File Structure
```
Relational-Integration-Trainer/
├── index.html          # Main HTML structure
├── styles.css          # Styling and layout
├── script.js           # Core task logic
└── README.md          # Documentation
```

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with animations
- **Vanilla JavaScript**: No dependencies
- **LocalStorage**: Session data (future feature)

### Browser Compatibility
- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile: ✅ Responsive design

## Research Applications

This tool can be used for:

1. **Cognitive Research**
   - Study individual differences in relational integration
   - Investigate working memory capacity
   - Examine fluid reasoning predictors

2. **Educational Assessment**
   - Measure relational thinking ability
   - Identify students with high reasoning potential
   - Track cognitive development

3. **Training Studies**
   - Working memory training research
   - Transfer effects to fluid intelligence
   - Cognitive intervention effectiveness

4. **Personal Development**
   - Practice relational reasoning
   - Understand your cognitive strengths
   - Track improvement over time

## Experimental Validity

This implementation follows the original study methodology:

### Experiment 1 & 2 Design
- ✅ 3×3 grid of three-character strings
- ✅ Four conditions varying bindings and objects
- ✅ 5.5 second trial duration
- ✅ Letter and number variants
- ✅ 50% target trials, 50% non-target
- ✅ Accuracy = Hits - False Alarms

### Experiment 3 Extensions
- ✅ Multiple conditions per participant possible
- ✅ Configurable trial counts (20-60)
- ✅ Training trials before testing
- ✅ Reaction time recording
- ✅ Trial-by-trial data export

## Data Export

Results are exported in JSON format containing:
```json
{
  "config": {
    "taskType": "letter",
    "condition": "three-different",
    "numTrials": 40,
    "trainingTrials": 5
  },
  "summary": {
    "accuracy": 0.38,
    "hits": 15,
    "misses": 5,
    "falseAlarms": 3,
    "correctRejections": 17,
    "meanRT": 2345.67
  },
  "trialData": [
    {
      "trialNumber": 1,
      "isTraining": true,
      "hasRelation": true,
      "responded": true,
      "correct": true,
      "reactionTime": 2156
    }
    // ... more trials
  ],
  "timestamp": "2025-11-06T12:00:00.000Z"
}
```

## Limitations

1. **Not a diagnostic tool**: This is for research/educational purposes only
2. **Practice effects**: Repeated testing may improve performance
3. **Screen differences**: Display size/quality may affect difficulty
4. **Self-administered**: No experimenter control over conditions
5. **Simplified scoring**: Full psychometric analysis requires specialized software

## Future Enhancements

Potential additions:
- [ ] Adaptive difficulty adjustment
- [ ] Progress tracking across sessions
- [ ] Comparison to normative data
- [ ] Additional pattern types
- [ ] Eye-tracking integration
- [ ] Multi-session studies
- [ ] Group administration tools
- [ ] Advanced statistical analysis

## Citation

If you use this tool in research, please cite:

**Original Study:**
```
Chuderski, A. (2013). The relational integration task explains fluid
reasoning above and beyond other working memory tasks. Memory & Cognition,
42(3), 448-463. https://doi.org/10.3758/s13421-013-0366-x
```

**This Implementation:**
```
Relational Integration Trainer [Computer software]. (2025).
Retrieved from https://github.com/[your-repo]
```

## License

This is an educational and research tool based on published scientific research. The implementation is provided as-is for non-commercial use.

## References

1. Chuderski, A. (2013). The relational integration task explains fluid reasoning above and beyond other working memory tasks. *Memory & Cognition*, 42(3), 448-463.

2. Oberauer, K., Süß, H. M., Wilhelm, O., & Wittmann, W. W. (2008). Which working memory functions predict intelligence? *Intelligence*, 36(6), 641-652.

3. Halford, G. S., Wilson, W. H., & Phillips, S. (1998). Processing capacity defined by relational complexity: Implications for comparative, developmental, and cognitive psychology. *Behavioral and Brain Sciences*, 21(6), 803-864.

4. Hummel, J. E., & Holyoak, K. J. (2003). A symbolic-connectionist theory of relational inference and generalization. *Psychological Review*, 110(2), 220-264.

## Contact & Contributions

For issues, suggestions, or contributions, please visit the project repository.

---

**Disclaimer**: This tool is for educational and research purposes only. It is not a clinical diagnostic instrument. Performance on this task should be interpreted within the context of appropriate research methodology and ethical guidelines.
