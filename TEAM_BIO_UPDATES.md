# Team Page Bio Updates — Claude Code Spec

Read `ARCHITECTURE.md` before starting. Edit only source files in `_src/`.
Run `python3 build.py` after completing all edits. Never edit root-level HTML.

---

## Update 1: Daniel Fox bio — team/content.yaml

**File:** `_src/pages/team/content.yaml`

**old_string:**
```
p_2: Background in music theory and performance, with formal design education and previous experience building and operating companies. Currently studying retail operations at the intersection of environmental psychology and commercial outcomes. Built Entuned to close the gap between what plays in a store and what customers actually do.
```

**new_string:**
```
p_2: Daniel bootstrapped Skreened to eight-figure annual revenue in six years: 180 employees, multiple production facilities, and dual recognition in 2013 as one of Ohio's fastest-growing and best places to work. After exiting, he returned to a long-standing interest in the technical language of music, the mechanics of why specific parameters produce specific responses in people. Entuned is where those two things meet. Denver, CO.
```

---

## Update 2: Add Mrinmayi Katti — team/content.yaml

**File:** `_src/pages/team/content.yaml`

Add these entries after the existing Daniel Fox block:

```
card_title_6: Mrinmayi Katti
card_subtitle_6: Data Scientist
p_8: Mrinmayi builds the infrastructure that makes data credible. At Loxo, she designed distributed migration workflows processing 200K+ records per run at 99%+ integrity, integrated seven external data systems, and shipped containerized pipelines on Kubernetes for production-grade reliability. Her internship at Reliance Jio put her inside A/B testing infrastructure at scale, where her pipelines contributed to an 18% retention lift. At Entuned, she owns the measurement layer connecting behavioral and environmental signals to verified commercial outcomes. B.S. Data Science, NJIT, 3.8 GPA. Dean's List. Merit Scholar.
```

---

## Update 3: Wire Katti card into template

Check the existing card markup in `_src/pages/team/sections/` and wire `card_title_6`, `card_subtitle_6`, and `p_8` into the template following the same pattern used for Daniel's card. Match the component structure exactly before adding markup.

---

## Smoke test

After build, verify:
- `team.html` renders both bios without truncation
- Katti card matches Daniel card layout
- No leftover placeholder text from old `p_2`
