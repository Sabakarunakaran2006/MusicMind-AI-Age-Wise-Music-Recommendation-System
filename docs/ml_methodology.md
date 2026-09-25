# MusicMind AI – Machine Learning & Recommendation Methodology

## 1. Mathematical Model Formulation

The recommendation engine in **MusicMind AI** is designed to solve the **cold-start demographic problem** and provide **content-based acoustic vector personalization**.

### 1.1 Audio Feature Representation Space
Each song $\mathbf{s}_i$ in the catalog is embedded into a normalized 5-dimensional acoustic feature space:
$$\mathbf{s}_i = \begin{bmatrix} \tilde{\tau}_i \\ e_i \\ v_i \\ d_i \\ \tilde{y}_i \end{bmatrix}$$

Where:
* $\tilde{\tau}_i \in [0, 1]$: MinMax normalized tempo: $\tilde{\tau}_i = \frac{\tau_i - 50}{200 - 50}$
* $e_i \in [0, 1]$: Audio energy / acoustic intensity
* $v_i \in [0, 1]$: Musical valence (psychological positivity / euphoria)
* $d_i \in [0, 1]$: Danceability (rhythmic regularity and beat strength)
* $\tilde{y}_i \in [0, 1]$: MinMax normalized release year: $\tilde{y}_i = \frac{y_i - 1960}{2026 - 1960}$

---

## 2. Target Query Vector Construction

A target listening state vector $\mathbf{q}$ is constructed based on listener context:

### 2.1 Mood Centroid Mapping
Preset mood states are mapped to empirical psychoacoustic centroids:
* **Energetic**: $\tau=132 \text{ BPM}, e=0.88, v=0.75, d=0.82$
* **Happy**: $\tau=122 \text{ BPM}, e=0.75, v=0.90, d=0.78$
* **Chill**: $\tau=92 \text{ BPM}, e=0.38, v=0.55, d=0.50$
* **Melancholic**: $\tau=84 \text{ BPM}, e=0.32, v=0.22, d=0.42$
* **Focus**: $\tau=105 \text{ BPM}, e=0.42, v=0.50, d=0.48$
* **Party**: $\tau=128 \text{ BPM}, e=0.92, v=0.85, d=0.90$

### 2.2 Warm-Start Profile Blending
For listeners with history or favorites, an empirical profile vector $\mathbf{p}_{\text{user}}$ is computed from the centroid of their favorited and $\ge 4$-star rated tracks:
$$\mathbf{p}_{\text{user}} = \frac{1}{|F|} \sum_{s \in F} \mathbf{s}$$

The query vector blends current mood context with historical profile:
$$\mathbf{q}_{\text{final}} = 0.60 \cdot \mathbf{p}_{\text{user}} + 0.40 \cdot \mathbf{q}_{\text{mood}}$$

For cold-start listeners without interactions, $\mathbf{q}_{\text{final}} = \mathbf{q}_{\text{mood}}$ with demographic cohort prior initialization.

---

## 3. Cosine Similarity & Composite Hybrid Ranking

### 3.1 Cosine Similarity
Cosine similarity measures the orientation harmony between the target vector $\mathbf{q}$ and each song candidate $\mathbf{s}_i$:
$$\text{Sim}(\mathbf{q}, \mathbf{s}_i) = \frac{\mathbf{q} \cdot \mathbf{s}_i}{\|\mathbf{q}\|_2 \|\mathbf{s}_i\|_2} = \frac{\sum_{j=1}^5 q_j s_{ij}}{\sqrt{\sum_{j=1}^5 q_j^2} \sqrt{\sum_{j=1}^5 s_{ij}^2}}$$

### 3.2 Composite Ranking Function
The final recommendation score $S(\mathbf{s}_i)$ combines feature similarity with demographic priors and user feedback:
$$S(\mathbf{s}_i) = w_1 \cdot \text{Sim}(\mathbf{q}, \mathbf{s}_i) + w_2 \cdot B_{\text{genre}} + w_3 \cdot B_{\text{age}} + w_4 \cdot B_{\text{lang}} + \Delta_{\text{feedback}} - \delta_{\text{recency}}$$

Default parameter weights:
* $w_1 = 0.40$ (Acoustic vector cosine similarity)
* $w_2 = 0.28$ (Genre preference affinity bonus)
* $w_3 = 0.20$ (Age cohort demographic resonance bonus)
* $w_4 = 0.12$ (Language alignment bonus)
* $\Delta_{\text{feedback}} = (r_i - 3) \times 0.08$ where $r_i \in [1, 5]$ is listener star rating
* $\delta_{\text{recency}} = 0.08$ (Serendipity discovery penalty for recently played non-favorited tracks)

---

## 4. Evaluation Methodology

The model evaluation module (`backend/app/ml/evaluator.py`) evaluates model quality against real interactions:

### 4.1 Precision@K
Measures the fraction of top-$K$ recommendations that the listener approved (favorited or rated $\ge 4$ stars):
$$\text{Precision@}K = \frac{|\text{Top-}K \cap \text{GroundTruth}|}{K}$$

### 4.2 Recall@K
Measures the coverage of the listener's liked items captured in the top-$K$:
$$\text{Recall@}K = \frac{|\text{Top-}K \cap \text{GroundTruth}|}{|\text{GroundTruth}|}$$

### 4.3 Normalized Discounted Cumulative Gain (NDCG@K)
Evaluates ranking quality, giving higher credit to relevant tracks surfaced near the top of the list:
$$\text{DCG@}K = \sum_{i=1}^K \frac{\mathbb{I}(\text{item}_i \in \text{GroundTruth})}{\log_2(i + 1)}, \quad \text{NDCG@}K = \frac{\text{DCG@}K}{\text{IDCG@}K}$$

### 4.4 Catalog Coverage
Measures the diversity and exploration ability of the recommendation engine across the catalog:
$$\text{Coverage} = \frac{|\bigcup_{u \in U} \text{Top-}K_u|}{|C|} \times 100\%$$

Where $|C|$ is the total number of songs in the catalog.
