// Runnable, auto-graded "implement it from scratch" coding exercises for the
// GenAI Systems Lab. Each runs in-browser via Pyodide (numpy available).
// Grading contract: the runner executes `userCode + "\n\n" + tests`.
// Success == no exception raised. Each `tests` block passes against `solution`
// and fails against `starter`.

export const CODE_EXERCISES_LIST = [
  {
    id: "softmax",
    title: "Numerically stable softmax",
    topic: "Sampling",
    difficulty: "intro",
    prompt:
      "Implement `softmax(x)` where `x` is a 1-D or 2-D numpy array.\n\n" +
      "For a **2-D** input, treat each **row** as an independent logit vector and normalize along `axis=1`. For a **1-D** input, normalize the whole vector.\n\n" +
      "Return a numpy array of the **same shape** as `x` whose values are non-negative and sum to `1` along the normalization axis.\n\n" +
      "**Constraint:** subtract the per-row `max` before exponentiating so large logits (e.g. `1000`) do not overflow. Do not use any softmax from a library.",
    starter:
      "import numpy as np\n\n" +
      "def softmax(x):\n" +
      "    # TODO: return the numerically stable softmax of x.\n" +
      "    # 2-D: normalize each row (axis=1). 1-D: normalize the whole vector.\n" +
      "    raise NotImplementedError\n",
    solution:
      "import numpy as np\n\n" +
      "def softmax(x):\n" +
      "    x = np.asarray(x, dtype=float)\n" +
      "    if x.ndim == 1:\n" +
      "        z = x - np.max(x)\n" +
      "        e = np.exp(z)\n" +
      "        return e / np.sum(e)\n" +
      "    z = x - np.max(x, axis=1, keepdims=True)\n" +
      "    e = np.exp(z)\n" +
      "    return e / np.sum(e, axis=1, keepdims=True)\n",
    tests:
      "import numpy as np\n\n" +
      "# 1-D sums to 1\n" +
      "v = softmax(np.array([1.0, 2.0, 3.0]))\n" +
      "assert v.shape == (3,), 'shape must be preserved for 1-D input'\n" +
      "assert np.isclose(np.sum(v), 1.0), '1-D softmax must sum to 1'\n" +
      "expected = np.array([0.09003057, 0.24472847, 0.66524096])\n" +
      "assert np.allclose(v, expected, atol=1e-6), 'known 1-D value mismatch'\n\n" +
      "# equal logits -> uniform\n" +
      "u = softmax(np.array([5.0, 5.0, 5.0, 5.0]))\n" +
      "assert np.allclose(u, 0.25), 'equal logits must give a uniform distribution'\n\n" +
      "# 2-D normalizes per row\n" +
      "m = softmax(np.array([[1.0, 2.0, 3.0], [1.0, 1.0, 1.0]]))\n" +
      "assert m.shape == (2, 3), 'shape must be preserved for 2-D input'\n" +
      "assert np.allclose(np.sum(m, axis=1), 1.0), 'each row must sum to 1'\n" +
      "assert np.allclose(m[1], 1.0 / 3.0), 'row of equal logits must be uniform'\n\n" +
      "# numerical stability: huge logits must not overflow to nan/inf\n" +
      "big = softmax(np.array([1000.0, 1001.0, 1002.0]))\n" +
      "assert np.all(np.isfinite(big)), 'large logits overflowed; subtract the max'\n" +
      "assert np.isclose(np.sum(big), 1.0), 'stable softmax must still sum to 1'\n",
    packages: ["numpy"],
    hints: [
      "softmax(x)_i = exp(x_i) / sum_j exp(x_j). The result is invariant to subtracting any constant from every element.",
      "Subtract the per-row maximum before calling np.exp so the largest exponent is exp(0)=1 and nothing overflows.",
      "For 2-D input use np.max(..., axis=1, keepdims=True) and np.sum(..., axis=1, keepdims=True) so broadcasting divides each row correctly.",
    ],
  },

  {
    id: "cross-entropy",
    title: "Cross-entropy loss",
    topic: "Evaluation",
    difficulty: "intro",
    prompt:
      "Implement `cross_entropy(probs, labels)`.\n\n" +
      "`probs` is a 2-D numpy array of shape `(N, C)` where each row is a **predicted probability distribution** over `C` classes. `labels` is a 1-D integer numpy array of length `N` giving the **true class index** for each row.\n\n" +
      "Return the **mean** negative log-likelihood: `-(1/N) * sum_i log(probs[i, labels[i]])`.\n\n" +
      "**Constraint:** clip probabilities into `[1e-12, 1.0]` before taking the log so a predicted probability of `0` does not produce `-inf`. Return a Python/numpy float.",
    starter:
      "import numpy as np\n\n" +
      "def cross_entropy(probs, labels):\n" +
      "    # TODO: return the mean negative log-likelihood of the true classes.\n" +
      "    return None\n",
    solution:
      "import numpy as np\n\n" +
      "def cross_entropy(probs, labels):\n" +
      "    probs = np.asarray(probs, dtype=float)\n" +
      "    labels = np.asarray(labels, dtype=int)\n" +
      "    n = probs.shape[0]\n" +
      "    p = np.clip(probs[np.arange(n), labels], 1e-12, 1.0)\n" +
      "    return float(-np.mean(np.log(p)))\n",
    tests:
      "import numpy as np\n\n" +
      "# perfect confident predictions -> ~0 loss\n" +
      "p = np.array([[1.0, 0.0], [0.0, 1.0]])\n" +
      "y = np.array([0, 1])\n" +
      "assert np.isclose(cross_entropy(p, y), 0.0, atol=1e-6), 'perfect predictions should give ~0 loss'\n\n" +
      "# known value: two rows, true-class probs 0.7 and 0.4\n" +
      "p2 = np.array([[0.7, 0.3], [0.6, 0.4]])\n" +
      "y2 = np.array([0, 1])\n" +
      "expected = -(np.log(0.7) + np.log(0.4)) / 2.0\n" +
      "assert np.isclose(cross_entropy(p2, y2), expected, atol=1e-9), 'known cross-entropy value mismatch'\n\n" +
      "# a zero probability on the true class must be clipped, not -inf\n" +
      "p3 = np.array([[0.0, 1.0]])\n" +
      "y3 = np.array([0])\n" +
      "loss = cross_entropy(p3, y3)\n" +
      "assert np.isfinite(loss), 'zero true-class probability must be clipped, not -inf'\n" +
      "assert loss > 10.0, 'clipped zero should give a large but finite loss'\n\n" +
      "# it must be the MEAN, not the sum\n" +
      "p4 = np.array([[0.5, 0.5], [0.5, 0.5], [0.5, 0.5], [0.5, 0.5]])\n" +
      "y4 = np.array([0, 0, 0, 0])\n" +
      "assert np.isclose(cross_entropy(p4, y4), -np.log(0.5), atol=1e-9), 'result must be averaged over N rows'\n",
    packages: ["numpy"],
    hints: [
      "Only the probability assigned to the TRUE class of each row matters: pick probs[i, labels[i]] for every row.",
      "Use advanced indexing probs[np.arange(N), labels] to gather one entry per row in a single vectorized step.",
      "Clip with np.clip(p, 1e-12, 1.0) before np.log, then return the mean of -log(p) over all N rows.",
    ],
  },

  {
    id: "scaled-dot-product-attention",
    title: "Scaled dot-product attention",
    topic: "Attention",
    difficulty: "core",
    prompt:
      "Implement `attention(Q, K, V)` for a **single head**.\n\n" +
      "`Q` has shape `(Lq, d)`, `K` has shape `(Lk, d)`, `V` has shape `(Lk, dv)`.\n\n" +
      "Compute `scores = Q @ K.T / sqrt(d)`, apply a **row-wise softmax** to `scores` (shape `(Lq, Lk)`) to get attention weights, then return `weights @ V` with shape `(Lq, dv)`.\n\n" +
      "**Constraints:** scale by `sqrt(d)` where `d` is the key/query dimension; the softmax must be numerically stable (subtract the per-row max); do not use any attention/softmax helper from a library.",
    starter:
      "import numpy as np\n\n" +
      "def attention(Q, K, V):\n" +
      "    # TODO: return softmax(Q @ K.T / sqrt(d)) @ V\n" +
      "    raise NotImplementedError\n",
    solution:
      "import numpy as np\n\n" +
      "def attention(Q, K, V):\n" +
      "    Q = np.asarray(Q, dtype=float)\n" +
      "    K = np.asarray(K, dtype=float)\n" +
      "    V = np.asarray(V, dtype=float)\n" +
      "    d = Q.shape[-1]\n" +
      "    scores = Q @ K.T / np.sqrt(d)\n" +
      "    scores = scores - np.max(scores, axis=1, keepdims=True)\n" +
      "    w = np.exp(scores)\n" +
      "    w = w / np.sum(w, axis=1, keepdims=True)\n" +
      "    return w @ V\n",
    tests:
      "import numpy as np\n\n" +
      "# output shape is (Lq, dv)\n" +
      "Q = np.random.RandomState(0).randn(3, 4)\n" +
      "K = np.random.RandomState(1).randn(5, 4)\n" +
      "V = np.random.RandomState(2).randn(5, 6)\n" +
      "out = attention(Q, K, V)\n" +
      "assert out.shape == (3, 6), 'output shape must be (Lq, dv)'\n\n" +
      "# when all keys are identical, weights are uniform -> output is the mean of V\n" +
      "Qz = np.zeros((1, 2))\n" +
      "Kz = np.zeros((3, 2))\n" +
      "Vz = np.array([[1.0, 0.0], [3.0, 0.0], [5.0, 0.0]])\n" +
      "out2 = attention(Qz, Kz, Vz)\n" +
      "assert np.allclose(out2, np.array([[3.0, 0.0]])), 'uniform attention must average the value rows'\n\n" +
      "# known small case with explicit scaling by sqrt(d)\n" +
      "Qa = np.array([[1.0, 0.0]])\n" +
      "Ka = np.array([[1.0, 0.0], [0.0, 1.0]])\n" +
      "Va = np.array([[10.0], [20.0]])\n" +
      "d = 2.0\n" +
      "s = np.array([1.0, 0.0]) / np.sqrt(d)\n" +
      "e = np.exp(s - s.max())\n" +
      "w = e / e.sum()\n" +
      "expected = np.array([[w[0] * 10.0 + w[1] * 20.0]])\n" +
      "assert np.allclose(attention(Qa, Ka, Va), expected, atol=1e-9), 'known attention value mismatch (check sqrt(d) scaling)'\n\n" +
      "# the output is a convex combination of the value rows, so it stays within their range\n" +
      "assert out2[0, 0] >= Vz[:, 0].min() - 1e-9 and out2[0, 0] <= Vz[:, 0].max() + 1e-9, 'output must lie within the value range'\n",
    packages: ["numpy"],
    hints: [
      "The three steps are: score = Q @ K.T, scale by 1/sqrt(d), row-wise softmax, then multiply by V.",
      "d is the last-axis size of Q (and K), i.e. Q.shape[-1]. Divide the scores by np.sqrt(d) before the softmax.",
      "Softmax over axis=1 of the (Lq, Lk) score matrix; subtract np.max(scores, axis=1, keepdims=True) first for stability.",
    ],
  },

  {
    id: "cosine-topk-retrieval",
    title: "Cosine top-k retrieval",
    topic: "Retrieval",
    difficulty: "core",
    prompt:
      "Implement `topk_cosine(query, docs, k)`.\n\n" +
      "`query` is a 1-D numpy vector of length `d`. `docs` is a 2-D numpy array of shape `(N, d)`, one document embedding per row. `k` is a positive integer.\n\n" +
      "Return a **numpy array of the `k` document row-indices** with the highest **cosine similarity** to `query`, ordered from **most** to **least** similar. Break ties by lower index.\n\n" +
      "**Constraints:** cosine similarity is `(a . b) / (||a|| * ||b||)`. If `k` exceeds `N`, return all `N` indices in ranked order. Assume no zero-norm vectors.",
    starter:
      "import numpy as np\n\n" +
      "def topk_cosine(query, docs, k):\n" +
      "    # TODO: return the indices of the top-k docs by cosine similarity,\n" +
      "    # ordered most-similar first.\n" +
      "    return None\n",
    solution:
      "import numpy as np\n\n" +
      "def topk_cosine(query, docs, k):\n" +
      "    query = np.asarray(query, dtype=float)\n" +
      "    docs = np.asarray(docs, dtype=float)\n" +
      "    qn = query / np.linalg.norm(query)\n" +
      "    dn = docs / np.linalg.norm(docs, axis=1, keepdims=True)\n" +
      "    sims = dn @ qn\n" +
      "    k = min(k, docs.shape[0])\n" +
      "    # stable sort by -sim keeps lower index first on ties\n" +
      "    order = np.argsort(-sims, kind='stable')\n" +
      "    return order[:k]\n",
    tests:
      "import numpy as np\n\n" +
      "q = np.array([1.0, 0.0])\n" +
      "docs = np.array([\n" +
      "    [1.0, 0.0],    # identical direction -> sim 1.0\n" +
      "    [0.0, 1.0],    # orthogonal -> sim 0.0\n" +
      "    [2.0, 0.0],    # same direction, magnitude ignored -> sim 1.0\n" +
      "    [1.0, 1.0],    # 45 degrees -> sim ~0.707\n" +
      "    [-1.0, 0.0],   # opposite -> sim -1.0\n" +
      "])\n\n" +
      "idx = topk_cosine(q, docs, 3)\n" +
      "assert isinstance(idx, np.ndarray), 'return a numpy array of indices'\n" +
      "assert list(idx) == [0, 2, 3], 'top-3 must be the two sim=1 rows (lower index first) then the 45-degree row'\n\n" +
      "# magnitude must not matter: row 2 ties row 0 at sim 1.0\n" +
      "top2 = topk_cosine(q, docs, 2)\n" +
      "assert set(top2.tolist()) == {0, 2}, 'cosine ignores magnitude; both unit-x rows rank first'\n\n" +
      "# k larger than N returns a full ranking\n" +
      "allidx = topk_cosine(q, docs, 99)\n" +
      "assert list(allidx) == [0, 2, 3, 1, 4], 'k>N should return all indices fully ranked most-similar first'\n",
    packages: ["numpy"],
    hints: [
      "Cosine similarity ranks by direction, not magnitude: normalize the query and every document to unit length first.",
      "After normalizing, a single matrix-vector product docs_normalized @ query_normalized gives all N similarities at once.",
      "Sort descending with np.argsort(-sims, kind='stable') so ties keep the lower original index, then slice the first min(k, N).",
    ],
  },

  {
    id: "bpe-merge-step",
    title: "One BPE merge step",
    topic: "Tokenization",
    difficulty: "core",
    prompt:
      "Implement `bpe_merge_step(tokens)` performing a **single** Byte-Pair-Encoding merge.\n\n" +
      "`tokens` is a Python list of string symbols (e.g. `['l','o','w','e','r','l','o','w']`).\n\n" +
      "1. Count every **adjacent pair** `(tokens[i], tokens[i+1])`.\n" +
      "2. Find the **most frequent** pair. Break ties by the pair that appears **earliest** (leftmost first occurrence).\n" +
      "3. Merge **all non-overlapping left-to-right occurrences** of that pair into a single concatenated symbol, and return the new token list.\n\n" +
      "If `tokens` has fewer than 2 elements, return it unchanged. Scan left-to-right so overlapping matches consume greedily (e.g. `['a','a','a']` merging `('a','a')` gives `['aa','a']`).",
    starter:
      "def bpe_merge_step(tokens):\n" +
      "    # TODO: find the most frequent adjacent pair and merge all its\n" +
      "    # occurrences into single concatenated symbols.\n" +
      "    raise NotImplementedError\n",
    solution:
      "def bpe_merge_step(tokens):\n" +
      "    if len(tokens) < 2:\n" +
      "        return list(tokens)\n" +
      "    counts = {}\n" +
      "    order = {}\n" +
      "    for i in range(len(tokens) - 1):\n" +
      "        pair = (tokens[i], tokens[i + 1])\n" +
      "        counts[pair] = counts.get(pair, 0) + 1\n" +
      "        if pair not in order:\n" +
      "            order[pair] = i\n" +
      "    # most frequent, tie-break by earliest first occurrence\n" +
      "    best = min(counts, key=lambda p: (-counts[p], order[p]))\n" +
      "    a, b = best\n" +
      "    out = []\n" +
      "    i = 0\n" +
      "    while i < len(tokens):\n" +
      "        if i < len(tokens) - 1 and tokens[i] == a and tokens[i + 1] == b:\n" +
      "            out.append(a + b)\n" +
      "            i += 2\n" +
      "        else:\n" +
      "            out.append(tokens[i])\n" +
      "            i += 1\n" +
      "    return out\n",
    tests:
      "# classic 'lower' example: ('l','o') and ('o','w') both appear twice;\n" +
      "# ('l','o') occurs earliest, so it wins the tie and both are merged.\n" +
      "res = bpe_merge_step(['l', 'o', 'w', 'e', 'r', 'l', 'o', 'w'])\n" +
      "assert res == ['lo', 'w', 'e', 'r', 'lo', 'w'], 'must merge the most frequent (earliest-tie) pair everywhere'\n\n" +
      "# a single clear winner\n" +
      "res2 = bpe_merge_step(['a', 'b', 'a', 'b', 'a', 'b', 'x', 'y'])\n" +
      "assert res2 == ['ab', 'ab', 'ab', 'x', 'y'], 'the majority pair (a,b) must be merged at every occurrence'\n\n" +
      "# greedy left-to-right consumption on overlaps\n" +
      "assert bpe_merge_step(['a', 'a', 'a']) == ['aa', 'a'], 'overlapping matches must be consumed greedily left to right'\n\n" +
      "# degenerate inputs unchanged\n" +
      "assert bpe_merge_step(['z']) == ['z'], 'a single-symbol list is returned unchanged'\n" +
      "assert bpe_merge_step([]) == [], 'an empty list is returned unchanged'\n",
    packages: ["numpy"],
    hints: [
      "First build a dict of adjacent-pair counts by walking i from 0 to len-2 over (tokens[i], tokens[i+1]).",
      "To pick the winner, minimize the key (-count, first_index): highest count wins, ties broken by earliest appearance.",
      "Rebuild the list with a while loop: when you see the winning pair, append the concatenation and advance i by 2; otherwise copy one token and advance by 1.",
    ],
  },

  {
    id: "precision-recall-at-k",
    title: "Precision@k and recall@k",
    topic: "Evaluation",
    difficulty: "core",
    prompt:
      "Implement `precision_recall_at_k(ranked, relevant, k)`.\n\n" +
      "`ranked` is a Python list of predicted item ids **ordered best-first**. `relevant` is a set (or iterable) of the ground-truth relevant ids. `k` is a positive integer.\n\n" +
      "Consider only the **top `k`** predicted ids. Return a tuple `(precision, recall)` where:\n\n" +
      "- `precision@k = (# of top-k that are relevant) / k`\n" +
      "- `recall@k = (# of top-k that are relevant) / (total # relevant)`\n\n" +
      "**Constraints:** count each relevant id at most once even if `ranked` repeats it within the top-k. If `relevant` is empty, define `recall = 0.0`. Return Python floats.",
    starter:
      "def precision_recall_at_k(ranked, relevant, k):\n" +
      "    # TODO: return (precision_at_k, recall_at_k) as a tuple of floats.\n" +
      "    return None\n",
    solution:
      "def precision_recall_at_k(ranked, relevant, k):\n" +
      "    relevant = set(relevant)\n" +
      "    topk = ranked[:k]\n" +
      "    hits = set(item for item in topk if item in relevant)\n" +
      "    precision = len(hits) / k\n" +
      "    recall = len(hits) / len(relevant) if relevant else 0.0\n" +
      "    return (float(precision), float(recall))\n",
    tests:
      "# 2 of the top-4 are relevant; 4 relevant total\n" +
      "ranked = [1, 2, 3, 4, 5, 6]\n" +
      "relevant = {2, 4, 8, 9}\n" +
      "p, r = precision_recall_at_k(ranked, relevant, 4)\n" +
      "assert abs(p - 0.5) < 1e-9, 'precision@4 should be 2/4 = 0.5'\n" +
      "assert abs(r - 0.5) < 1e-9, 'recall@4 should be 2/4 = 0.5'\n\n" +
      "# perfect top-2\n" +
      "p2, r2 = precision_recall_at_k([10, 20, 30], {10, 20}, 2)\n" +
      "assert abs(p2 - 1.0) < 1e-9 and abs(r2 - 1.0) < 1e-9, 'both hits in top-2 -> precision=recall=1'\n\n" +
      "# duplicates in the ranking count a relevant id only once\n" +
      "p3, r3 = precision_recall_at_k([7, 7, 7], {7}, 3)\n" +
      "assert abs(p3 - (1.0 / 3.0)) < 1e-9, 'a repeated relevant id counts once -> 1/3 precision'\n" +
      "assert abs(r3 - 1.0) < 1e-9, 'the single relevant id is retrieved -> recall 1'\n\n" +
      "# empty relevant set -> recall defined as 0\n" +
      "p4, r4 = precision_recall_at_k([1, 2, 3], set(), 3)\n" +
      "assert abs(p4 - 0.0) < 1e-9 and abs(r4 - 0.0) < 1e-9, 'no relevant items -> both 0'\n",
    packages: ["numpy"],
    hints: [
      "Slice the ranking to its first k elements, then count how many of them appear in the relevant set.",
      "Use a set of hits so a relevant id repeated inside the top-k is only counted once.",
      "precision divides the hit count by k; recall divides it by len(relevant) (guard against an empty relevant set to avoid division by zero).",
    ],
  },

  {
    id: "temperature-sampling-probs",
    title: "Temperature-scaled probabilities",
    topic: "Sampling",
    difficulty: "core",
    prompt:
      "Implement `temperature_probs(logits, T)`.\n\n" +
      "`logits` is a 1-D numpy array. `T` is a positive float temperature.\n\n" +
      "Return the probability distribution `softmax(logits / T)` as a numpy array that sums to `1`.\n\n" +
      "**Behavior:** `T = 1` is plain softmax; `T > 1` **flattens** the distribution toward uniform; `T < 1` **sharpens** it toward the argmax. The softmax must be numerically stable (subtract the max). This is deterministic: return the probabilities, do **not** draw a sample.",
    starter:
      "import numpy as np\n\n" +
      "def temperature_probs(logits, T):\n" +
      "    # TODO: return softmax(logits / T) as a probability array.\n" +
      "    raise NotImplementedError\n",
    solution:
      "import numpy as np\n\n" +
      "def temperature_probs(logits, T):\n" +
      "    logits = np.asarray(logits, dtype=float)\n" +
      "    z = logits / T\n" +
      "    z = z - np.max(z)\n" +
      "    e = np.exp(z)\n" +
      "    return e / np.sum(e)\n",
    tests:
      "import numpy as np\n\n" +
      "logits = np.array([2.0, 1.0, 0.0])\n\n" +
      "# T=1 is plain softmax (known value)\n" +
      "p1 = temperature_probs(logits, 1.0)\n" +
      "assert np.isclose(np.sum(p1), 1.0), 'probabilities must sum to 1'\n" +
      "expected = np.array([0.66524096, 0.24472847, 0.09003057])\n" +
      "assert np.allclose(p1, expected, atol=1e-6), 'T=1 must equal plain softmax'\n\n" +
      "# argmax is unchanged by temperature\n" +
      "hot = temperature_probs(logits, 0.5)\n" +
      "cold = temperature_probs(logits, 5.0)\n" +
      "assert np.argmax(hot) == 0 and np.argmax(cold) == 0, 'temperature must not move the argmax'\n\n" +
      "# T<1 sharpens: top prob rises above the T=1 baseline\n" +
      "assert hot[0] > p1[0], 'T<1 should sharpen (increase) the top probability'\n\n" +
      "# T>1 flattens: top prob falls toward uniform (1/3)\n" +
      "assert cold[0] < p1[0], 'T>1 should flatten the distribution'\n" +
      "assert np.max(cold) - np.min(cold) < np.max(p1) - np.min(p1), 'high T should reduce the spread'\n\n" +
      "# stability with large logits\n" +
      "big = temperature_probs(np.array([1000.0, 1002.0]), 1.0)\n" +
      "assert np.all(np.isfinite(big)) and np.isclose(np.sum(big), 1.0), 'must stay finite and normalized for large logits'\n",
    packages: ["numpy"],
    hints: [
      "Temperature scaling just divides the logits by T before the usual softmax.",
      "Dividing by a large T shrinks the gaps between logits (flatter distribution); dividing by a small T magnifies them (sharper).",
      "Keep it stable: after dividing by T, subtract the max, exponentiate, and normalize by the sum.",
    ],
  },

  {
    id: "bleu-unigram-bp",
    title: "Unigram BLEU with brevity penalty",
    topic: "Evaluation",
    difficulty: "advanced",
    prompt:
      "Implement `bleu_unigram(candidate, reference)` for a **single** candidate against **one** reference.\n\n" +
      "Both inputs are Python lists of token strings.\n\n" +
      "1. **Modified unigram precision:** for each distinct candidate token, its count in the candidate is **clipped** by its count in the reference; sum the clipped counts and divide by the total number of candidate tokens.\n" +
      "2. **Brevity penalty:** `BP = 1` if `len(candidate) > len(reference)`, else `BP = exp(1 - len(reference)/len(candidate))`.\n" +
      "3. Return `BP * precision` as a float.\n\n" +
      "**Edge cases:** if `candidate` is empty, return `0.0`. Clipping means a token repeated more often than in the reference does not get full credit.",
    starter:
      "import numpy as np\n\n" +
      "def bleu_unigram(candidate, reference):\n" +
      "    # TODO: clipped unigram precision * brevity penalty\n" +
      "    return None\n",
    solution:
      "import numpy as np\n" +
      "from collections import Counter\n\n" +
      "def bleu_unigram(candidate, reference):\n" +
      "    if len(candidate) == 0:\n" +
      "        return 0.0\n" +
      "    cand_counts = Counter(candidate)\n" +
      "    ref_counts = Counter(reference)\n" +
      "    clipped = sum(min(c, ref_counts.get(tok, 0)) for tok, c in cand_counts.items())\n" +
      "    precision = clipped / len(candidate)\n" +
      "    if len(candidate) > len(reference):\n" +
      "        bp = 1.0\n" +
      "    else:\n" +
      "        bp = float(np.exp(1.0 - len(reference) / len(candidate)))\n" +
      "    return float(bp * precision)\n",
    tests:
      "import numpy as np\n\n" +
      "# exact match: precision 1, BP 1 (same length) -> 1.0\n" +
      "assert np.isclose(bleu_unigram(['the', 'cat', 'sat'], ['the', 'cat', 'sat']), 1.0), 'identical sequences -> BLEU 1'\n\n" +
      "# clipping: candidate 'the the the the' vs reference with two 'the'.\n" +
      "# clipped precision = 2/4 = 0.5; lengths 4 vs 7 -> BP = exp(1 - 7/4).\n" +
      "cand = ['the', 'the', 'the', 'the']\n" +
      "ref = ['the', 'cat', 'sat', 'on', 'the', 'warm', 'mat']\n" +
      "expected = np.exp(1.0 - 7.0 / 4.0) * (2.0 / 4.0)\n" +
      "assert np.isclose(bleu_unigram(cand, ref), expected, atol=1e-9), 'clipped precision * BP mismatch'\n\n" +
      "# a shorter candidate is penalized relative to the same-precision full-length one\n" +
      "full = ['the', 'cat', 'sat', 'on', 'the', 'mat']\n" +
      "short = ['the', 'cat']\n" +
      "ref2 = ['the', 'cat', 'sat', 'on', 'the', 'mat']\n" +
      "score_full = bleu_unigram(full, ref2)\n" +
      "score_short = bleu_unigram(short, ref2)\n" +
      "assert np.isclose(score_full, 1.0), 'full correct candidate scores 1'\n" +
      "assert score_short < score_full, 'a short candidate must be penalized by the brevity penalty'\n" +
      "assert np.isclose(score_short, np.exp(1.0 - 6.0 / 2.0) * 1.0, atol=1e-9), 'short-candidate BP value mismatch'\n\n" +
      "# empty candidate\n" +
      "assert bleu_unigram([], ['a', 'b']) == 0.0, 'empty candidate must return 0.0'\n\n" +
      "# no overlap -> precision 0 -> score 0\n" +
      "assert np.isclose(bleu_unigram(['x', 'y'], ['a', 'b']), 0.0), 'no matching unigrams -> 0'\n",
    packages: ["numpy"],
    hints: [
      "Count tokens in both sequences (collections.Counter). For each candidate token, credit is min(count_in_candidate, count_in_reference) — that is the clipping.",
      "Modified precision = (sum of clipped counts) / (total candidate tokens).",
      "Brevity penalty is 1 when the candidate is longer than the reference, otherwise exp(1 - len(ref)/len(cand)); multiply it by the precision.",
    ],
  },
];
