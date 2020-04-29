---
layout: post
mathjax: true
comments: true
title: Differentiable Adaptive Computation Time for Visual Reasoning (CVPR 2020)
---

We've created DACT [\[{% increment ref_count %}\]](http://arxiv.org/abs/2004.12770), a new algorithm for achieving adaptive computation time that, unlike existing approaches, is fully differentiable and can work in conjunction with complex models.
DACT replaces hard limits and piecewise functions with inductive biases to allow the network to choose during evaluation the amount of computation needed for the current input.
The resulting models learn the tradeoff between precision and complexity and actively adapt their architectures accordingly.
Our paper shows that, when applied to the widely known MAC architecture and the visual reasoning task, DACT can improve interpretability, make the model more robust to relevant hyperparameter changes, all while increasing the performance to computation ratio.

{% assign ref_count = 1 %}

[LINK TO PREPRINT \[0\]](http://arxiv.org/abs/2004.12770)

[LINK TO CODE](https://github.com/ceyzaguirre4/DACT-MAC)

---

## The Setting: Visual Question Answering

{% include table.html img1="/images/dact/tennis1.png" img2="/images/dact/tennis2.png" description1="How many balls is the kid holding?" description2="How many birds is he holding?" %}

Visual Question Answering (VQA) [\[{% increment ref_count %}\]](https://visualqa.org) is a task where, for a given input image, question pair, we expect the model to return an answer.
The difficulty of the task lies in the openness for both the question and image: because any image or plain-text question are valid expecting the model to output convincing answers can be seen as a more general Turing-test.
These datasets pose challenging natural language questions about images whose solution requires the use of perceptual abilities, such as recognizing objects or attributes, identifying spatial relations, or implementing high-level capabilities like counting.
For example, in the images above we see examples of two very similar (counting) questions for images from the Visual Genome dataset [\[{% increment ref_count %}\]](https://visualgenome.org) that necessitate the understanding of the relation holding and a general purpose counting algorithm.

<!--
![](/images/dact/clevr_eg.png)
*Examples of questions in the CLEVR dataset that show a significant variation in the number of reasoning steps that are needed to answer them correctly.* -->


{% include table.html img1="/images/dact/clevr_eg.png" description1="Examples of questions in the CLEVR dataset that show a significant variation in the number of reasoning steps that are needed to answer them correctly." %}


In open tasks such as this we often find instances that entail different levels of complexity.
However, most DL based models have fixed processing pipelines whose computation is independent of the input/output relation.
We argue that dealing with this openness is paramount for more general intelligence and propose Adaptive Computation Time algorithms such as ACT [\[{% increment ref_count %}\]](https://arxiv.org/abs/1603.08983) as a possible solution.
The figure above shows two examples from the CLEVR dataset [\[{% increment ref_count %}\]](http://cs.stanford.edu/people/jcjohns/clevr/) where the variability in question complexity is exemplified.
Specifically, while the first question involves just the identification of a specific attribute from a specific object, the second question requires the identification and comparative analysis of several attributes from several objects.

---

## Existing Adaptive Approaches

### 1. Modular Networks

{% include table.html img1="/images/dact/modules_spec.png" description1="Specialized Modules" img2="/images/dact/modules_gen.png" description2="General Purpose Module" %}

We consider modular networks those where modules are combined from a collection processing modules.
Here we distinguish between two kinds:
- those in which a controller selects the appropriate module (eg. IEP [\[{% increment ref_count %}\]](https://arxiv.org/abs/1705.03633) show in figure).
- those where a single module is used repeatedly for a fixed number of times (eg. MAC [\[{% increment ref_count %}\]](https://arxiv.org/abs/1803.03067) shown in figure).

In the case of specialized modules, the generation of the sequences required costly supervision or elaborate reinforcement learning training schemes.
In the case of a general purpose module, the selection of the module to execute is trivial (only one), however, the number of steps to apply this module cannot be determined for each sample, instead its value is fixed as a hyper-parameter.
In our work, we build upon one of these networks by replacing this fixed hyper-parameter by an adaptive approach to select the horizon of the computational pipeline.

### 2. ACT

An algorithm for adaptive computation already existed, ACT.
It works by forcing that the weights used to combine each step’s output into the final answer sum exactly one.
To achieve this a non-differentiable piecewise function is used, namely: if the sum of the weights is more than one, then change the last weight so that the sum is exactly one.
In contrast, our approach maintains the full gradient by only halting during evaluation (and not during training).
The weights used to combine all the step output’s are described by a monotonically decreasing probability distribution that implicitly includes future steps yet to be computed.
The result is a fully differentiable model for training with gradient descent whose computation can be reduced during inference by mathematically determining when the interruption cannot change the output.


---

## How it works

{% include table.html img1="/images/dact/diagram.png" description1="The final answer Y is built up from the sub-answers from each module. The maximum contribution of any one of these steps is limited by all earlier ones, and any step can choose to limit contribution of subsequent ones." %}

Our formulation can be applied to any model or ensemble that can be decomposed as a series of modules or submodels $m_n$, $n ∈ [1,...,N]$ that can be ordered by complexity.
For example, recurrent networks are composed by iterative steps, CNNs by residual blocks, and ensembles by smaller models.
We refer to the composition as our final model or ensemble $M$, and to its output as $Y$.
This work focusses on its application to a recurrent visual reasoning architecture called MAC.

The core of the DACT algorithm is that any step can limit the total contribution of subsequent steps.
To achieve this we use the sigmoidal halting values $h_n \in \left] 0, 1 \right[ $ to inductively define $p_n$ as:

$$
  p_n = \prod_{i=1}^{n}h_{i} = h_{n} p_{n-1}
$$

We observe that $p_n$ is monotonically decreasing for increasing values of $n$.
Through their halting values each $n$th step can choose to either maintain the probability ($h_n \approx 1$) or reduce it ($h_n < 1$).
The value of $p_n$ can be interpreted as the probability that a subsequent step might change the value of the final answer.
Consequently, we define the initial value $p_0 = 1$.

The final answer $Y$ is built incrementally using the sub-answers of each step using accumulator variables $a_n$ for $n \in [1 \dots N]$ such that $Y = a_N$:

$$
  a_n = \begin{cases}
    \overrightarrow{0} & \text{if } n=0\\
    y_n p_{n-1} + a_{n-1} \left( 1 - p_{n-1} \right) & \text{otherwise}
  \end{cases}
$$

It follows from this definition that $Y$ can always be rewritten as a weighted sum of intermediate outputs $y_n$.
The relative relevance of each $y_n$ to the final output is thus constrained by $p_{n-1}$ which in turn is constrained by the $h_n$s of earlier steps.

We observe that this means that, for some step $n$ with low associated $p_n$, then $a_n \approx Y$.

### Putting it all together...

During evaluation / test we want to identify the step where $a_n \approx Y$ to halt computation.
How you choose to define $\approx$ in your code depends on you and the use-case.
For this work we say that $a_n$ is similar enough to $Y$ once we are sure that the class with highest probability in $a_n$ is the same as in $Y$.

~~~python
N = max_steps
for n in [1 ... N]:
    # run another step
    answer = run_module()

    # halt if answer cant change
    if not answer_can_change():
        break
~~~

We say that the answer cannot change when the top class in $a_n$ will necessarily be the same as in $Y$ after all $d = N - n$ remaining steps.
In particular, we are interested in checking if it's possible that the probability associated to the *runner up* (second best) class $c^{ru}$ can surpass that of the top class ($c^\*$).

~~~python
def answer_can_change():
    d = N - n

    # get top and runner-up classes
    c_star = get_max_class(answer)
    c_ru = get_ru_class(answer)

    # check if answer cant change
    if min_p(c_star, d) >= max_p(c_ru, d):
        return False
    else:
        return True
~~~

The top answer is most likely to change if all $d$ remaining steps assign probability $0$ to $c^\*$ and $1$ to $c^{ru}$.
This scenario is the worst case from the perspective of the stability of the answer as it leads to the minimum value that the class $c^\*$ can take in $Y$; along with the maximum value for $c^{ru}$.

Then, after expanding the inductive definition of $a_n$ and replacing the worst-case probabilities we derive:

$$
  \min(\mathit{c^*}, N) \geq P(c^*, n)(1-p_n)^d
$$

$$
  \max(\mathit{c^{ru}}, N) \leq P(c^{ru}, n) + p_n d
$$

Mathematically, this means the *halting condition* is achieved when:

$$
  P(c^*, n)(1-p_n)^d \geq P(c^{ru}, n) + p_n d
$$

*(The math and some additional proofs are included in the paper.)*

Finally, we add $\rho = \sum_{n=1}^{N} p_n$, a proxy of the total computation, to the loss function to encourage reduced computation:

$$
  \hat{L} (x, y) = L (x, y) + \tau \rho(x)
$$

---

## Results: CLEVR

### 1. Accuracy - Complexity Tradeoff

{% include table.html img1="/images/dact/mac_steps_acc.png" description1="Scatterplot of computation (in steps) vs. precision." img2="/images/dact/convergence.png" description2="Learning curves for different regularization values."%}

As the scatterplot above shows, DACT enabled MACs (in color) consistently outperform vanilla MACs (shown as diamonds) when both use comparable average numbers of steps.
ACT on the other hand only performs as well or bellow as comparable MACs.
Additionally, the figure shows that DACT responds predictably to changes in the penalty or *ponder cost* $\tau$ used (represented by the color), iterating fewer times when more penalty is used.
This again contrasts with ACT which proved to be insensitive to the *ponder cost*.
For instance, ACT without ponder cost ($\tau$ = 0.0) performs 3.2 steps on average and obtains an accuracy of 95.8%.

### 2. Complexity Adaptivity

{% include table.html img1="/images/dact/corr_compare.png" description1="How many steps are used by adaptive MACs for each question family in the CLEVR dataset." %}

The motivation behind using adaptive algorithms for this task is to use less computation for the more straightforward questions while still being able to use more computation for difficult ones.
In the figure above **a)** shows the existing algorithm (ACT) failing to learn how to answer the most straightforward questions in less than three steps, or the hardest in more than five.
The other two images show DACT using most of the available spectrum, showing that DACT enabled MACs are capable of actively allocating more computational resources to questions that need them.
The second image **b)** shows a variant of DACT that averages approximately the same number of steps as **a)**, while **c)** shows a DACT-MAC with lower ponder cost, which uses 50% more reasoning steps on average and thus achieves even better performance.

The figure shows questions clustered by family type which translates to groups that require similar step sequences to solve.
The fact that DACT shows a remarkable correlation between computation and question family despite not including any type of supervision about these factors evinces the learning of meaningful patterns that correlate with question complexity.
The full *heatmap* that shows an example for each question family can be found [here](/images/dact/corrs_full.png).

### 3. Interpretability

{% include table.html img1="/images/dact/AttsComp.png" description1="Visual and linguistic attention maps for both regular MAC (left) and DACT-MAC (right)." %}

Besides the obvious and substantial reduction in the number of steps used to answer, our model also contributes to the overall interpretability of the inference.
This is achieved by adding a proxy of the number of steps taken to the loss function, effectively coercing the model into only using fewer (and therefore more likely to be semantically strong) steps.
This translates into more interpretable models.
For instance, the question attentions above show that the last two steps are similar for both models, but that only one of the other ten steps used by MAC was necessary.

Additionally, the values of $p_n$ and the sub answers $a_n$ provide further insights.

---

## Bonus Results: GQA

Finally, in order to evaluate the generality of the suggested approach to real data, we evaluate the combined DACT-MAC architecture on the more diverse images and questions in the GQA dataset [\[{% increment ref_count %}\]](https://arxiv.org/abs/1902.09506).

**Method** | **Ponder Cost** | **Steps** | **Accuracy**
| :---: | :---: | :---: | :---: |
MAC+Gate | NA | 2 | 77.51
MAC+Gate | NA | 3 | 77.52
MAC+Gate | NA | 4 | 77.52
MAC+Gate | NA | 5 | 77.36
MAC+Gate | NA | 6 | 77.37
| :---: | :---: | :---: | :---: |
ACT | 1e-2 | 1.99 | 77.17
ACT | 1e-3 | 2.26 | 77.04
ACT | 1e-4 | 2.31 | 77.21
ACT | 0 | 2.15 | 77.20
| :---: | :---: | :---: | :---: |
DACT | 5e-2 | 1.63 | 77.23
DACT | 1e-2 | 2.77 | 77.26
DACT | 5e-3 | 3.05 | 77.35
DACT | 1e-3 | 3.69 | 77.31
| :---: | :---: | :---: | :---: |

We find that increasing computational steps doesn’t benefit the chosen architecture (MAC), and therefore adapting computation won't increase performance.
However, by adding DACT to a pre-trained 4-step MAC and then fine-tuning we find that it again outperforms the existing algorithm in terms of accuracy and responsiveness to *ponder cost*.


{% include table.html img1="/images/dact/corrs_gqa.png" description1="How many steps are used by DACT-MACs for each question type in the GQA dataset." %}

Additionally, we find that DACT-MACs adapt the 4-step algorithm reducing computation on some question types, and that the number of steps again correlate strongly with *question types* as can be seen in the *heatmaps* above.
The same figures also show how the architecture adapts to changes in the *ponder cost*, as this penalty decreases DACT adaptively allocates more resources to more complex questions.
The full *heatmap* that shows the question types can be found [here](/images/dact/corrs_full_gqa.png).

---

## Cite

~~~bibtex
@misc{eyzaguirre2020differentiable,
    title={Differentiable Adaptive Computation Time for Visual Reasoning},
    author={Cristobal Eyzaguirre and Alvaro Soto},
    year={2020},
    eprint={2004.12770},
    archivePrefix={arXiv},
    primaryClass={cs.AI}
}
~~~
