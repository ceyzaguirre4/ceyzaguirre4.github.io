---
layout: post
mathjax: true
comments: true
title: Differentiable Adaptive Computation Time for Visual Reasoning
---

We've created DACT, a new algorithm for achieving adaptive computation time that, unlike existing approaches, is fully differentiable and can work in conjunction with complex models.
DACT replaces hard limits and piecewise functions with inductive biases to allow the network to choose during evaluation the amount of computation needed for the current input.
The resulting models learn the tradeoff between precision and complexity and actively adapt their architectures accordingly.
Our paper shows that, when applied to the widely known MAC architecture and the visual reasoning task, DACT can improve interpretability, make the model more robust to relevant hyperparameter changes, all while increasing the performance to computation ratio.


## The Setting: Visual Question Answering

Visual Question Answering (VQA) is a task where, for a given input image, question pair, we expect the model to return an answer.
The difficulty of the task lies in the openness for both the question and image: because any image or plain-text question are valid expecting the model to output convincing answers can be seen as a more general Turing-test.
These datasets pose challenging natural language questions about images whose solution requires the use of perceptual abilities, such as recognizing objects or attributes, identifying spatial relations, or implementing high-level capabilities like counting.
For example, in the images below we see examples of two very similar (counting) questions for images from the Visual Genome dataset that necessitate the understanding of the relation holding and a general purpose counting algorithm.

| ![](/images/dact/tennis1.png) | | ![](/images/dact/tennis2.png)  |
|:--:|:--:|:--:|
| <em style="font-size: 0.8em">How many balls is the kid holding?</em> | | <em style="font-size: 0.8em">How many birds is he holding?</em>|
| | | |

---

In open tasks such as this we often find instances that entail different levels of complexity.
However, most DL based models have fixed processing pipelines whose computation is independent of the input/output relation.
We argue that dealing with this openness is paramount for more general intelligence and propose Adaptive Computation Time algorithms such as ACT [1](https://arxiv.org/abs/1603.08983) as a possible solution.
The following images show two examples from the CLEVR dataset where the variability in question complexity is exemplified.
Specifically, while the first question involves just the identification of a specific attribute from a specific object, the second question requires the identification and comparative analysis of several attributes from several objects.

![](/images/dact/clevr_eg.png)
*Examples of questions in the CLEVR dataset that show a significant variation in the number of reasoning steps that are needed to answer them correctly.*

<!-- {% include image.html url="/images/dact/clevr_eg.png" description="Examples of questions in the CLEVR dataset that show a significant variation in the number of reasoning steps that are needed to answer them correctly." %} -->

---

## Existing Adaptive Approaches



<!-- | ![](/images/dact/corr_compare.png) |
|:--:|
| *DACT enabled MACs are capable of actively allocating more computational resources to questions that need them* | -->


## Results

![](/images/dact/corr_compare.png)
*DACT enabled MACs are capable of actively allocating more computational resources to questions that need them. The figure shows how many steps are used by adaptive MACs for each question family in the CLEVR dataset. In the first image (`a`) the existing algorithm ACT fails to learn how to answer the most straightforward questions in less than three steps, or the hardest in more than five. The other two images show DACT using most of the available spectrum, significantly improving the model performance-to-computation ratio.*
