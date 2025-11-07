# Relational Integration Task - Exact Replication

**A faithful implementation of Chuderski (2013)'s groundbreaking study on relational integration and fluid reasoning.**

> Chuderski, A. (2013). The relational integration task explains fluid reasoning above and beyond other working memory tasks. *Memory & Cognition, 42*(3), 448-463. https://doi.org/10.3758/s13421-013-0366-x

## Overview

This web application provides an **exact replication** of all three experiments from Chuderski (2013)'s seminal study on relational integration - the cognitive process shown to be the strongest predictor of fluid intelligence among all working memory measures.

### Why This Matters

This study fundamentally changed our understanding of the relationship between working memory and intelligence by showing that:
- **Relational integration** (binding representations into structures) predicts fluid IQ better than storage capacity or attention control
- Performance depends on the **number of bindings** required, not the number of objects or amount of interference
- The relational integration task explains **5.9% unique variance** in fluid reasoning - more than any other WM measure

## ✅ Exact Replication Features

This implementation faithfully replicates every detail from the original study:

### Core Task Elements
- ✅ 3×3 grid of three-character strings
- ✅ 10 consonants (B, C, D, F, G, H, J, K, L, M) for letter trials
- ✅ 10 digits (0-9) for number trials
- ✅ Exactly 5.5 seconds per trial
- ✅ 0.1 second blink between trials
- ✅ **Trial persistence**: 1-4 strings carry over from previous trial
- ✅ Focus on last character of each string
- ✅ Space bar response
- ✅ 50% relation trials, 50% no-relation trials
- ✅ Accuracy scoring: Hit Rate - False Alarm Rate

### Pattern Detection Rules
- ✅ **Three-Same**: 3 identical endings in row/column (NO diagonals)
- ✅ **Five-Same**: 5 identical endings in cross or T pattern
- ✅ **Three-Different**: 3 different endings in row/column (NO diagonals)
- ✅ **Five-Different**: 5 different endings in cross or T pattern

### Experiment 1: Between-Subjects (N=112 in study)
**Purpose**: Test if bindings (not objects) determine difficulty

**Protocol**:
- Participant chooses ONE condition
- 5 training trials (letters only)
- 50 letter test trials
- 50 number test trials (no training)

**Expected Results**:
- Three-Same: 0.73 accuracy (2 bindings)
- Five-Same: 0.73 accuracy (2 bindings)
- Three-Different: 0.38 accuracy (3 bindings)
- Five-Different: 0.18 accuracy (5-10 bindings)

**Key Finding**: Same vs. different endings matter; number of objects doesn't (when bindings are equal).

### Experiment 2: Within-Subjects + Interference (N=40 in study)
**Purpose**: Test interference effects on performance

**Protocol**:
- Both Three-Same AND Five-Same conditions (randomized order)
- 10 training trials per condition (numbers only)
- 60 number test trials per condition
- 60 letter test trials per condition
- 50% low-interference, 50% high-interference trials

**Expected Results**:
- No significant effect of interference (low: 76%, high: 77%)
- Three-Same ≈ Five-Same (both ~73%)

**Key Finding**: Relational integration depends on binding processes, not interference resolution.

### Experiment 3: Multiple Conditions (N=243 in study)
**Purpose**: Compare predictive power for fluid reasoning

**Protocol**:
- Three conditions: Three-Same, Five-Same, Three-Different
- Three-Same always first, others randomized
- 40 number trials per condition (always first)
- 40 letter trials per condition (always second)
- NO training trials (to save time in long session)

**Expected Results**:
- All three conditions strongly predict fluid IQ (r ≈ .43-.48)
- No significant differences between conditions
- Relational integration > complex span > STM > n-back > antisaccade

**Key Finding**: Relational integration capacity is THE fundamental predictor of fluid reasoning.

## Quick Start

### Basic Usage

1. **Open the application**
   ```bash
   # Option 1: Direct file open
   open index.html

   # Option 2: Local server (recommended)
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

2. **Select an experiment** to replicate

3. **Follow the protocol** exactly as specified

4. **View results** with comparison to study findings

5. **Download data** in JSON format for analysis

### For Researchers

If you're conducting a formal replication study:

1. Use **Experiment 1** for between-subjects design (fastest, 1 condition, ~10 min)
2. Use **Experiment 2** for within-subjects + interference testing (~25 min)
3. Use **Experiment 3** for comparing conditions as Gf predictors (~25 min)

## Implementation Details

### Exact Technical Specifications

#### Trial Persistence (Critical Detail)
The study states: *"1-4 strings in each subsequent array were the same as in the preceding array"*

**Our Implementation**:
- After first trial, randomly select 1-4 positions
- Copy those strings from previous grid to current grid
- This reduces visual processing load between trials

#### Sequence Details

**Experiment 1**:
```
Training (Letters): 5 trials
Test (Letters): 50 trials
Test (Numbers): 50 trials (NO training)
```

**Experiment 2**:
```
Condition 1 (randomized three-same or five-same):
  Training (Numbers): 10 trials
  Test (Numbers): 60 trials
  Test (Letters): 60 trials

Condition 2 (the other condition):
  Training (Numbers): 10 trials
  Test (Numbers): 60 trials
  Test (Letters): 60 trials
```

**Experiment 3**:
```
Three-Same (always first):
  Test (Numbers): 40 trials
  Test (Letters): 40 trials

Condition 2 (randomized five-same or three-different):
  Test (Numbers): 40 trials
  Test (Letters): 40 trials

Condition 3 (the other condition):
  Test (Numbers): 40 trials
  Test (Letters): 40 trials
```

#### Pattern Definitions

**Rows (indices)**: [0,1,2], [3,4,5], [6,7,8]
**Columns (indices)**: [0,3,6], [1,4,7], [2,5,8]
**NO DIAGONALS** for three-object conditions

**Cross pattern**: [1,3,4,5,7] (center + 4 adjacent)
**T patterns**:
- T up: [0,1,2,4,7]
- T down: [1,3,4,5,6]
- T left: [0,3,4,6,7]
- T right: [1,2,4,5,8]

Grid layout:
```
[0] [1] [2]
[3] [4] [5]
[6] [7] [8]
```

#### High Interference (Experiment 2 Only)
In high-interference trials, 12 identical stimuli are present besides the target pattern elements (but don't form a valid relation). This is automatically handled in Experiment 2.

## Data Export Format

Results are exported as JSON with complete trial-by-trial data:

```json
{
  "experiment": "experiment1",
  "timestamp": "2025-11-07T...",
  "configuration": {
    "type": "experiment1",
    "condition": "three-different",
    "phases": [...]
  },
  "allResults": [
    {
      "phase": "test",
      "taskType": "letter",
      "condition": "three-different",
      "results": {
        "hits": 20,
        "misses": 5,
        "falseAlarms": 3,
        "correctRejections": 22,
        "reactionTimes": [2145, 1987, ...],
        "trialData": [
          {
            "trialNumber": 1,
            "phase": "test",
            "taskType": "letter",
            "condition": "three-different",
            "hasRelation": true,
            "highInterference": false,
            "responded": true,
            "correct": true,
            "reactionTime": 2145
          },
          ...
        ]
      }
    }
  ],
  "summary": {
    "three-different_letter": {
      "accuracy": 0.378,
      "hits": 20,
      "misses": 5,
      "falseAlarms": 3,
      "correctRejections": 22,
      "meanRT": 2234.5
    }
  }
}
```

## Scientific Background

### What is Relational Integration?

Relational integration is the cognitive process of binding mental representations and integrating them into complex relational structures. Unlike:
- **Storage capacity**: How many items you can hold
- **Attention control**: How well you can focus
- **Processing speed**: How fast you process

Relational integration measures:
- **Binding construction**: Creating temporary links between representations
- **Binding maintenance**: Keeping multiple bindings active
- **Binding integration**: Combining bindings into structured wholes

### The Binding Hypothesis

**Why does three-different require more bindings than three-same?**

**Three-Same** (e.g., X, X, X):
- Compare first and second → "both X" → Bind [position1-position2, value X]
- Compare third to binding → "also X" → Extend binding
- **Total: 2 bindings** (incremental comparison possible)

**Three-Different** (e.g., X, Y, Z):
- X vs Y → "different" → Bind [pos1-pos2, different]
- Y vs Z → "different" → Bind [pos2-pos3, different]
- X vs Z → "different" → Bind [pos1-pos3, different]
- **Total: 3 bindings** (all pairs must be compared)

**Five-Different** (e.g., V, W, X, Y, Z in cross pattern):
- All pairwise comparisons: 10 item-item bindings
- OR: 5 item-context bindings (binding each to its role in the pattern)
- **Total: 5-10 bindings** (dramatically exceeds WM capacity)

### Key Findings Summary

| Measure | Unique Variance in Fluid IQ |
|---------|---------------------------|
| **Relational Integration** | **5.9%** ⭐ |
| Complex Span | 2.9% |
| STM Span | 0.4% |
| Antisaccade | 0.2% |
| N-back | ~0% |

**Shared variance** (all 4 measures + relational integration): 24.4%

### Implications

1. **For Intelligence Research**: Relational integration is a fundamental cognitive primitive that underlies fluid reasoning more than storage or control.

2. **For WM Theory**: Standard WM tasks (spans, n-back) may work because they require binding, not just storage.

3. **For Training**: If transfer to Gf is possible, training relational integration (not just memory span) may be most effective.

4. **For Assessment**: This task could be a more direct measure of reasoning potential than traditional WM tests.

## Validation

### How to Know It's Working

**Expected Pattern of Results**:
1. Three-same ≈ Five-same ≈ 0.73 (similar despite more objects)
2. Three-different ≈ 0.38 (harder despite fewer objects)
3. Five-different ≈ 0.18 (floor effect)
4. No effect of interference in Exp. 2
5. All conditions in Exp. 3 should feel effortful but doable

### Common Issues

**Too easy?**
- Check you're responding only to exact patterns (rows/columns for 3-object, cross/T for 5-object)
- Make sure you're checking the LAST character only
- Are you seeing the full 5.5 seconds?

**Too hard?**
- Make sure you understand the specific pattern for your condition
- Start with training trials
- Three-same is easiest - try that first

## Use Cases

### 1. Research Replication
- Formal replication studies
- Cross-cultural validation
- Developmental studies
- Clinical populations

### 2. Educational Assessment
- Identifying high-reasoning students
- Tracking cognitive development
- Research on learning

### 3. Personal Cognitive Assessment
- Understand your relational thinking capacity
- Track improvement with practice
- Compare to research norms

### 4. Training Studies (Experimental)
- Test if relational integration training transfers to Gf
- Compare to other WM training paradigms
- Longitudinal tracking

## Limitations & Cautions

### This is NOT:
- ❌ A diagnostic tool
- ❌ An IQ test
- ❌ A validated training program
- ❌ A substitute for professional assessment

### This IS:
- ✅ An exact research replication tool
- ✅ An educational demonstration
- ✅ A valid measure of relational integration capacity
- ✅ A platform for further research

### Known Limitations

1. **Self-administered**: No experimenter control
2. **Screen variations**: Display differences may affect difficulty
3. **Practice effects**: Repeated testing invalidates comparisons
4. **No norms**: We don't provide percentile rankings
5. **Interference approximation**: Exp. 2 high-interference is simplified

## Technical Details

### Browser Compatibility
- Chrome/Edge: ✅ Fully tested
- Firefox: ✅ Fully tested
- Safari: ✅ Compatible
- Mobile: ✅ **Now fully supported!**
  - Touch-optimized response button
  - Responsive layout for phones and tablets
  - Desktop: Press SPACE bar
  - Mobile: Tap the response button
  - Note: Desktop recommended for formal research due to standardization

### No Dependencies
- Pure HTML5/CSS3/JavaScript
- No external libraries
- No server required
- Runs completely offline

### File Structure
```
Relational-Integration-Trainer/
├── index.html       # Application structure
├── styles.css       # Styling
├── script.js        # Task logic (exact replication)
├── README.md        # This file
├── LICENSE          # MIT License
└── .gitignore       # Git configuration
```

## Citation

### Original Study
```bibtex
@article{chuderski2013relational,
  title={The relational integration task explains fluid reasoning above and beyond other working memory tasks},
  author={Chuderski, Adam},
  journal={Memory \& Cognition},
  volume={42},
  number={3},
  pages={448--463},
  year={2014},
  publisher={Springer},
  doi={10.3758/s13421-013-0366-x}
}
```

### This Implementation
If you use this tool in research, please cite both the original study and this implementation:

```bibtex
@software{relational_integration_trainer,
  title={Relational Integration Task: Exact Replication},
  author={[Your Name/Institution]},
  year={2025},
  url={https://github.com/[your-repo]/Relational-Integration-Trainer}
}
```

## Related Research

Key papers on relational integration and fluid reasoning:

1. **Oberauer et al. (2008)** - Which working memory functions predict intelligence? *Intelligence*, 36(6), 641-652.

2. **Halford et al. (1998)** - Processing capacity defined by relational complexity. *Behavioral and Brain Sciences*, 21(6), 803-864.

3. **Hummel & Holyoak (2003)** - A symbolic-connectionist theory of relational inference. *Psychological Review*, 110(2), 220-264.

4. **Wilhelm et al. (2013)** - What is working memory, and how can we measure it? *Frontiers in Psychology*, 4, 433.

## Contributing

Found an issue or have suggestions? Please open an issue on GitHub.

**Before reporting bugs**, please verify:
1. You're using a modern browser (Chrome/Firefox/Safari latest version)
2. JavaScript is enabled
3. You've tested on desktop (not mobile)
4. You've tried a fresh browser session

## License

MIT License - see LICENSE file for details.

This is an educational and research tool based on published scientific research.

## Acknowledgments

- **Adam Chuderski** for the original research
- **Klaus Oberauer** and colleagues for theoretical foundations
- All participants in the original studies

## Support & Contact

For questions about:
- **The task**: See paper or open GitHub issue
- **Research use**: Cite appropriately and follow ethical guidelines
- **Technical issues**: Open GitHub issue with browser/OS details
- **Collaboration**: Contact via GitHub

---

**Disclaimer**: This tool is for educational and research purposes only. It is not a clinical diagnostic instrument. Performance should be interpreted within appropriate research methodology and ethical guidelines. The authors make no claims about training efficacy or clinical utility.

**Last Updated**: November 2025
**Version**: 2.0.0 (Exact Replication)
